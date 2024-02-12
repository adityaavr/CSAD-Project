import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Import images or use placeholders for the icons
//import projectsIcon from 'src/assets/react.svg'; // Replace with your actual image path
//import tasksIcon from 'src/assets/react.svg';       // Replace with your actual image path
//import dashboardIcon from 'src/assets/react.svg'; // Replace with your actual image path
//import ganttChartIcon from 'src/assets/react.svg'; // Replace with your actual image path

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
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 " onMouseEnter={() => handleHover('projects')} onMouseLeave={() => handleHover('')}>
                            <figure></figure>
                            <div className="card-body">
                                <h2 className="card-title">Projects</h2>
                                <p>Manage complex projects without the chaos.</p>
                            </div>
                        </div>
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 " onMouseEnter={() => handleHover('tasks')} onMouseLeave={() => handleHover('')}>
                            <figure></figure>
                            <div className="card-body">
                                <h2 className="card-title">Tasks</h2>
                                <p>Track and manage daily tasks efficiently.</p>
                            </div>
                        </div>
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 " onMouseEnter={() => handleHover('dashboard')} onMouseLeave={() => handleHover('')}>
                            <figure></figure>
                            <div className="card-body">
                                <h2 className="card-title">Dashboard</h2>
                                <p>Get insights and metrics at a glance.</p>
                            </div>
                        </div>
                        <div className="card card-compact bg-base-100 shadow-xl backdrop-filter backdrop-blur-lg bg-opacity-10 " onMouseEnter={() => handleHover('ganttChart')} onMouseLeave={() => handleHover('')}>
                            <figure></figure>
                            <div className="card-body">
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


