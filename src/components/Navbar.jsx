import React, { useState, useEffect } from 'react';
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [userImageUrl, setUserImageUrl] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, fetch the user profile
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef)
                    .then((userDocSnapshot) => {
                        if (userDocSnapshot.exists()) {
                            const userData = userDocSnapshot.data();
                            if (userData.profileImageUrl) {
                                setUserImageUrl(userData.profileImageUrl);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching user profile:', error.message);
                    });
            } else {
                // User is signed out, redirect to register page or handle accordingly
                navigate('/register');
            }
        });

        return () => unsubscribe(); // Clean up the subscription on component unmount
    }, [navigate, auth]);

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                navigate('/register');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className="drawer drawer-mobile md:drawer-desktop flex flex-col drawer-overlay">
            <input id="sidebar" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col">
                {/* Navbar */}
                <div className="navbar bg-base-100">
                    <div className="navbar-start">
                        <label htmlFor="sidebar" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </label>
                    </div>
                    <div className="navbar-center">
                        <a className="btn btn-ghost text-xl">Planthara</a>
                    </div>
                    <div className="navbar-end">
                        <div className="flex-none">
                            <ul className="menu menu-horizontal px-1">
                                <li><Link to="/dashboard">Dashboard</Link></li>
                                <li><Link to="/projects">Projects</Link></li>
                                <li><Link to="/ganttchart">Gantt Chart</Link></li>
                                <li><Link to="/tasks">Tasks</Link></li>
                            </ul>
                        </div>
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <img src={userImageUrl || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="Profile" />
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                    <Link to="/profile" className="justify-between">
                                        Profile
                                    </Link>
                                </li>
                                <li><Link to="/settings">Settings</Link></li>
                                <li><a onClick={handleSignOut}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="drawer-side" style={{zIndex: 1000}}>
                <label htmlFor="sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 overflow-y-auto w-80 h-full bg-base-300 bordered">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/projects">Projects</Link></li>
                    <li><Link to="/ganttchart">Gantt Chart</Link></li>
                    <li><Link to="/tasks">Tasks</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;


