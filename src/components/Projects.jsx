import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    addDoc,
    onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig.js";
import { convertFirestoreProjectsToGanttFormat } from "../GanttHelper/GanttHelper.jsx";

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        tasks: [{ name: "", priority: "low", startDate: "", endDate: "", status: "To do" }],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
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

                // Convert fetched projects to Gantt format
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

        if (name.includes("taskName")) {
            newTasks[index].name = value;
        } else if (name.includes("startDate")) {
            newTasks[index].startDate = value;
        } else if (name.includes("endDate")) {
            newTasks[index].endDate = value;
        } else if (name.includes("priority")) {
            newTasks[index].priority = value;
        } else if (name.includes("status")) {
            newTasks[index].status = value;
        }

        setFormData((prevData) => ({ ...prevData, tasks: newTasks }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || formData.tasks.every((task) => !task.name.trim())) {
            console.error("Project name and at least one task name are required");
            return;
        }

        const auth = getAuth();
        const user = auth.currentUser;
        const userId = user.uid;

        try {
            // Add the project to the projects collection
            const userProjectsRef = collection(db, `projects/${userId}/projects`);
            const projectDocRef = await addDoc(userProjectsRef, formData);

            // Create a new tasks collection for the project using the project ID
            const projectId = projectDocRef.id;
            const userTasksRef = collection(db, `projects/${userId}/projects/${projectId}/tasks`);

            // Add each task to the tasks collection with the project field
            formData.tasks.forEach(async (task, index) => {
                // Include the project field in each task
                const taskWithProject = {
                    ...task,
                    project: formData.name, // Assuming you want to use the project name
                };

                await addDoc(userTasksRef, taskWithProject);
            });

            setProjects((prevProjects) => [
                ...prevProjects,
                { id: projectId, ...formData },
            ]);

            setFormData({
                name: "",
                tasks: [{ name: "", priority: "low", startDate: "", endDate: "", status: "To do" }],
            });
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding project:", error.message);
        }
    };


    console.log("Projects state:", projects);
    return (
        <div>
            {loading && (
                <div className="flex items-center justify-center min-h-screen">
                    <span className="loading loading-infinity loading-lg"></span>
                </div>
            )}
            {!loading && (
                <div className="p-4">
                    <button
                        className="btn btn-primary mb-4"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create Project
                    </button>

                    {isModalOpen && (
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:max-w-3xl">
                                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            Create Project
                                        </h3>
                                        <div className="mt-2">
                                            <form onSubmit={handleFormSubmit}>
                                                <div className="mb-4">
                                                    <label className="form-control w-full max-w-xs">
                                                        <div className="label">
                                                            <span className="label-text">Project Name:</span>
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
                                                <div className="mb-4 space-y-1">
                                                    <label className="form-control w-full max-w-xs">
                                                        {formData.tasks.map((task, index) => (
                                                            <div key={index} className="mb-4">
                                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                                    Task {index + 1}:
                                                                </label>
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
                                                                <p></p>
                                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                                    Start Date:
                                                                </label>
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
                                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                                    End Date:
                                                                </label>
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
                                                                <p></p>
                                                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                                                    Priority:
                                                                </label>
                                                                <select
                                                                    className="select select-bordered w-full max-w-xs"
                                                                    name={`taskPriority${index + 1}`}
                                                                    value={task.priority || "low"}
                                                                    onChange={(e) =>
                                                                        handleTaskInputChange(index, e)
                                                                    }
                                                                >
                                                                    <option value="low">Low</option>
                                                                    <option value="medium">Medium</option>
                                                                    <option value="high">High</option>
                                                                </select>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary mr-2"
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
                                                                        },
                                                                    ],
                                                                }))
                                                            }
                                                        >
                                                            Add Task
                                                        </button>
                                                    </label>
                                                </div>
                                                <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse space-x-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsModalOpen(false)}
                                                        className="btn btn-secondary mt-3 sm:mt-0"
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
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => (
                            <div key={index} className="p-6 rounded-lg shadow-lg">
                                <h1 className="text-xl font-bold mb-4">{project.name}</h1>
                                <div className="flex">
                                    <div className="w-full">
                                        <h2 className="text-lg font-bold mb-2">Tasks:</h2>
                                        {project.tasks &&
                                            project.tasks.map((task, index) => {
                                                const taskKey = `${project.id}-${index}`;
                                                console.log("Task Key:", taskKey);

                                                return (
                                                    <div key={taskKey} className="mb-2">
                                                        <p className="text-md">
                                                            <span className="font-bold">Task {index + 1}:</span> {task.name}
                                                        </p>
                                                        <p className="text-sm">Priority: {task.priority}</p>
                                                        <p className="text-sm">Start Date: {task.startDate}</p>
                                                        <p className="text-sm">End Date: {task.endDate}</p>
                                                    </div>
                                                );
                                            })}

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

