import React, { useState } from 'react';
import { motion } from 'framer-motion';

const About = () => {
    const [activeWindow, setActiveWindow] = useState('');

    const handleHover = (windowName) => {
        setActiveWindow(windowName);
    };

    const renderProjectsMiniUI = () => {
        return (
            <div>
                {/* "Create Project" button placeholder */}
                <div className="text-center mb-4">
                    <button className="btn btn-sm btn-primary">Create Project</button>
                </div>

                {/* Grid container for project cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Simulated project card 1 */}
                    <div className="bg-base-100 rounded-lg shadow p-4">
                        <h4 className="text-md font-semibold">Example Project 1</h4>
                        <ul className="list-disc pl-5 mt-2 text-sm">
                            <li>
                                <span className="font-medium">Task 1</span> - <span className="text-gray-500">Medium - Jan 1 to Jan 7</span>
                            </li>
                            <li>
                                <span className="font-medium">Task 2</span> - <span className="text-gray-500">High - Jan 8 to Jan 14</span>
                            </li>
                        </ul>
                    </div>

                    {/* Simulated project card 2 */}
                    <div className="bg-base-100 rounded-lg shadow p-4">
                        <h4 className="text-md font-semibold">Example Project 2</h4>
                        <ul className="list-disc pl-5 mt-2 text-sm">
                            <li>
                                <span className="font-medium">Task 3</span> - <span className="text-gray-500">Low - Jan 15 to Jan 21</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-base-100 rounded-lg shadow p-4">
                        <h4 className="text-md font-semibold">Example Project 2</h4>
                        <ul className="list-disc pl-5 mt-2 text-sm">
                            <li>
                                <span className="font-medium">Task 3</span> - <span className="text-gray-500">Low - Jan 15 to Jan 21</span>
                            </li>
                        </ul>
                    </div>

                    {/* More project cards as needed... */}
                </div>
            </div>
        );
    };

    const renderTasksMiniUI = () => {
        // Example tasks for the miniature UI
        const exampleTasks = [
            {
                status: 'To do',
                tasks: [
                    { id: '1', name: 'Task 1', project: 'Project A' },
                    { id: '2', name: 'Task 2', project: 'Project B' }
                ]
            },
            {
                status: 'Doing',
                tasks: [
                    { id: '3', name: 'Task 3', project: 'Project C' }
                ]
            },
            {
                status: 'Done',
                tasks: [
                    { id: '4', name: 'Task 4', project: 'Project D' }
                ]
            }
        ];

        // Function to determine the background color based on the task status
        const getBackgroundColor = (status) => {
            switch (status) {
                case 'To do': return 'bg-red-100';
                case 'Doing': return 'bg-yellow-100';
                case 'Done': return 'bg-green-100';
                default: return 'bg-gray-100';
            }
        };

        return (
            <div className="grid grid-cols-3 gap-4">
                {exampleTasks.map((category, index) => (
                    <div key={index} className="p-4 rounded-lg shadow bg-base-100">
                        <h3 className="font-semibold text-lg mb-2">{category.status}</h3>
                        <div className="space-y-2">
                            {category.tasks.map((task) => (
                                <div key={task.id} className={`p-2 rounded-lg shadow-sm ${getBackgroundColor(category.status)}`}>
                                    <h4 className="font-semibold">{task.name}</h4>
                                    <p className="text-sm text-gray-700">Project: {task.project}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderDashboardMiniUI = () => {
        // Placeholder data for the miniature version
        const taskProgress = { todo: 30, doing: 20, done: 50 };
        const upcomingTasks = ['Task A', 'Task B', 'Task C'];
        const projectOverview = { totalProjects: 5, planning: 2, inProgress: 2, completed: 1 };

        return (
            <div className="flex flex-row gap-4 py-6">
                {/* Task Progress Section */}
                <div className="bg-base-100 rounded-lg p-2">
                    <h4 className="text-sm font-bold">Tasks Progress</h4>
                    <div className="flex justify-between text-xs">
                        <span>To do: {taskProgress.todo}%</span>
                        <span>Doing: {taskProgress.doing}%</span>
                        <span>Done: {taskProgress.done}%</span>
                    </div>
                    {/* Simplified progress bar representation */}
                    <div className="h-2 w-full bg-gray-200 rounded-full mt-1">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${taskProgress.done}%` }}></div>
                    </div>
                </div>

                {/* Upcoming Tasks Section */}
                <div className="bg-base-100 rounded-lg p-2">
                    <h4 className="text-sm font-bold">Upcoming Tasks</h4>
                    <ul className="list-disc pl-4 text-xs">
                        {upcomingTasks.map((task, index) => (
                            <li key={index}>{task}</li>
                        ))}
                    </ul>
                </div>

                {/* Project Overview Section */}
                <div className="bg-base-100 rounded-lg p-2">
                    <h4 className="text-sm font-bold">Project Overview</h4>
                    <div className="text-xs">
                        <p>Total Projects: <strong>{projectOverview.totalProjects}</strong></p>
                        <p>Planning: <strong>{projectOverview.planning}</strong></p>
                        <p>In Progress: <strong>{projectOverview.inProgress}</strong></p>
                        <p>Completed: <strong>{projectOverview.completed}</strong></p>
                    </div>
                </div>
            </div>
        );
    };

    const renderGanttChartMiniUI = () => {
        // Placeholder tasks for display
        const tasks = [
            { name: 'Design Phase', start: 1, duration: 2, color: 'bg-blue-500' },
            { name: 'Development Phase', start: 3, duration: 3, color: 'bg-green-500' },
            { name: 'Testing Phase', start: 6, duration: 2, color: 'bg-red-500' },
        ];

        // Generate the time axis (days)
        const timeAxis = Array.from({ length: 8 }, (_, i) => i + 1);

        return (
            <div className="bg-base-100 rounded-lg shadow p-4">
                <div className="flex justify-between text-xs mb-2">
                    {timeAxis.map(day => (
                        <div key={day} className="text-center">{`Day ${day}`}</div>
                    ))}
                </div>
                <div className="space-y-2">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex items-center">
                            <div className="text-xs font-semibold w-28 mr-2">{task.name}</div>
                            <div className="flex flex-grow h-4 bg-gray-200 rounded">
                                <div
                                    className={`${task.color} rounded`}
                                    style={{
                                        marginLeft: `${task.start * 12.5}%`, // Adjusted to align with the time axis
                                        width: `${task.duration * 12.5}%`, // Adjusted to represent task duration
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    const renderWindowContent = () => {
        switch (activeWindow) {
            case 'projects':
                return renderProjectsMiniUI();
            case 'tasks':
                return renderTasksMiniUI();
            case 'dashboard':
                return renderDashboardMiniUI();
            case 'ganttChart':
                return renderGanttChartMiniUI();
            default:
                return "Hover over an icon!";
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-base-200">
            <div className="bg-base-200 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto text-center my-6"
                >
                    <h2 className="text-3xl font-semibold mb-4">About Planthara</h2>
                    <div className="grid grid-cols-4 gap-4 py-4">
                        {/* Icons with hover effect and descriptions */}
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 hover:bg-opacity-60 transition duration-150 ease-in-out" onMouseEnter={() => handleHover('projects')} onMouseLeave={() => handleHover('')}>
                            <div className="card-body flex items-start">
                                <figure className="flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                                </svg>
                                </figure>
                                <h2 className="card-title">Projects</h2>
                                <p>Manage complex projects without the chaos.</p>
                            </div>
                        </div>
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 hover:bg-opacity-60 transition duration-150 ease-in-out" onMouseEnter={() => handleHover('tasks')} onMouseLeave={() => handleHover('')}>

                            <div className="card-body flex items-start">
                                <figure className="flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
                                </svg>
                                </figure>
                                <h2 className="card-title">Tasks</h2>
                                <p>Track and manage daily tasks efficiently.</p>
                            </div>
                        </div>
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 hover:bg-opacity-60 transition duration-150 ease-in-out" onMouseEnter={() => handleHover('dashboard')} onMouseLeave={() => handleHover('')}>
                            <div className="card-body flex items-start">
                                <figure className="flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                                </svg>
                                </figure>
                                <h2 className="card-title">Dashboard</h2>
                                <p>Get insights and metrics at a glance.</p>
                            </div>
                        </div>
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 hover:bg-opacity-60 transition duration-150 ease-in-out" onMouseEnter={() => handleHover('ganttChart')} onMouseLeave={() => handleHover('')}>
                            <div className="card-body flex items-start">
                                <figure className="flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                </svg>
                                </figure>
                                <h2 className="card-title">Gantt Chart</h2>
                                <p>Visualize project timelines and dependencies.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mockup-window border bg-base-300">
                        <div className="flex justify-center px-4 py-16 bg-base-200">{renderWindowContent()}</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;


