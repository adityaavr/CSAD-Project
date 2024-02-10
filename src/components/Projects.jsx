import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig.js";
import { convertFirestoreProjectsToGanttFormat } from "../GanttHelper/GanttHelper.jsx";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const initialFormData = {
        name: "",
        tasks: [{ name: "", priority: "low", startDate: "", endDate: "", status: "To do" }],
    };
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            const userId = user.uid;

            try {
                const projectsRef = collection(db, `projects/${userId}/projects`);
                const querySnapshot = await getDocs(projectsRef);
                const fetchedProjects = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const ganttProjects = convertFirestoreProjectsToGanttFormat(fetchedProjects);

                setProjects(ganttProjects);
            } catch (error) {
                console.error("Error fetching projects:", error.message);
                setProjects([]);
            } finally {
                setLoading(false);
            }

            const unsubscribe = onSnapshot(
                collection(db, `projects/${userId}/projects`),
                (snapshot) => {
                    const updatedProjects = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setProjects(updatedProjects);
                }
            );

            return () => unsubscribe();
        };

        const unsubscribeAuthStateChanged = onAuthStateChanged(
            getAuth(),
            (user) => {
                if (user) {
                    fetchProjects();
                } else {
                    setLoading(false);
                }
            }
        );

        return () => unsubscribeAuthStateChanged();
    }, []);

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
            // Save to the existing collection
            const userProjectsRef = collection(db, `projects/${userId}/projects`);
            const projectDocRef = await addDoc(userProjectsRef, formData);

            const projectId = projectDocRef.id;
            const project = formData.name;
            const userTasksRef = collection(db, `projects/${userId}/projects/${projectId}/tasks`);

            const taskAdditionPromises = formData.tasks.map(task => {
                const taskWithProjectName = { ...task, project };
                return addDoc(userTasksRef, taskWithProjectName);
            });

            await Promise.all(taskAdditionPromises);

            setProjects((prevProjects) => [
                ...prevProjects,
                { id: projectId, ...formData },
            ]);

            setFormData(initialFormData);
            document.getElementById('my_modal_1').close(); // Close the modal
        } catch (error) {
            console.error("Error adding project and tasks:", error.message);
        }
    };


    const handleDeleteProject = async (projectId) => {
        await deleteDoc(doc(db, `projects/${getAuth().currentUser.uid}/projects`, projectId));

        const tasksRef = collection(db, `projects/${getAuth().currentUser.uid}/projects/${projectId}/tasks`);
        const taskSnapshot = await getDocs(tasksRef);
        const taskDeletionPromises = taskSnapshot.docs.map((taskDoc) => {
            return deleteDoc(doc(db, `projects/${getAuth().currentUser.uid}/projects/${projectId}/tasks`, taskDoc.id));
        });

        await Promise.all(taskDeletionPromises);
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
                            onClick={() => document.getElementById('my_modal_1').showModal()}
                        >
                            Create Project
                        </button>

                        <dialog id="my_modal_1" className="modal">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg">Create Project</h3>
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
                                    <div className="mt-4">
                                        {formData.tasks.map((task, index) => (
                                            <div key={index} className="space-y-4">
                                                <label className="block mb-2">
                                                    <div>
                                                        <span className="label-text">Task {index + 1}</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name={`taskName${index + 1}`}
                                                        value={task.name || ""}
                                                        onChange={(e) =>
                                                            handleTaskInputChange(index, e)
                                                        }
                                                        className="input input-bordered w-full max-w-xs"
                                                        required
                                                    />
                                                </label>
                                                <label className="block mb-2">
                                                    <div>
                                                        <span className="label-text">Start Date</span>
                                                    </div>
                                                    <input
                                                        type="date"
                                                        name={`startDate${index + 1}`}
                                                        value={task.startDate || ""}
                                                        onChange={(e) =>
                                                            handleTaskInputChange(index, e)
                                                        }
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
                                                        name={`endDate${index + 1}`}
                                                        value={task.endDate || ""}
                                                        onChange={(e) =>
                                                            handleTaskInputChange(index, e)
                                                        }
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
                                                        name={`taskPriority${index + 1}`}
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
                                    </div>
                                    <div className="mt-6 flex justify-between">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                setFormData((prevData) => ({
                                                    ...prevData,
                                                    tasks: [
                                                        ...prevData.tasks,
                                                        {
                                                            name: "",
                                                            priority: "low",
                                                            startDate: "",
                                                            endDate: "",
                                                            status: "To do",
                                                        },
                                                    ],
                                                }))
                                            }
                                        >
                                            Add Task
                                        </button>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('my_modal_1').close()}
                                                className="btn btn-secondary mr-2"
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                            >
                                                Save Project
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </dialog>
                    </div>

                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => (
                            <div key={index} className="p-6 rounded-lg shadow-lg relative">
                                <div className="absolute top-2 right-2">
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle dropdown-toggle">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                            <li><a onClick={() => handleDeleteProject(project.id)}>Delete</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold mb-4">{project.name}</h1>
                                <div className="flex">
                                    <div className="w-full">
                                        <h2 className="text-lg font-bold mb-2">Tasks:</h2>
                                        {project.tasks &&
                                            project.tasks.map((task, taskIndex) => (
                                                <div key={`${project.id}-${taskIndex}`} className="mb-2">
                                                    <p className="text-md">
                                                        <span className="font-bold">Task {taskIndex + 1}:</span> {task.name}
                                                    </p>
                                                    <p className="text-sm">Priority: {task.priority}</p>
                                                    <p className="text-sm">Start Date: {task.startDate}</p>
                                                    <p className="text-sm">End Date: {task.endDate}</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
