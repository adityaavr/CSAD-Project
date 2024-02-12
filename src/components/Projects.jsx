import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    getDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig.js";
import async from "async";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const initialFormData = {
        name: "",
        tasks: [{ name: "", priority: "low", startDate: "", endDate: "", status: "To do" }],
    };
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);
    const [editProjectId, setEditProjectId] = useState(null);
    const [users, setUsers] = useState([]);
    const [showAddCollaboratorsModal, setShowAddCollaboratorsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = searchTerm === '' ? [] : users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchUsers = async () => {
            const usersCollectionRef = collection(db, 'users');
            const userData = await getDocs(usersCollectionRef);
            const userList = userData.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(userList);
        };

        fetchUsers();

        const unsubscribeAuthStateChanged = onAuthStateChanged(getAuth(), (user) => {
            console.log("Auth state changed:", user);
            if (user) {
                const projectsRef = collection(db, `projects/${user.uid}/projects`);
                const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
                    console.log("Fetching projects");
                    const fetchedProjects = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    if (fetchedProjects.length > 0) {
                        const userProjects = fetchedProjects
                        setProjects(userProjects);
                    } else {
                        console.log("No projects found");
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching projects:", error);
                    setLoading(false);
                });
                return unsubscribe;
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeAuthStateChanged();
    }, []);

    // State to manage the fade-out effect
    const [isClosing, setIsClosing] = useState(false);

    // Function to open the modal
    const handleOpenAddCollaborators = () => {
        setIsClosing(false);
        setShowAddCollaboratorsModal(true);
    };

    // Function to close the modal with a fade-out effect
    const handleCloseAddCollaborators = () => {
        setIsClosing(true); // Trigger the fade-out effect
        setTimeout(() => {
            setShowAddCollaboratorsModal(false); // After the animation, remove the modal from the DOM
        }, 300); // The timeout
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleTaskInputChange = (index, e) => {
        const { name, value } = e.target;
        const newTasks = [...formData.tasks];
        if (name.startsWith('taskName')) {
            newTasks[index].name = value;
        } else if (name.startsWith('startDate')) {
            newTasks[index].startDate = value;
        } else if (name.startsWith('endDate')) {
            newTasks[index].endDate = value;
        } else if (name.startsWith('taskPriority')) {
            newTasks[index].priority = value;
        } else if (name.startsWith('status')) {
            newTasks[index].status = value;
        }

        setFormData(prevData => ({ ...prevData, tasks: newTasks }));
    };

    const handleEditProject = async (projectId) => {
        setEditProjectId(projectId);
        const projectRef = doc(db, `projects/${getAuth().currentUser.uid}/projects`, projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            const tasksRef = collection(db, `projects/${getAuth().currentUser.uid}/projects/${projectId}/tasks`);
            const taskSnapshot = await getDocs(tasksRef);
            const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setFormData({ ...projectData, tasks });
            document.getElementById('my_modal_1').showModal();
        } else {
            console.log("No such project!");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || formData.tasks.every((task) => !task.name.trim())) {
            console.error("Project name and at least one task name are required");
            return;
        }

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error("User not authenticated");
            return;
        }
        const userId = user.uid;

        try {
            if (editProjectId) {
                // Update existing project (excluding tasks)
                const projectRef = doc(db, `projects/${userId}/projects`, editProjectId);
                await updateDoc(projectRef, {
                    name: formData.name,
                    tasks: formData.tasks.map((task) => ({
                        name: task.name,
                        priority: task.priority || "low",
                        startDate: task.startDate || new Date().toISOString().split('T')[0],
                        endDate: task.endDate || new Date().toISOString().split('T')[0],
                        status: task.status || "To do",
                    })),
                });

                // Handle tasks: Update existing ones and add new ones
                const tasksRef = collection(db, `projects/${userId}/projects/${editProjectId}/tasks`);
                for (const task of formData.tasks) {
                    if (task.id) {
                        const taskDocRef = doc(tasksRef, task.id);
                        await updateDoc(taskDocRef, {
                            name: task.name,
                            priority: task.priority,
                            startDate: task.startDate,
                            endDate: task.endDate,
                            status: task.status,
                        });
                    } else {
                        await addDoc(tasksRef, {
                            name: task.name,
                            priority: task.priority,
                            startDate: task.startDate,
                            endDate: task.endDate,
                            status: task.status,
                        });
                    }
                }
            } else {
                // Create a new project (excluding tasks)
                const projectRef = await addDoc(collection(db, `projects/${userId}/projects`), {
                    name: formData.name,
                    tasks: formData.tasks.map((task) => ({
                        name: task.name,
                        priority: task.priority || "low",
                        startDate: task.startDate || new Date().toISOString().split('T')[0],
                        endDate: task.endDate || new Date().toISOString().split('T')[0],
                        status: task.status || "To do",
                    })),
                });

                // Add tasks to the new project
                const tasksRef = collection(db, `projects/${userId}/projects/${projectRef.id}/tasks`);
                formData.tasks.forEach(async (task) => {
                    await addDoc(tasksRef, {
                        name: task.name,
                        priority: task.priority,
                        startDate: task.startDate,
                        endDate: task.endDate,
                        status: task.status,
                    });
                });
            }

            // Reset form and close modal after operation
            setFormData(initialFormData);
            document.getElementById('my_modal_1').close();
            setEditProjectId(null); // Reset edit mode after form submission
        } catch (error) {
            console.error("Error saving project:", error.message);
        }
    };




    const handleAddTask = () => {
        const newTask = { name: "", priority: "low", startDate: "", endDate: "", status: "To do" };
        setFormData((prevFormData) => ({
            ...prevFormData,
            tasks: [...prevFormData.tasks, newTask],
        }));
    };

    const handleRemoveTask = (index) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            tasks: prevFormData.tasks.filter((_, taskIndex) => taskIndex !== index),
        }));
    };

    const handleDeleteProject = async (projectId) => {
        try {
            // Delete the project from Firestore
            await deleteDoc(doc(db, `projects/${getAuth().currentUser.uid}/projects`, projectId));

            // Update the local state to reflect the change
            setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };


    return (
        <div>
            {loading && (
                <div className="flex items-center justify-center min-h-screen">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            )}
            {!loading && (
                <div className="p-4">
                    <div className="p-4">
                        <button
                            className="btn btn-primary mb-4"
                            onClick={() => {
                                setFormData(initialFormData); // Reset form for new project
                                setEditProjectId(null); // Clear edit mode
                                document.getElementById('my_modal_1').showModal(); // Open the modal
                            }}
                        >
                            Create Project
                        </button>

                        <dialog id="my_modal_1" className="modal">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg">{editProjectId ? 'Edit Project' : 'Create Project'}</h3>
                                <form onSubmit={handleFormSubmit}>
                                    <div className="mt-4">
                                        <label className="block mb-2">
                                            <div>
                                                <span className="label-text">Project Name</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="input input-bordered w-full max-w-xs"
                                                required
                                            />
                                        </label>
                                    </div>

                                    {formData.tasks.map((task, index) => (
                                        <div key={index} className="space-y-4">
                                            <label className="block mb-2">
                                                <div>
                                                    <span className="label-text">Task {index + 1} Name</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name={`taskName-${index}`}
                                                    value={task.name || ""}
                                                    onChange={(e) => handleTaskInputChange(index, e)}
                                                    className="input input-bordered w-full max-w-xs"
                                                    required
                                                />
                                                <button className="btn btn-circle" onClick={() => handleRemoveTask(index)}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </label>
                                            <label className="block mb-2">
                                                <div>
                                                    <span className="label-text">Start Date</span>
                                                </div>
                                                <input
                                                    type="date"
                                                    name={`startDate-${index}`}
                                                    value={task.startDate || ""}
                                                    onChange={(e) => handleTaskInputChange(index, e)}
                                                    className="input input-bordered w-full max-w-xs"
                                                    required
                                                />
                                            </label>
                                            <label className="block mb-2">
                                                <div>
                                                    <span className="label-text">End Date</span>
                                                </div>
                                                <input
                                                    type="date"
                                                    name={`endDate-${index}`}
                                                    value={task.endDate || ""}
                                                    onChange={(e) => handleTaskInputChange(index, e)}
                                                    className="input input-bordered w-full max-w-xs"
                                                    required
                                                />
                                            </label>
                                            <label className="block mb-2">
                                                <div>
                                                    <span className="label-text">Priority</span>
                                                </div>
                                                <select
                                                    className="select select-bordered w-full max-w-xs"
                                                    name={`taskPriority-${index}`}
                                                    value={task.priority || "low"}
                                                    onChange={(e) => handleTaskInputChange(index, e)}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </label>
                                        </div>
                                    ))}

                                    <div className="modal-action">
                                        <div style={{ marginRight: '160px' }}>
                                            <button type="button" onClick={handleAddTask} className="btn btn-secondary">Add Task</button>
                                        </div>
                                        <button type="button" onClick={() => document.getElementById('my_modal_1').close()} className="btn btn-secondary">Close</button>
                                        <button type="submit" className="btn btn-primary">{editProjectId ? 'Update' : 'Save'} Project</button>
                                    </div>
                                </form>
                            </div>
                        </dialog>
                    </div>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => (
                            <div key={index} className="p-6 rounded-xl shadow-md transition-shadow duration-300 relative">
                                {/* New dropdown for collaborators to the left of the existing dropdown */}
                                <div className="dropdown absolute top-2 right-16">
                                    <label tabIndex={0} className="m-1 btn border bg-transparent border-transparent hover:bg-white hover:shadow-none" style={{ boxShadow: 'none' }}>
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
                                        </svg>
                                    </label>
                                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                        <li><a>View collaborators</a></li>
                                        <li><a onClick={() => handleOpenAddCollaborators()}>Add collaborators</a></li>
                                    </ul>
                                </div>

                                {/* Existing dropdown for project options */}
                                <div className="dropdown dropdown-end absolute top-2 right-2">
                                    <div tabIndex={0} className="m-1 btn border bg-transparent border-transparent hover:bg-white hover:shadow-none" style={{ boxShadow: 'none' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow rounded-box w-52 bg-white border border-transparent focus:outline-none focus:border-transparent hover:border-white">
                                        <li>
                                            <a onClick={() => handleEditProject(project.id)}>Edit</a>
                                        </li>
                                        <li>
                                            <a onClick={() => handleDeleteProject(project.id)}>Delete</a>
                                        </li>
                                    </ul>
                                </div>
                                <h1 className="text-2xl font-semibold mb-4">{project.name}</h1>
                                <ul className="list-disc pl-5 space-y-2">
                                    {project.tasks.map((task, taskIndex) => (
                                        <li key={taskIndex} className="text-sm">
                                            <span className="font-medium">{task.name}</span> - <span className="text-gray-600">{task.priority}</span> - <span className="text-gray-500">{task.startDate} to {task.endDate}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                    </div>


                </div>
            )}
            {showAddCollaboratorsModal && (
                <div
                    className={`modal ${isClosing ? 'fade-out' : 'modal-open'} modal-bottom sm:modal-middle`}
                    onAnimationEnd={() => isClosing && setShowAddCollaboratorsModal(false)}
                >
                    <div className="modal-box">
                        {/* Modal content */}
                        <h3 className="font-bold text-lg">Add Collaborators</h3>
                        {/* Search View */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Search for user by username</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Find collaborators by username!"
                                className="input input-bordered"
                                value={searchTerm}
                                onChange={handleSearchChange}/>
                        </div>
                        {/* List View */}
                        <ul className="overflow-auto h-64">
                            {filteredUsers.map((user) => (
                                <li key={user.id} className="flex items-center gap-4 p-2 border-b">
                                    <img src={user.profileImageUrl} alt="Profile" className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div>{user.name}</div>
                                        <div className="text-sm text-gray-600">@{user.username}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={handleCloseAddCollaborators}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
