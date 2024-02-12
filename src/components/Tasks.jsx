import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import log from "eslint-plugin-react/lib/util/log.js";

const TaskItem = ({ task, onTaskClick, index }) => {
    const [, drag] = useDrag({
        type: 'TASK',
        item: { task, id: task.id, index },
    });

    console.log(`Task ID: ${task.id}`);
    console.log(`Rendering TaskItem for task: ${task.name}`);
    console.log("Task data:", task);

    const getColorClass = () => {
        switch (task.status) {
            case 'To do':
                return 'bg-error';
            case 'Doing':
                return 'bg-warning';
            case 'Done':
                return 'bg-success';
            default:
                return '';
        }
    };

    console.log("Project: ", task.project);

    return (
        <div
            ref={drag}
            className={`mb-4 p-2 rounded ${getColorClass()}`}
            onClick={() => onTaskClick(task)}
        >
            <div className="pl-4 pr-4 py-2">
                <div className="font-bold">Task Name: {task.name}</div>
                {task.project && (
                    <div className="text-sm">Project: {task.project}</div>
                )}
                <div className="text-sm">Status: {task.status}</div>
            </div>
        </div>
    );
};

TaskItem.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        project: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
    onTaskClick: PropTypes.func.isRequired,
};

const taskCategories = [
    { status: 'To do' },
    { status: 'Doing' },
    { status: 'Done' },
];

