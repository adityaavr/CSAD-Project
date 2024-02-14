import { Navigate, Outlet } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">
            <span className="loading loading-infinity loading-lg"></span>
        </div>; // Or any other loading indicator
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/register" />;
};
export default ProtectedRoute;