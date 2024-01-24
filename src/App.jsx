import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import AdditionalDetails from "./components/AdditionalDetails.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Tasks from "./components/Tasks.jsx";
import GanttChart from "./components/GanttChart.jsx";
import Projects from "./components/Projects.jsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Register />} />
                <Route path="/additional-details" element={<AdditionalDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/ganttchart" element={<GanttChart />} />
                <Route path="/projects" element={<Projects />} />
                {/* Fallback Route */}
                {/*<Route path="*" element={<div>Not Found</div>} />*/}
            </Routes>
        </Router>
    );
};

export default App;





