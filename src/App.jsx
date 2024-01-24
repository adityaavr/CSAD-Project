import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import AdditionalDetails from "./components/AdditionalDetails.jsx";
import Dashboard from "./components/Dashboard.jsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Register />} />
                <Route path="/additional-details" element={<AdditionalDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Fallback Route */}
                {/*<Route path="*" element={<div>Not Found</div>} />*/}
            </Routes>
        </Router>
    );
};

export default App;





