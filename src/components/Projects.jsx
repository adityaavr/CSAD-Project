import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc, updateDoc,
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

        // Determine the type of input and update the task accordingly
        if (name.startsWith('taskName')) {
            newTasks[index].name = value;
        } else if (name.startsWith('startDate')) {
            newTasks[index].startDate = value;
        } else if (name.startsWith('endDate')) {
            newTasks[index].endDate = value;
        } else if (name.startsWith('taskPriority')) {
            newTasks[index].priority = value; // Ensure the priority is updated correctly
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
                // Add the project to the projects collection
                const userProjectsRef = collection(db, `projects/${userId}/projects`);
                const projectDocRef = await addDoc(userProjectsRef, formData);

                const projectId = projectDocRef.id;
                const project = formData.name; // Capture the project name
                const userTasksRef = collection(db, `projects/${userId}/projects/${projectId}/tasks`);

                // Modify each task to include the project name before adding it to Firestore
                const taskAdditionPromises = formData.tasks.map(task => {
                    const taskWithProjectName = { ...task, project }; // Add project to each task
                    return addDoc(userTasksRef, taskWithProjectName);
                });

                // Wait for all tasks to be added
                await Promise.all(taskAdditionPromises);




            setProjects((prevProjects) => [
                ...prevProjects,
                {id: projectId, ...formData},
            ]);

            // Reset the form
            setFormData({
                name: "",
                tasks: [{ name: "", priority: "low", startDate: "", endDate: "", status: "To do" }],
            });
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding project and tasks:", error.message);
        }
    };


    /*const handleEditProject = (project) => {
        setIsModalOpen(true);
        setFormData(project);
        setEditingProjectId(project.id); // Track the editing project's ID
        setEditingTaskId()
    };*/

    const handleDeleteProject = async (projectId) => {
        await deleteDoc(doc(db, `projects/${getAuth().currentUser.uid}/projects`, projectId));

        //Reference to the tasks subcollection
        const tasksRef = collection(db, `projects/${getAuth().currentUser.uid}/projects/${projectId}/tasks`);

        //Retrive all task documents
        const taskSnapshot = await getDocs(tasksRef);

        //Delete each task document
        const taskDeletionPromises = taskSnapshot.docs.map((taskDoc) => {
            return deleteDoc(doc(db, `projects/${getAuth().currentUser.uid}/projects/${projectId}/tasks`, taskDoc.id));
        });

        //Wait for all task documents to be deleted
        await Promise.all(taskDeletionPromises);

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
                                                                    name={`taskPriority${index + 1}`} // This should match the pattern checked in your handleTaskInputChange
                                                                    value={task.priority || "low"}
                                                                    onChange={(e) => handleTaskInputChange(index, e)}
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
                                                                            status: "To do", // Add this line to include status for new tasks
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
                            <div key={index} className="p-6 rounded-lg shadow-lg relative">
                                <div className="absolute right-2 top-2">
                                    <div className="dropdown dropdown-end">
                                        <label tabIndex="0" className="btn btn-ghost btn-circle">
                                            <div className="indicator">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </label>
                                        <ul tabIndex="0" className="menu dropdown-content p-2 shadow bg-base-100 rounded-box w-52">
                                            <li><a onClick={() => handleEditProject(project)}>Edit</a></li>
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
                                                    {/* Display other task details as needed */}
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


