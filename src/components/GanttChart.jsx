// import React, { useEffect, useRef } from 'react';
// import 'dhtmlx-gantt';
// import 'dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css';
// import { gantt } from "dhtmlx-gantt";
//
// // Define custom functions for button actions
// const saveTask = () => {
//     const form = document.getElementById('my_editor_form');
//     const taskName = form.querySelector('#editor_task_name').value;
//     const startDate = form.querySelector('#editor_start_date').value;
//     const duration = form.querySelector('#editor_duration').value;
//     const holders = form.querySelector('#editor_holders').value;
//
//     const taskId = gantt.getState().lightbox;
//     const task = gantt.getTask(taskId);
//
//     // Update task properties using the task object
//     task.text = taskName;
//     task.start_date = startDate;
//     task.duration = duration;
//     task.holders = holders;
//
//     // Refresh the task in the Gantt chart
//     gantt.updateTask(taskId);
//
//     // Close the lightbox
//     gantt.hideLightbox();
// };
//
// window.cancelTask = () => {
//     // Close the lightbox
//     const lightbox = gantt.getLightbox();
//     lightbox.close();
// };
//
// window.deleteTask = () => {
//     const taskId = gantt.getState().lightbox;
//
//     // Ensure that taskId is valid before attempting to delete
//     if (taskId) {
//         const task = gantt.getTask(taskId);
//
//         // Check if the task with the given ID exists
//         if (task) {
//             gantt.deleteTask(taskId);
//             gantt.hideLightbox();
//         } else {
//             // Handle the case when the task with the given ID does not exist
//             console.warn(`Task with ID ${taskId} not found`);
//         }
//     } else {
//         // Handle the case when there is no task ID available
//         console.warn('No task ID available for deletion');
//     }
// };
//
// const GanttChart = () => {
//     const ganttContainerRef = useRef(null);
//
//     useEffect(() => {
//         const { gantt } = window;
//
//         // Function to confirm task deletion
//         const confirmDelete = () => {
//             document.getElementById('delete_modal').showModal();
//         };
//
//         gantt.form_blocks["my_editor"] = {
//             render: function (sns) {
//                 return `<div id="my_editor_form" class='dhx_cal_ltext p-8 card-body'>
//           <div class='mb-4'>
//             <label class='block font-medium text-gray-700 mb-2' for='editor_task_name'>Task Name</label>
//             <input type='text' id='editor_task_name' class='input input-bordered input-info text-gray-400 w-full max-w-xs editor_task_name' placeholder='Enter task name' />
//           </div>
//           <div class='mb-4'>
//             <label class='block font-medium text-gray-700 mb-2' for='editor_start_date'>Start Date</label>
//             <input type='date' id='editor_start_date' class='input input-bordered input-info text-gray-400 w-full max-w-xs editor_start_date' />
//           </div>
//           <div class='mb-4'>
//             <label class='block font-medium text-gray-700 mb-2' for='editor_duration'>Duration (days)</label>
//             <input type='number' id='editor_duration' class='input input-bordered input-info text-gray-400 w-full max-w-xs editor_duration' />
//           </div>
//           <div class='mb-4'>
//             <label class='block font-medium text-gray-700 mb-2' for='editor_holders'>Holders</label>
//             <select id='editor_holders' class='select select-secondary w-full max-w-xs editor_holders'>
//               <option disabled selected>Pick your favorite language</option>
//               <option>Java</option>
//               <option>Go</option>
//               <option>C</option>
//               <option>C#</option>
//               <option>C++</option>
//               <option>Rust</option>
//               <option>JavaScript</option>
//               <option>Python</option>
//             </select>
//           </div>
//           <div class='flex justify-end'>
//             <button class='btn btn-success mr-2' onclick={saveTask}>Save</button>
//             <button class='btn btn-error mr-2' onclick={cancelTask}>Cancel</button>
//             <button class='btn btn-warning' onclick={confirmDelete}>Delete</button>
//           </div>
//         </div>`;
//             },
//             set_value: function (node, value, task) {
//                 node.querySelector(".editor_task_name").value = task.text || "";
//                 node.querySelector(".editor_start_date").value = task.start_date ? gantt.date.date_to_str('%Y-%m-%d')(task.start_date) : "";
//                 node.querySelector(".editor_duration").value = task.duration || "";
//                 node.querySelector(".editor_holders").value = task.holders || "";
//             },
//             get_value: function (node, task) {
//                 task.text = node.querySelector(".editor_task_name").value;
//                 task.start_date = node.querySelector(".editor_start_date").value;
//                 task.duration = node.querySelector(".editor_duration").value;
//                 task.holders = node.querySelector(".editor_holders").value;
//                 return ""; // Returning an empty string since we are using custom inputs
//             },
//             focus: function (node) {
//                 var a = node.querySelector(".editor_task_name");
//                 a.select();
//                 a.focus();
//             }
//         };
//
//         // Update Gantt lightbox sections
//         gantt.config.lightbox.sections = [
//             { name: "description", height: 320, map_to: "text", type: "my_editor", focus: true, backgroundColor: '#a991f7' },
//         ];
//
//         // Hide default buttons at the bottom using CSS
//         const style = document.createElement('style');
//         style.innerHTML = `
//       .gantt_cal_light .gantt_btn_set {
//         display: none !important;
//       }
//     `;
//         document.head.appendChild(style);
//
//         const ganttContainer = ganttContainerRef.current;
//
//         gantt.init(ganttContainer);
//
//         const tasks = [
//             { id: 1, text: 'Task 1', start_date: '2024-01-01', duration: 5, holders: 'Java' },
//             { id: 2, text: 'Task 2', start_date: '2024-01-02', duration: 3, holders: 'Go' },
//             { id: 3, text: 'Task 3', start_date: '2024-01-03', duration: 4, holders: 'C' },
//         ];
//
//         const links = [
//             { id: 1, source: 1, target: 2, type: '0' },
//             { id: 2, source: 2, target: 3, type: '0' },
//         ];
//
//         gantt.parse({ data: tasks, links });
//
//         return () => {
//             gantt.clearAll();
//         };
//     }, []);
//
//     const isTextElement = (el) => {
//         return el.tagName.toLowerCase() === 'input' && el.type === 'text';
//     };
//
//     const handleTaskClick = (taskId, e) => {
//         if (isTextElement(e.target)) {
//             return;
//         }
//
//         // Check if taskId is valid
//         if (taskId) {
//             const task = gantt.getTask(taskId);
//
//             // Check if the task exists
//             if (task) {
//                 gantt.showLightbox(taskId);
//             } else {
//                 // Handle the case when the task with the given ID does not exist
//                 console.warn(`Task with ID ${taskId} not found`);
//             }
//         } else {
//             // Handle the case when there is no task ID available
//             console.warn('No task ID available');
//         }
//     };
//
//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold mb-4 text-center">Project Gantt Chart</h1>
//             <div ref={ganttContainerRef} className="rounded-lg overflow-hidden" style={{ width: '100%', height: '500px' }} onClick={(e) => handleTaskClick(gantt.locate(e), e)}></div>
//
//             {/* Delete Modal */}
//             <dialog id="delete_modal" className="modal">
//                 <div className="modal-box">
//                     <h3 className="font-bold text-lg">Delete Task</h3>
//                     <p className="py-4">Are you sure you want to delete this task?</p>
//                     <div className="modal-action">
//                         <button className="btn btn-error mr-2" onClick={() => { gantt.deleteTask(gantt.getState().lightbox); document.getElementById('delete_modal').close(); }}>Delete</button>
//                         <button className="btn" onClick={() => { document.getElementById('delete_modal').close(); }}>Cancel</button>
//                     </div>
//                 </div>
//             </dialog>
//         </div>
//     );
// };
//
// export default GanttChart;


