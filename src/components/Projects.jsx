import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    onSnapshot,
    addDoc,
    doc,
    deleteDoc,
    updateDoc,
    getDoc,
    arrayUnion,
    arrayRemove,
    query,
    where
} from "firebase/firestore";
import { collectionGroup } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig.js";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const initialFormData = {
        name: "",
        tasks: [{ name: "", priority: "low", startDate: "", endDate: "", status: "To do" }],
        collaborators: []
    };
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);
    const [editProjectId, setEditProjectId] = useState(null);
    const [users, setUsers] = useState([]);
    const [showAddCollaboratorsModal, setShowAddCollaboratorsModal] = useState(false);
    const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchUsers = () => {
            const usersCollectionRef = collection(db, 'users');
            // Listening to users collection
            onSnapshot(usersCollectionRef, (snapshot) => {
                const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.id !== currentUser?.uid); // Exclude the current user
                setUsers(userList);
            });
        };

        const fetchProjects = (user) => {
            const ownedProjectsRef = collection(db, `projects/${user.uid}/projects`);
            // Listening to owned projects
            onSnapshot(ownedProjectsRef, (snapshot) => {
                let projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), ownerId: user.uid }));

                // Query for projects where the user is a collaborator
                const allProjectsRef = collectionGroup(db, "projects");
                const q = query(allProjectsRef, where("collaborators", "array-contains", user.uid));
                onSnapshot(q, (collabSnapshot) => {
                    collabSnapshot.forEach(doc => {
                        if (!projects.some(p => p.id === doc.id)) {
                            projects.push({ id: doc.id, ...doc.data(), ownerId: doc.ref.parent.parent.id });
                        }
                    });

                    setProjects(projects);
                    setLoading(false);
                });
            });
        };


        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user); // Set the current user
                fetchUsers();
                fetchProjects(user);
            }
        });
    }, [currentUser?.uid]);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.trim());
    };

    const filteredUsers = searchTerm === '' ? [] : users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) && user.id !== currentUser?.uid
    );

    const addCollaborator = async (userId) => {
        if (!selectedProjectId) return;

        const projectRef = doc(db, `projects/${getAuth().currentUser.uid}/projects`, selectedProjectId);

        try {
            await updateDoc(projectRef, {
                collaborators: arrayUnion(userId)
            });
            console.log("Collaborator added successfully");
        } catch (error) {
            console.error("Error adding collaborator: ", error);
        }
    };

    const removeCollaborator = async (userId) => {
        if (!selectedProjectId) return;

        const projectRef = doc(db, `projects/${getAuth().currentUser.uid}/projects`, selectedProjectId);

        try {
            await updateDoc(projectRef, {
                collaborators: arrayRemove(userId)
            });
            console.log("Collaborator removed successfully");
        } catch (error) {
            console.error("Error removing collaborator: ", error);
        }
    };


    const handleViewCollaborators = async (projectId, projectOwnerId) => {
        setIsClosing(false);
        setSelectedProjectId(projectId);
        setShowCollaboratorsModal(true);

        // Use projectOwnerId to identify the correct project document
        const projectRef = doc(db, `projects/${projectOwnerId}/projects`, projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            // Allow both owner and collaborators to view the list
            if (currentUser.uid === projectOwnerId || projectData.collaborators.includes(currentUser.uid)) {
                const projectCollaborators = users.filter(user => projectData.collaborators.includes(user.id));
                setUsers(projectCollaborators);
            } else {
                alert("You do not have permission to view collaborators.");
            }
        } else {
            console.log("No such project or no collaborators found!");
            setUsers([]);
        }
    };

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
                    collaborators: projects.find(p => p.id === editProjectId)?.collaborators || []
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
                    collaborators: []
                });

                // Add tasks to the new project
                const tasksRef = collection(db, `projects/${userId}/projects/${projectRef.id}/tasks`);
                for (const task of formData.tasks) {
                    await addDoc(tasksRef, {
                        name: task.name,
                        priority: task.priority,
                        startDate: task.startDate,
                        endDate: task.endDate,
                        status: task.status,
                    });
                }
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
            await deleteDoc(doc(db, `projects/${getAuth().currentUser.uid}/projects`, projectId));
            setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleOpenAddCollaborators = (projectId) => {
        setSelectedProjectId(projectId);
        setShowAddCollaboratorsModal(true);
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
                                setFormData(initialFormData);
                                setEditProjectId(null);
                                document.getElementById('my_modal_1').showModal();
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
                                                <button className="btn btn-circle btn-error ml-5 align-middle" onClick={() => handleRemoveTask(index)}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
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
                                                    min={task.startDate}
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
                                {project.ownerId !== currentUser?.uid && (
                                    <div className="p-1"><div className="badge badge-secondary">Collaborator</div></div>
                                )}
                                <div className="dropdown absolute top-2 right-16" style={{zIndex: 10}}>
                                    <label tabIndex={0} className="m-1 btn border bg-transparent border-transparent hover:bg-white hover:shadow-none" style={{ boxShadow: 'none' }}>
                                        <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3a2.5 2.5 0 1 1 2-4.5M19.5 17h.5c.6 0 1-.4 1-1a3 3 0 0 0-3-3h-1m0-3a2.5 2.5 0 1 0-2-4.5m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3c0 .6-.4 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
                                        </svg>
                                    </label>
                                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                        <li><a onClick={() => handleViewCollaborators(project.id, project.ownerId)}>View collaborators</a></li>
                                        {project.ownerId === currentUser.uid && (
                                            <li><a onClick={() => handleOpenAddCollaborators(project.id)}>Add collaborators</a></li>
                                        )}
                                    </ul>
                                </div>
                                {project.ownerId === currentUser.uid && (
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
                                )}
                                <h1 className="text-2xl font-semibold mb-4">{project.name}</h1>
                                <div className="space-y-4">
                                    {project.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className="p-4 rounded-lg shadow-sm bg-gray-50">
                                            <h3 className="text-lg font-medium">{task.name}</h3>
                                            <div className="mt-2 text-sm text-gray-600">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mr-2 ${task.priority}`}>
                        {task.priority.toUpperCase()}
                    </span>
                                                <span>{task.startDate} to {task.endDate}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                        <button className="btn btn-xs btn-primary" onClick={() => addCollaborator(user.id)}>Add</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={() => setShowAddCollaboratorsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {showCollaboratorsModal && (
                <div
                    className={`modal ${isClosing ? 'fade-out' : 'modal-open'} modal-bottom sm:modal-middle`}
                    onAnimationEnd={() => isClosing && setShowCollaboratorsModal(false)}
                >
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Current Collaborators</h3>
                        <ul className="overflow-auto h-64">
                            {users.map(user => (
                                <li key={user.id} className="flex items-center gap-4 p-2 border-b">
                                    <img src={user.profileImageUrl || 'default-profile.png'} alt="Profile" className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div>{user.name}</div>
                                        <div className="text-sm text-gray-600">@{user.username}</div>
                                        {/* Only show the Remove button if the currentUser is the owner of the project */}
                                        {projects.find(p => p.id === selectedProjectId)?.ownerId === currentUser.uid && (
                                            <button className="btn btn-xs btn-error" onClick={() => removeCollaborator(user.id)}>Remove</button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={() => setShowCollaboratorsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Projects;
