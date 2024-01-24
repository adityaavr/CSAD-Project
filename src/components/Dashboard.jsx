import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchProjects = async () => {
            const projectsRef = collection(db, 'projects');
            const querySnapshot = await getDocs(projectsRef);
            const fetchedProjects = [];
            querySnapshot.forEach((doc) => {
                fetchedProjects.push({ id: doc.id, ...doc.data() });
            });
            setProjects(fetchedProjects);
        };

        fetchProjects();
    }, []);

    const handleSignOut = () => {
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
            console.log(error)
        });
    };

    return (
        <div className="drawer drawer-mobile">
            <input id="dashboard-sidebar" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col">
                {/* Navbar */}
                <div className="navbar bg-base-100">
                    <div className="navbar-start">
                        <label htmlFor="dashboard-sidebar" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </label>
                    </div>
                    <div className="navbar-center">
                        <a className="btn btn-ghost text-xl">Planthara</a>
                    </div>
                    <div className="navbar-end">
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <img src={user.photoURL || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="Profile" />
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                    <a className="justify-between">
                                        Profile
                                        <span className="badge">New</span>
                                    </a>
                                </li>
                                <li><a>Settings</a></li>
                                <li><a onClick={handleSignOut}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4">
                    {/*<h1 className="text-xl font-bold mb-4">Welcome to Planthara</h1>*/}
                    {/* You can open the modal using document.getElementById('ID').showModal() method */}
                    <button className="btn btn-primary" onClick={()=>document.getElementById('my_modal_4').showModal()}>Create Project</button>
                    <dialog id="my_modal_4" className="modal">
                        <div className="modal-box w-11/12 max-w-5xl">
                            <h3 className="font-bold text-lg">Welcome to your new project !</h3>
                            <p className="py-4">Click the button below to close</p>
                            <div className="modal-action">
                                <form method="dialog">
                                    {/* if there is a button, it will close the modal */}
                                    <button className="btn">Close</button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <div key={project.id} className="card bg-base-200 p-4 mb-4">
                                <h3 className="card-title">{project.name}</h3>
                                {/* Other project details */}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-600">
                            No projects found. Start by creating a new project.
                        </div>
                    )}
                </div>
            </div>
            <div className="drawer-side">
                <label htmlFor="dashboard-sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 overflow-y-auto w-80 h-full bg-base-300">
                    <li><Link to="/projects">Projects</Link></li>
                    <li><Link to="/ganttchart">Gantt Chart</Link></li>
                    <li><Link to="/tasks">Tasks</Link></li>
                    <li><Link to="/about">About</Link></li>
                    {/* More sidebar items */}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;