import React from "react";
import { ViewMode, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "../GanttHelper/view-switcher.jsx";
import { getStartEndDateForProject, initTasks } from "../GanttHelper/helper.jsx";
import "gantt-task-react/dist/index.css";
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS
import 'daisyui/dist/full.css';
//Init
const GanttChart = () => {
    const [view, setView] = React.useState(ViewMode.Day);
    const [tasks, setTasks] = React.useState(initTasks());
    const [isChecked, setIsChecked] = React.useState(true);
    let columnWidth = 60;
    if (view === ViewMode.Month) {
        columnWidth = 300;
    } else if (view === ViewMode.Week) {
        columnWidth = 250;
    }

    const ganttStyles = {
        // Add your custom styles here
        // For example:
        backgroundColor: "bg-primary",
        border: "1px solid transparent",
        rounded: "rounded-lg"
        // ... add more styles as needed
    };

    const handleTaskChange = (task) => {
        console.log("On date change Id:" + task.id);
        let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
        if (task.project) {
            const [start, end] = getStartEndDateForProject(newTasks, task.project);
            const project =
                newTasks[newTasks.findIndex((t) => t.id === task.project)];
            if (
                project.start.getTime() !== start.getTime() ||
                project.end.getTime() !== end.getTime()
            ) {
                const changedProject = { ...project, start, end };
                newTasks = newTasks.map((t) =>
                    t.id === task.project ? changedProject : t
                );
            }
        }
        setTasks(newTasks);
    };
    const handleTaskDelete = (task) => {
        const conf = window.confirm("Are you sure about " + task.name + " ?");
        if (conf) {
            setTasks(tasks.filter((t) => t.id !== task.id));
        }
        return conf;
    };
    const handleProgressChange = async (task) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
        console.log("On progress change Id:" + task.id);
    };
    const handleDblClick = (task) => {
        alert("On Double Click event Id:" + task.id);
    };
    const handleSelect = (task, isSelected) => {
        console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
    };
    const handleExpanderClick = (task) => {
        setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
        console.log("On expander click Id:" + task.id);
    };
    return (
        <div>
            <ViewSwitcher
                onViewModeChange={(viewMode) => setView(viewMode)}
                onViewListChange={setIsChecked}
                isChecked={isChecked}
            />
            <Gantt
                barCornerRadius="3"
                className="p-4"
                style={ganttStyles}
                tasks={tasks}
                viewMode={view}
                onDateChange={handleTaskChange}
                onDelete={handleTaskDelete}
                onProgressChange={handleProgressChange}
                onDoubleClick={handleDblClick}
                onSelect={handleSelect}
                onExpanderClick={handleExpanderClick}
                listCellWidth={isChecked ? "155px" : ""}
                columnWidth={columnWidth}
            />

        </div>
    );
};
export default GanttChart;