import React, { useState } from 'react';
import { motion } from 'framer-motion';

const About = () => {
    const [activeWindow, setActiveWindow] = useState('');

    const handleHover = (windowName) => {
        setActiveWindow(windowName);
    };

    const renderWindowContent = () => {
        switch (activeWindow) {
            case 'projects':
                return "Projects content!";
            case 'tasks':
                return "Tasks content!";
            case 'dashboard':
                return "Dashboard content!";
            case 'ganttChart':
                return "Gantt Chart content!";
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


