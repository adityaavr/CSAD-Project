import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import AdditionalDetails from "./components/AdditionalDetails.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Tasks from "./components/Tasks.jsx";
import GanttChart from "./components/GanttChart.jsx";
import Projects from "./components/Projects.jsx";
import Navbar from "./components/Navbar.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/additional-details" element={<AdditionalDetails />} />
                <Route path="/dashboard" element={
                    <div className="flex flex-col h-1">
                        <Navbar />
                        <Dashboard />
                    </div>} />
                <Route path="/tasks" element={
                    <div className="flex flex-col h-1">
                        <Navbar />
                        <Tasks />
                    </div>
                } />
                <Route path="/ganttchart" element={
                    <div className="flex flex-col h-1">
                        <Navbar />
                        <GanttChart />
                    </div>
                } />
                <Route path="/projects" element={
                    <div className="flex flex-col h-1">
                        <Navbar />
                        <Projects />
                    </div>
                } />
                {/* Fallback Route */}
                {/*<Route path="*" element={<div>Not Found</div>} />*/}
            </Routes>
        </Router>
    );
};

export default App;