const Tasks = () => {
    const [taskData, setTaskData] = useState([]);
    const [enlargedTask, setEnlargedTask] = useState(null);
    const [editedTask, setEditedTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                console.log('Fetching tasks...');
                const auth = getAuth();
                const unsubscribe = onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        const userId = user.uid;
                        const userProjectsCollectionRef = collection(db, `projects/${userId}/projects`);
                        const userProjectsSnapshot = await getDocs(userProjectsCollectionRef);

                        const allTasks = [];
                        for (const projectDoc of userProjectsSnapshot.docs) {
                            const projectId = projectDoc.id;
                            const userTasksCollectionRef = collection(db, `projects/${userId}/projects/${projectId}/tasks`);
                            const userTasksSnapshot = await getDocs(userTasksCollectionRef);

                            userTasksSnapshot.forEach((taskDoc) => {
                                const taskData = taskDoc.data();
                                allTasks.push({ ...taskData, id: taskDoc.id }); // Include the Firestore document ID
                            });
                        }

                        console.log('Tasks fetched successfully:', allTasks);

                        // Initialize state with categorized tasks
                        const categorizedTasks = taskCategories.map((category) => {
                            const tasksInCategory = allTasks.filter((task) => task.status === category.status);
                            return { status: category.status, tasks: tasksInCategory };
                        });

                        console.log('Categorized tasks:', categorizedTasks);

                        setTaskData(categorizedTasks);
                        setTimeout(() => setLoading(false), 1000);
                    }
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    useEffect(() => {
        console.log('Task data updated:', taskData);
    }, [taskData]);

    const handleTaskItemClick = (task) => {
        setEnlargedTask(task);
        setEditedTask({ ...task });
        document.getElementById('enlargedTaskModal').showModal();
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditedTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    const handleSaveEdit = async () => {
        console.log('Edited Task Data:', editedTask);
        handleCloseEnlargedTask();

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error("User not authenticated");
            return;
        }
        const userId = user.uid;

        try {
            // Find the project that contains the task
            const projectId = await findProjectIdForTask(editedTask.id, userId);
            if (!projectId) {
                throw new Error("Project not found for the edited task");
            }

            // Update the task in Firebase
            const taskRef = doc(db, `projects/${userId}/projects/${projectId}/tasks`, editedTask.id);
            await updateDoc(taskRef, { ...editedTask });

            // Optimistically update the UI
            updateTaskInLocalState(editedTask);

            console.log('Task updated successfully in Firestore');
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

// Function to update a task in the local state
    // Function to move a task to its new category in the local state
    const updateTaskInLocalState = (updatedTask) => {
        setTaskData((prevTaskData) => {
            // Remove the task from its current category
            const newTaskData = prevTaskData.map((category) => ({
                ...category,
                tasks: category.tasks.filter((task) => task.id !== updatedTask.id),
            }));

            // Find the index of the new category the task should be in
            const newCategoryIndex = newTaskData.findIndex(
                (category) => category.status === updatedTask.status
            );

            // Add the task to the new category
            if (newCategoryIndex !== -1) {
                newTaskData[newCategoryIndex].tasks.push(updatedTask);
            } else {
                console.error("New category not found for the updated task");
            }

            return newTaskData;
        });
    };



    const handleCloseEnlargedTask = () => {
        setEnlargedTask(null);
        setEditedTask(null);
        document.getElementById('enlargedTaskModal').close();
    };

    const moveTask = async (taskId, fromCategoryStatus, toCategoryStatus) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                console.error("User not authenticated");
                return;
            }
            const userId = user.uid;

            // Use the function to find the project ID for the task
            const projectId = await findProjectIdForTask(taskId, userId);

            if (!projectId) {
                console.error("Project for task not found");
                return;
            }

            // Now that you have the project ID, construct the path to the task document
            const taskRef = doc(db, `projects/${userId}/projects/${projectId}/tasks`, taskId);

            // Update the task's status
            await updateDoc(taskRef, { status: toCategoryStatus });
            console.log('Task status updated successfully in Firestore');
            updateTaskStatusAndCategory(taskId, toCategoryStatus); // Update local state to reflect the change



            // Update your local state as necessary
        } catch (error) {
            console.error('Error moving task:', error);
        }
    };


    async function findProjectIdForTask(taskId, userId) {
        try {
            const projectsRef = collection(db, `projects/${userId}/projects`);
            const querySnapshot = await getDocs(projectsRef);

            for (const projectDoc of querySnapshot.docs) {
                const projectId = projectDoc.id;
                const tasksRef = collection(db, `projects/${userId}/projects/${projectId}/tasks`);
                const tasksSnapshot = await getDocs(tasksRef);

                const taskExists = tasksSnapshot.docs.some(taskDoc => taskDoc.id === taskId);
                if (taskExists) {
                    return projectId; // Return the project ID where the task was found
                }
            }

            // If the task was not found in any project, return null or an appropriate value
            return null;
        } catch (error) {
            console.error("Error finding project for task:", error);
            return null;
        }
    }


    // Example of updating local state after Firestore update (simplified)
    const updateLocalStateWithNewStatus = (taskId, newStatus) => {
        setTaskData(prevTaskData => prevTaskData.map(category => ({
            ...category,
            tasks: category.tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, status: newStatus }; // Update the status of the relevant task
                }
                return task;
            })
        })));
    };


    const updateTaskStatusAndCategory = (taskId, newStatus) => {
        setTaskData(currentTaskData => {
            // Create a deep copy of the current task data
            const newTaskData = currentTaskData.map(category => ({
                ...category,
                tasks: category.tasks.filter(task => task.id !== taskId) // Remove the task from its current category
            }));

            // Find the task that is being updated
            const taskToUpdate = currentTaskData
                .flatMap(category => category.tasks)
                .find(task => task.id === taskId);

            if (!taskToUpdate) {
                console.error("Task not found");
                return currentTaskData; // Return the original data if the task is not found
            }

            // Update the task's status
            const updatedTask = { ...taskToUpdate, status: newStatus };

            // Add the updated task to its new category
            const targetCategoryIndex = newTaskData.findIndex(category => category.status === newStatus);
            if (targetCategoryIndex !== -1) {
                newTaskData[targetCategoryIndex].tasks.push(updatedTask);
            } else {
                console.error("Target category not found");
            }

            return newTaskData; // Return the updated task data
        });
    };

    const TaskCategory = ({ category, index }) => {
        const [, drop] = useDrop({
            accept: 'TASK',
            drop: async (item, monitor) => {
                if (monitor.isOver()) {
                    const fromCategoryStatus = item.task.status; // Assuming the dragged item includes its current status
                    const toCategoryStatus = category.status; // The target category's status

                    await moveTask(item.id, fromCategoryStatus, toCategoryStatus);
                }
            },
        });

        console.log(`Rendering TaskCategory for category: ${category.status}`);
        console.log(`Tasks in category:`, category.tasks);

        const getIconByStatus = (status) => {
            switch (status) {
                case 'To do':
                    return (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 ml-2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                            />
                        </svg>
                    );
                case 'Doing':
                    return (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 ml-2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                    );
                case 'Done':
                    return (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6 ml-2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                    );
                default:
                    return null;
            }
        };

        return (
            <div ref={drop} className="w-1/3 rounded-xl p-4 shadow-lg">
                <div className="flex items-center mb-2">
                    <h2 className="text-lg font-bold">{category.status}</h2>
                    {getIconByStatus(category.status)}
                </div>
                {category.tasks.length > 0 ? (
                    category.tasks.map((task, taskIndex) => (
                        <TaskItem key={task.id} task={task} onTaskClick={handleTaskItemClick} />
                    ))
                ) : (
                    <div className="mt-4 p-2 border border-dashed border-gray-300 rounded">
                        Drop tasks here
                    </div>
                )}
            </div>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                {loading && (
                    <div className="flex items-center justify-center min-h-screen">
                        <span className="loading loading-infinity loading-lg"></span>
                    </div>
                )}

                {!loading && (
                    <div className="flex justify-between p-4 gap-4">
                        {taskData.map((category, index) => (
                            <TaskCategory key={index} category={category} index={index} />
                        ))}

                        {enlargedTask && (
                            <dialog id="enlargedTaskModal" className="modal">
                                <div className="modal-box">
                                    <h2 className="text-lg font-bold mb-4">Edit Task</h2>
                                    <div className={`rounded ${enlargedTask.bgColor} p-4`}>
                                        <label className="form-control w-full max-w-xs">
                                            <div className="label">
                                                <span className="label-text">Task Name</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editedTask.name}
                                                onChange={handleEditChange}
                                                placeholder="Type here"
                                                className="input input-bordered w-full max-w-xs"
                                            />
                                        </label>
                                        <label className="form-control w-full max-w-xs">
                                            <div className="label">
                                                <span className="label-text">Project</span>
                                            </div>
                                            <input
                                                type="text"
                                                name="project"
                                                value={editedTask.project}
                                                onChange={handleEditChange}
                                                placeholder="Type here"
                                                className="input input-bordered w-full max-w-xs"
                                                disabled
                                            />
                                        </label>
                                        <label className="form-control w-full max-w-xs">
                                            <div className="label">
                                                <span className="label-text">Status</span>
                                            </div>
                                            <select
                                                name="status"
                                                value={editedTask.status}
                                                onChange={handleEditChange}
                                                className="select select-bordered w-full max-w-xs"
                                            >
                                                <option className="text-error" value="To do">
                                                    To do
                                                </option>
                                                <option className="text-warning" value="Doing">
                                                    Doing
                                                </option>
                                                <option className="text-success" value="Done">
                                                    Done
                                                </option>
                                            </select>
                                        </label>
                                        <div className="mt-2 space-x-2 space-y-3">
                                            <button className="btn btn-primary" onClick={handleSaveEdit}>
                                                Save
                                            </button>
                                            <button className="btn" onClick={handleCloseEnlargedTask}>
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </dialog>
                        )}
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

export default Tasks;



