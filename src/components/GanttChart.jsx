import React, { useEffect, useState } from "react";
import { ViewMode, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "../GanttHelper/view-switcher.jsx";
import {
    getStartEndDateForProject,
} from "../GanttHelper/GanttHelper.jsx";
import "gantt-task-react/dist/index.css";
import 'tailwindcss/tailwind.css';
import 'daisyui/dist/full.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {collection, collectionGroup, getDocs, query, where} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Tasks from "./Tasks.jsx";
import {Link} from "react-router-dom";

const GanttChart = () => {
    const [view, setView] = useState(ViewMode.Day);
    const [tasks, setTasks] = useState([]);
    const [isChecked, setIsChecked] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setLoading(true);

                // Fetch owned projects
                const ownedProjectsRef = collection(db, `projects/${user.uid}/projects`);
                const ownedProjectsSnap = await getDocs(ownedProjectsRef);

                let allProjects = ownedProjectsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                // Fetch projects where the user is a collaborator
                const collaboratorProjectsSnap = await getDocs(query(collectionGroup(db, "projects"), where("collaborators", "array-contains", user.uid)));

                collaboratorProjectsSnap.forEach(doc => {
                    if (!allProjects.some(p => p.id === doc.id)) {
                        allProjects.push({ ...doc.data(), id: doc.id });
                    }
                });

                const ganttData = [];
                allProjects.forEach(project => {
                    const projectId = project.id;
                    const sortedTasks = project.tasks.map((task, index) => ({
                        ...task,
                        start: task.startDate instanceof Date ? task.startDate : new Date(task.startDate),
                        end: task.endDate instanceof Date ? task.endDate : new Date(task.endDate),
                        id: `${projectId}-task-${index}`, // Generate unique task IDs
                    })).sort((a, b) => a.start - b.start);

                    // Set dependencies based on task order
                    sortedTasks.forEach((task, index) => {
                        if (index > 0) { // Skip the first task as it has no dependencies
                            task.dependencies = [sortedTasks[index - 1].id];
                        }
                    });

                    // Add project and its tasks to ganttData
                    ganttData.push({
                        start: sortedTasks[0]?.start || new Date(),
                        end: sortedTasks[sortedTasks.length - 1]?.end || new Date(),
                        name: project.name,
                        id: projectId,
                        progress: project.progress || 0,
                        type: "project",
                        hideChildren: false
                    });

                    ganttData.push(...sortedTasks);
                });

                setTasks(ganttData);
                setLoading(false);
            }
        });
    }, []);


    let columnWidth = 60;
    if (view === ViewMode.Month) {
        columnWidth = 300;
    } else if (view === ViewMode.Week) {
        columnWidth = 250;
    }

    const ganttStyles = {
        backgroundColor: "bg-primary",
        border: "1px solid transparent",
        rounded: "rounded-lg"
    };

    const handleTaskChange = (task) => {
        let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
        if (task.project) {
            const [start, end] = getStartEndDateForProject(newTasks, task.project);
            const project = newTasks[newTasks.findIndex((t) => t.id === task.project)];
            if (
                project.startDate.getTime() !== start.getTime() ||
                project.endDate.getTime() !== end.getTime()
            ) {
                const changedProject = { ...project, startDate: start, endDate: end };
                newTasks = newTasks.map((t) =>
                    t.id === task.project ? changedProject : t
                );
            }
        }
        setTasks(newTasks);
        setTimeout(() => setLoading(false), 1000);
    };

    const handleTaskDelete = (task) => {
        const conf = window.confirm("Are you sure about " + task.name + " ?");
        if (conf) {
            setTasks(tasks.filter((t) => t.id !== task.id));
        }
        return conf;
    };

    const handleProgressChange = async (task) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    };

    const handleDblClick = (task) => {
        alert("On Double Click event Id:" + task.id);
    };

    const handleSelect = (task, isSelected) => {
        console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
    };

    const handleExpanderClick = (clickedTask) => {
        if (clickedTask.type === 'project') {
            setTasks(prevTasks => {
                // First, toggle the 'hideChildren' property of the clicked project
                const updatedTasks = prevTasks.map(task => {
                    if (task.id === clickedTask.id) {
                        return { ...task, hideChildren: !task.hideChildren };
                    }
                    return task;
                });

                // Then, update the visibility of all child tasks based on the updated 'hideChildren' value
                return updatedTasks.map(task => {
                    if (task.project === clickedTask.id) {
                        // Find the updated project to get the current value of 'hideChildren'
                        const parentProject = updatedTasks.find(t => t.id === clickedTask.id);
                        return { ...task, hidden: parentProject.hideChildren };
                    }
                    return task;
                });
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-infinity loading-lg"></span>
            </div>
        );
    }

    // Check if there are no tasks (projects) available
    if (tasks.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen" style={{ transform: 'translateY(-10%)', zIndex: -1000 }}>
                <div className="card w-96 bg-primary text-primary-content">
                    <div className="card-body">
                        <h2 className="card-title">No Projects Found</h2>
                        <p>Create a new project on the projects page to see your Gantt chart.</p>
                        <div className="card-actions justify-end">
                            <button className="btn"><Link to="/projects">Create Project</Link></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="card card-body shadow-lg">
            <ViewSwitcher
                onViewModeChange={(viewMode) => setView(viewMode)}
                onViewListChange={setIsChecked}
                isChecked={isChecked}
            />
            <Gantt
                barCornerRadius="3"
                className="p-4"
                style={ganttStyles}
                tasks={tasks}
                viewMode={view}
                onDateChange={handleTaskChange}
                onDelete={handleTaskDelete}
                onProgressChange={handleProgressChange}
                onDoubleClick={handleDblClick}
                onSelect={handleSelect}
                onExpanderClick={handleExpanderClick}
                listCellWidth={isChecked ? "155px" : ""}
                columnWidth={columnWidth}
            >
                {tasks.map((task) => (
                    <Tasks
                        key={`${task.id}-${task.type}`}
                        task={task}
                        onDateChange={handleTaskChange}
                        onDelete={handleTaskDelete}
                        onProgressChange={handleProgressChange}
                        onDoubleClick={handleDblClick}
                        onSelect={handleSelect}
                        onExpanderClick={handleExpanderClick}
                    />
                ))}

            </Gantt>
        </div>
    );
};

export default GanttChart;
