import React, { useState, useEffect } from 'react';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {collection, collectionGroup, getDocs, query, where} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ApexCharts from 'apexcharts';
import FloatingSpheresAnimation from "./FloatingSphereAnimation.jsx";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
    const [taskPercentages, setTaskPercentages] = useState({ todo: 0, doing: 0, done: 0 });
    const [taskCounts, setTaskCounts] = useState({ todo: 0, doing: 0, done: 0 });
    const [allTasks, setAllTasks] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('all');
    const auth = getAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectsAndTasks = async (userId) => {
            // Fetch owned projects
            const ownedProjectsRef = collection(db, `projects/${userId}/projects`);
            const ownedProjectsSnapshot = await getDocs(ownedProjectsRef);

            let allProjects = ownedProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), owner: userId }));

            // Fetch projects where the user is a collaborator
            const allProjectsRef = collectionGroup(db, "projects");
            const collaboratorProjectsQuery = query(allProjectsRef, where("collaborators", "array-contains", userId));
            const collaboratorProjectsSnapshot = await getDocs(collaboratorProjectsQuery);

            collaboratorProjectsSnapshot.forEach(doc => {
                // Avoid duplicates in case the user is both owner and collaborator
                if (!allProjects.find(project => project.id === doc.id)) {
                    allProjects.push({ id: doc.id, ...doc.data(), owner: doc.ref.parent.parent.id }); // Include the owner's UID
                }
            });

            let allTasks = [];
            let projectOptions = [{ id: 'all', name: 'All Projects' }];

            // Iterate over all projects to fetch tasks
            for (const project of allProjects) {
                const projectId = project.id;
                const projectName = project.name;
                projectOptions.push({ id: projectId, name: projectName });

                if (selectedProject === 'all' || selectedProject === projectId) {
                    const tasksRef = collection(db, `projects/${project.owner}/projects/${projectId}/tasks`);
                    const tasksSnapshot = await getDocs(tasksRef);
                    tasksSnapshot.forEach((doc) => {
                        allTasks.push({ ...doc.data(), projectId: projectId, projectName: projectName });
                    });
                }
            }

            // Calculate the latest end date for each project
            const projectsWithEndDate = allProjects.map(project => {
                const projectTasks = allTasks.filter(task => task.projectId === project.id);
                const latestEndDate = projectTasks.reduce((latest, currentTask) => {
                    const currentEndDate = new Date(currentTask.endDate);
                    return latest > currentEndDate ? latest : currentEndDate;
                }, new Date(0)); // Start with the oldest possible date
                const timeLeft = remainingTime(latestEndDate);
                return { ...project, latestEndDate, remainingTime: timeLeft };
            });

            // Update state with fetched data
            setProjects([{ id: 'all', name: 'All Projects' }, ...projectsWithEndDate]);
            setAllTasks(allTasks);

            const counts = allTasks.reduce((acc, task) => {
                if (task.status === 'To do') acc.todo++;
                else if (task.status === 'Doing') acc.doing++;
                else if (task.status === 'Done') acc.done++;
                return acc;
            }, { todo: 0, doing: 0, done: 0 });

            setTaskCounts(counts);

            const totalTasks = allTasks.length;
            const percentages = {
                todo: totalTasks > 0 ? (counts.todo / totalTasks * 100) : 0,
                doing: totalTasks > 0 ? (counts.doing / totalTasks * 100) : 0,
                done: totalTasks > 0 ? (counts.done / totalTasks * 100) : 0,
            };

            setTaskPercentages(percentages);
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoading(true);
                fetchProjectsAndTasks(user.uid).finally(() => setLoading(false));
            }
        });

        return () => unsubscribe();
    }, [auth, selectedProject]);


    useEffect(() => {
        const getChartOptions = () => {
            return {
                series: [parseFloat(taskPercentages.done), parseFloat(taskPercentages.doing), parseFloat(taskPercentages.todo)],
                colors: ["#1C64F2", "#16BDCA", "#FDBA8C"],
                chart: {
                    height: "380px",
                    width: "100%",
                    type: "radialBar",
                    sparkline: {
                        enabled: true,
                    },
                },
                plotOptions: {
                    radialBar: {
                        track: {
                            background: '#E5E7EB',
                        },
                        dataLabels: {
                            show: false,
                        },
                        hollow: {
                            margin: 0,
                            size: "32%",
                        }
                    },
                },
                grid: {
                    show: false,
                    strokeDashArray: 4,
                    padding: {
                        left: 2,
                        right: 2,
                        top: -23,
                        bottom: -20,
                    },
                },
                labels: ["Done", "Doing", "To do"],
                legend: {
                    show: true,
                    position: "bottom",
                    fontFamily: "Inter, sans-serif",
                },
                tooltip: {
                    enabled: true,
                    x: {
                        show: false,
                    },
                },
                yaxis: {
                    show: false,
                    labels: {
                        formatter: function (value) {
                            return value + '%';
                        }
                    }
                }
            };
        };

        if (document.getElementById("radial-chart") && typeof ApexCharts !== 'undefined') {
            const chart = new ApexCharts(document.querySelector("#radial-chart"), getChartOptions());
            chart.render();
        }
    }, [taskPercentages]);

    useEffect(() => {
        // Determine upcoming tasks from all tasks, not affected by project filter
        const upcoming = allTasks.filter(task => isUpcoming(new Date(task.endDate)));
        setUpcomingTasks(upcoming);
    }, [allTasks]);

    const handleProjectChange = (event) => {
        setSelectedProject(event.target.value);
    };

    const isUpcoming = (endDate) => {
        const today = new Date();
        const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        return endDate >= today && endDate <= nextWeek;
    };

    const remainingTime = (endDate) => {
        const now = new Date();
        const timeDiff = endDate - now;
        if (timeDiff < 0) {
            return null; // Past date
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    };

    useEffect(() => {
        // Only set up the interval if there are projects
        if (projects.length > 1) {
            const intervalId = setInterval(() => {
                // Update the remaining time for each project
                setProjects(currentProjects => currentProjects.map(project => {
                    if (project.latestEndDate) {
                        const updatedTime = remainingTime(new Date(project.latestEndDate));
                        return { ...project, remainingTime: updatedTime };
                    }
                    return project;
                }));
            }, 1000);

            // Clear the interval when the component unmounts or projects change
            return () => clearInterval(intervalId);
        }
    }, [projects]); // Dependency on projects ensures this effect runs when projects update

    return (
        <div>
            {loading && (
                <div className="flex items-center justify-center min-h-screen">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            )}
            {!loading && projects.length <= 1 && (
                <>
                    <FloatingSpheresAnimation />
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center z-10 relative"> {/* Ensure content is above the animation using z-index */}
                            <h2 className="text-2xl font-bold mb-4">Welcome to Planthara!</h2>
                            <p className="mb-4">You don't have any projects yet. Start by creating your first project.</p>
                            <button className="btn glass" onClick={() => {navigate('/projects')}}>Let's Go!</button>
                        </div>
                    </div>
                </>
            )}
            {!loading && projects.length > 1 && (
                <div className="flex flex-wrap justify-center gap-4 py-6">
                    <div className="card max-w-sm w-full shadow-2xl p-4 md:p-6">
                        <div className="flex justify-between mb-3">
                            <div className="flex items-center">
                                <div className="flex justify-center items-center">
                                    <h5 className="text-xl font-bold leading-none">Tasks Progress</h5>
                                    <div className="tooltip" data-tip="Summary of task progress.">
                                        <button className="flex items-center">
                                            <svg className="w-3.5 h-3.5 text-gray-500 hover:text-gray-900 cursor-pointer ms-1" aria-hidden="true" fill="none" viewBox="0 0 20 20">
                                                <path fill="currentColor" d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <select onChange={handleProjectChange} value={selectedProject} className="select select-bordered select-sm w-full max-w-xs">
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>{project.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-base-200 p-3 rounded-lg">
                            <div className="grid grid-cols-3 gap-3 mb-2">
                                <div className="bg-orange-50 rounded-lg flex flex-col items-center justify-center h-[78px]">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-sm font-medium flex items-center justify-center mb-1">{taskCounts.todo}</div>
                                    <div className="text-orange-600 text-sm font-medium">To do</div>
                                </div>
                                <div className="bg-teal-50 rounded-lg flex flex-col items-center justify-center h-[78px]">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 text-sm font-medium flex items-center justify-center mb-1">{taskCounts.doing}</div>
                                    <div className="text-teal-600 text-sm font-medium">Doing</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg flex flex-col items-center justify-center h-[78px]">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center mb-1">{taskCounts.done}</div>
                                    <div className="text-blue-600 text-sm font-medium">Done</div>
                                </div>
                            </div>
                        </div>

                        {/* Radial Chart */}
                        <div className="py-6" id="radial-chart">
                            {/* Chart will be rendered here */}
                        </div>
                    </div>
                    <div className="card max-w-sm w-full shadow-2xl p-4 md:p-6">
                        <div className="flex justify-center items-center">
                            <h2 className="text-xl font-bold leading-none p-4">Upcoming Tasks</h2>
                            <div className="tooltip" data-tip="Tasks that are close to their due dates.">
                                <button className="flex items-center">
                                    <svg className="w-3.5 h-3.5 text-gray-500 hover:text-gray-900 cursor-pointer ms-1" aria-hidden="true" fill="none" viewBox="0 0 20 20">
                                        <path fill="currentColor" d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-96 space-y-4">
                            {upcomingTasks.length > 0 ? (
                                upcomingTasks.map((task, index) => (
                                    <div key={index} className="bg-base-200 p-3 rounded-lg flex justify-between items-center">
                                        <span className="text-gray-700">{task.name}</span>
                                        <span className={`badge ${task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>{task.priority}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="card bg-accent">
                                    <div className="card-body items-center text-center">
                                        <h2 className="card-title">You are all caught up!</h2>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="card max-w-xl w-full bg-base-100 shadow-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Project Deadlines</h2>
                        </div>
                        <div className="overflow-y-auto max-h-96" style={{ padding: "10px" }}>
                            {projects.filter(project => project.id !== 'all').map((project, index) => (
                                <div key={index} className="border rounded-box border-base-300 mb-4 p-4">
                                    <div className="text-lg font-medium">{project.name}</div>
                                    {project.latestEndDate && (
                                        <div className="grid grid-flow-col gap-4 text-center mt-4">
                                            <div className="stats shadow">
                                                <div className="stat">
                                                    <div className="stat-title">Days</div>
                                                    <div className="stat-value text-3xl">{project.remainingTime.days}</div>
                                                </div>
                                                <div className="stat">
                                                    <div className="stat-title">Hours</div>
                                                    <div className="stat-value text-3xl">{project.remainingTime.hours}</div>
                                                </div>
                                                <div className="stat">
                                                    <div className="stat-title">Minutes</div>
                                                    <div className="stat-value text-3xl">{project.remainingTime.minutes}</div>
                                                </div>
                                                <div className="stat">
                                                    <div className="stat-title">Seconds</div>
                                                    <div className="stat-value text-3xl">{project.remainingTime.seconds}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;