import React, { useState } from 'react';


const Tasks = () => {
    const taskData = [
        {
            status: 'To do',
            tasks: [
                { name: 'Design Wireframe', project: 'Website Redesign', status: 'To do', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
                { name: 'Update Branding', project: 'Rebranding Initiative', status: 'To do', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
                { name: 'Compile Research', project: 'Market Analysis', status: 'To do', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
            ],
            bgColor: 'bg-error',
        },
        {
            status: 'Doing',
            tasks: [
                { name: 'Develop Feature X', project: 'New App Development', status: 'Doing', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
                { name: 'Test Module Y', project: 'Quality Assurance', status: 'Doing', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
                { name: 'Refactor Component', project: 'Tech Debt Reduction', status: 'Doing', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
            ],
            bgColor: 'bg-warning',
        },
        {
            status: 'Done',
            tasks: [
                { name: 'Deploy to Production', project: 'Deployment Cycle', status: 'Done', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
                { name: 'Run Marketing Campaign', project: 'Product Launch', status: 'Done', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
                { name: 'Conduct User Interviews', project: 'UX Research', status: 'Done', details: 'Details...', image: '/src/assets/prof_pic-removebg-preview.png' },
            ],
            bgColor: 'bg-success',
        },
    ];

    // State to track which task item should be enlarged
    const [enlargedTask, setEnlargedTask] = useState(null);
    // State to track edited task data
    const [editedTask, setEditedTask] = useState(null);

    // Function to handle task item click and set the enlarged task
    const handleTaskItemClick = (task) => {
        setEnlargedTask(task);
        setEditedTask({ ...task }); // Create a copy of the task for editing
        document.getElementById('enlargedTaskModal').showModal();
    };

    // Function to handle changes in edited task data
    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditedTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    // Function to save the edited task data
    const handleSaveEdit = () => {
        // Implement the logic to save the edited task data here
        // You can update your data or make an API call to save changes
        console.log('Edited Task Data:', editedTask);
        handleCloseEnlargedTask();
    };

    // Function to close the enlarged task
    const handleCloseEnlargedTask = () => {
        setEnlargedTask(null);
        setEditedTask(null);
        document.getElementById('enlargedTaskModal').close();
    };

    return (
        <div className="flex justify-between p-4 gap-4">
            {taskData.map((category, idx) => (
                <div key={idx} className="w-1/3 rounded-xl p-4 shadow-lg">
                    <h2 className="text-lg font-bold mb-4">{category.status}</h2>
                    {category.tasks.map((task, taskIndex) => (
                        <div
                            key={taskIndex}
                            className={`relative mb-4 p-2 rounded ${category.bgColor}`}
                            onClick={() => handleTaskItemClick(task)}
                        >
                            <div className="pl-4 pr-4 py-2">
                                <div className="font-bold">Task Name: {task.name}</div>
                                <div className="text-sm">Project: {task.project}</div>
                                <div className="text-sm">Status: {task.status}</div>
                                <div className="text-sm mt-2">{task.details}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* Enlarged task modal using DaisyUI */}
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
                                    <option className="text-error" value="To do">To do</option>
                                    <option className="text-warning" value="Doing">Doing</option>
                                    <option className="text-success" value="Done">Done</option>
                                </select>
                            </label>
                            <div className="mt-2 space-x-2 space-y-3">
                                <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                                <button className="btn" onClick={handleCloseEnlargedTask}>Close</button>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default Tasks;