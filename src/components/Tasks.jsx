import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const TaskItem = ({ task, onTaskClick, index }) => {
    const [, drag] = useDrag({
        type: 'TASK',
        item: { task, id: task.id, index },
    });

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
                                allTasks.push(taskData);
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
                        setLoading(false);
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

    // Group tasks by status
    const categorizedTasks = taskData.reduce((categories, task) => {
        const existingCategory = categories.find((cat) => cat.status === task.status);

        if (existingCategory) {
            existingCategory.tasks.push(task);
        } else {
            categories.push({
                status: task.status,
                tasks: [task],
            });
        }

        return categories;
    }, []);

    console.log('Categorized tasks:', categorizedTasks);

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
        const userId = user.uid;

        // Construct the user's projects collection path
        const userProjectsCollectionRef = collection(db, `projects/${userId}/projects`);

        // Find the project document that contains the edited task
        const projectSnapshot = await getDocs(userProjectsCollectionRef);
        const projectDoc = projectSnapshot.docs.find((doc) =>
            doc.data().tasks.some((t) => t.id === editedTask.id)
        );

        if (projectDoc) {
            const projectId = projectDoc.id;

            // Construct the tasks subcollection path for the project
            const userTasksCollectionRef = collection(db, `projects/${userId}/projects/${projectId}/tasks`);

            // Update Firestore with the edited task data
            await updateDoc(userTasksCollectionRef, editedTask.id, editedTask);
        } else {
            console.error('Project not found for the edited task');
        }
    };

    const handleCloseEnlargedTask = () => {
        setEnlargedTask(null);
        setEditedTask(null);
        document.getElementById('enlargedTaskModal').close();
    };

    const moveTask = async (fromIndex, toIndex, fromCategoryIndex, toCategoryIndex, taskId) => {
        try {
            const updatedTaskData = [...taskData];
            const movedTaskIndex = updatedTaskData[fromCategoryIndex].tasks.findIndex((t) => t.id === taskId);

            if (movedTaskIndex !== -1) {
                const [movedTask] = updatedTaskData[fromCategoryIndex].tasks.splice(movedTaskIndex, 1);

                const adjustedToIndex =
                    toIndex < 0
                        ? 0
                        : toIndex >= updatedTaskData[toCategoryIndex].tasks.length
                            ? updatedTaskData[toCategoryIndex].tasks.length
                            : toIndex;

                movedTask.status = updatedTaskData[toCategoryIndex].status;
                movedTask.bgColor = getColorClass(movedTask.status);
                updatedTaskData[toCategoryIndex].tasks.splice(adjustedToIndex, 0, movedTask);

                setTaskData(updatedTaskData);

                const auth = getAuth();
                const user = auth.currentUser;
                const userId = user.uid;

                // Construct the tasks collection path for the project
                const userTasksCollectionRef = collection(db, `projects/${userId}/projects/tasks`);

                // Find the task document
                const taskSnapshot = await getDocs(userTasksCollectionRef);
                const taskDoc = taskSnapshot.docs.find((doc) => doc.id === taskId);

                console.log('Task document:', taskDoc?.data());

                if (taskDoc) {
                    // Reference the document and update specific fields (e.g., status)
                    const taskDocRef = doc(userTasksCollectionRef, taskId);
                    await updateDoc(taskDocRef, { status: movedTask.status });
                } else {
                    console.error('Task document not found');
                }
            }
        } catch (error) {
            console.error('Error moving task:', error);
        }
    };


    const getColorClass = (status) => {
        switch (status) {
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

    const TaskCategory = ({ category, index }) => {
        const [, drop] = useDrop({
            accept: 'TASK',
            drop: async (item, monitor) => {
                if (monitor.isOver()) {
                    const fromIndex = item.index;
                    const toIndex = index;
                    const fromCategoryIndex = taskData.findIndex((cat) => cat.status === item.task.status);
                    const toCategoryIndex = index;

                    await moveTask(fromIndex, toIndex, fromCategoryIndex, toCategoryIndex, item.id);
                    item.index = toIndex;
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
            <div key={index} ref={drop} className="w-1/3 rounded-xl p-4 shadow-lg">
                <div className="flex items-center mb-2">
                    <h2 className="text-lg font-bold">{category.status}</h2>
                    {getIconByStatus(category.status)}
                </div>
                {category.tasks && category.tasks.map((task, taskIndex) => (
                    <TaskItem key={task.id} task={task} onTaskClick={handleTaskItemClick} />
                ))}
                {/* Render UI for dropping even if there are no tasks */}
                {!category.tasks || category.tasks.length === 0 ? (
                    <div className="mt-4 p-2 border border-dashed border-gray-300 rounded">
                        Drop tasks here
                    </div>
                ) : null}
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

