import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import colors from 'tailwindcss/colors.js';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [userImageUrl, setUserImageUrl] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
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

        const fetchUserProfile = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    if (userData.profileImageUrl) {
                        setUserImageUrl(userData.profileImageUrl);
                    }
                }
            }
        };

        fetchProjects();
        fetchUserProfile();
    }, [user]);

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                // Sign-out successful.
                navigate('/register');
            })
            .catch((error) => {
                // An error happened.
                console.log(error);
            });
    };

    return (
        <div className="drawer drawer-mobile flex flex-col">
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
                                    <img src={userImageUrl || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt="Profile" />
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                <li>
                                    <Link to="/profile" className="justify-between">
                                        Profile
                                        <span className="badge">New</span>
                                    </Link>
                                </li>
                                <li><Link to="/settings">Settings</Link></li>
                                <li><a onClick={handleSignOut}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4">
                    <button className="btn btn-primary" onClick={() => document.getElementById('my_modal_4').showModal()}>Create Project</button>
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
            <div className="flex justify-center items-center mt-10">
                <div className="h-96 flex space-x-6">
                    {/* Carousel components */}
                    <div className="h-96 carousel carousel-vertical rounded-box">
                        <div className="carousel-item h-full bg-gray-800">
                            <div className="card w-80 bg-gray-800 shadow-xl">
                                <figure>
                                    <img src="/images/work_pic.jpg" alt="car!" />
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title" style={{ color: "white" }}>Mobile App Development</h2>
                                    <div className="card-actions justify-end">
                                        <div className="radial-progress bg-gray-900 text-primary-content border-4 border-white" style={{ "--value": 70, color:"yellow" }} role="progressbar">70%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item h-full bg-gray-800">
                            <div className="card w-80 bg-gray-800 shadow-xl">
                                <figure>
                                    <img src="/images/work_pic.jpg" alt="car!" />
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title" style={{ color: "white" }}>CSAD</h2>
                                    <div className="card-actions justify-end">
                                        <div className="radial-progress bg-red-500 text-white border-4 border-white" style={{ "--value": 25 }} role="progressbar">25%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item h-full bg-gray-800">
                            <div className="card w-80 bg-gray-800 shadow-xl">
                                <figure>
                                    <img src="/images/work_pic.jpg" alt="car!" />
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title" style={{ color: "white" }}>Finance Project</h2>
                                    <div className="card-actions justify-end">
                                        <div className="radial-progress bg-yellow-500 text-white border-4 border-white" style={{ "--value": 57 }} role="progressbar">57%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="carousel-item h-full bg-gray-800">
                            <div className="card w-80 bg-gray-800 shadow-xl">
                                <figure>
                                    <img src="/images/work_pic.jpg" alt="car!" />
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title" style={{ color: "white" }}>MAPP</h2>
                                    <div className="card-actions justify-end">
                                        <div className="radial-progress bg-gray-900 text-primary-content border-4 border-white" style={{ "--value": 83, color:"green" }} role="progressbar">83%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-96 carousel carousel-vertical rounded-box">
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg" />
                        </div>
                    </div>
                    <div className="h-96 carousel carousel-vertical rounded-box">
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg" />
                        </div>
                        <div className="carousel-item h-full">
                            <img src="https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;



