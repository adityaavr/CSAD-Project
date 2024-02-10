import React, { useEffect, useState } from "react";
import { ViewMode, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "../GanttHelper/view-switcher.jsx";
import {
    getStartEndDateForProject,
    initTasks
} from "../GanttHelper/GanttHelper.jsx";
import "gantt-task-react/dist/index.css";
import 'tailwindcss/tailwind.css';
import 'daisyui/dist/full.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {collection, onSnapshot} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Tasks from "./Tasks.jsx";

const GanttChart = () => {
    const [view, setView] = useState(ViewMode.Day);
    const [tasks, setTasks] = useState(initTasks());
    const [isChecked, setIsChecked] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const unsubscribe = onSnapshot(collection(db, `projects/${user.uid}/projects`), (snapshot) => {
                    const ganttData = [];
                    snapshot.docs.forEach(doc => {
                        const project = doc.data();
                        const projectId = doc.id;

                        const sortedTasks = project.tasks.map((task, index) => ({
                            ...task,
                            start: task.startDate instanceof Date ? task.startDate : new Date(task.startDate),
                            end: task.endDate instanceof Date ? task.endDate : new Date(task.endDate),
                            id: `${projectId}-task-${index}`, // Generate unique task IDs
                        })).sort((a, b) => a.start - b.start);

                        // Set dependencies based on task order
                        sortedTasks.forEach((task, index) => {
                            if (index > 0) { // Skip the first task as it has no dependencies
                                task.dependencies = [sortedTasks[index - 1].id];
                            }
                        });

                        // Add project and its tasks to ganttData
                        ganttData.push({
                            start: sortedTasks[0]?.start || new Date(),
                            end: sortedTasks[sortedTasks.length - 1]?.end || new Date(),
                            name: project.name,
                            id: projectId,
                            progress: project.progress || 0,
                            type: "project",
                            hideChildren: false
                        });

                        ganttData.push(...sortedTasks);
                    });
                    setTasks(ganttData);
                    setLoading(false);
                });
                return () => unsubscribe();
            }
        });
    }, []);

    let columnWidth = 60;
    if (view === ViewMode.Month) {
        columnWidth = 300;
    } else if (view === ViewMode.Week) {
        columnWidth = 250;
    }

    const ganttStyles = {
        backgroundColor: "bg-primary",
        border: "1px solid transparent",
        rounded: "rounded-lg"
    };

    const handleTaskChange = (task) => {
        let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
        if (task.project) {
            const [start, end] = getStartEndDateForProject(newTasks, task.project);
            const project = newTasks[newTasks.findIndex((t) => t.id === task.project)];
            if (
                project.startDate.getTime() !== start.getTime() ||
                project.endDate.getTime() !== end.getTime()
            ) {
                const changedProject = { ...project, startDate: start, endDate: end };
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
    };

    const handleDblClick = (task) => {
        alert("On Double Click event Id:" + task.id);
    };

    const handleSelect = (task, isSelected) => {
        console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
    };

    const handleExpanderClick = (clickedTask) => {
        if (clickedTask.type === 'project') {
            setTasks(prevTasks => {
                // First, toggle the 'hideChildren' property of the clicked project
                const updatedTasks = prevTasks.map(task => {
                    if (task.id === clickedTask.id) {
                        return { ...task, hideChildren: !task.hideChildren };
                    }
                    return task;
                });

                // Then, update the visibility of all child tasks based on the updated 'hideChildren' value
                return updatedTasks.map(task => {
                    if (task.project === clickedTask.id) {
                        // Find the updated project to get the current value of 'hideChildren'
                        const parentProject = updatedTasks.find(t => t.id === clickedTask.id);
                        return { ...task, hidden: parentProject.hideChildren };
                    }
                    return task;
                });
            });
        }
    };


    return (
        <div className="card card-body shadow-lg">
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
            >
                {tasks.map((task) => (
                    <Tasks
                        key={`${task.id}-${task.type}`}
                        task={task}
                        onDateChange={handleTaskChange}
                        onDelete={handleTaskDelete}
                        onProgressChange={handleProgressChange}
                        onDoubleClick={handleDblClick}
                        onSelect={handleSelect}
                        onExpanderClick={handleExpanderClick}
                    />
                ))}

            </Gantt>
        </div>
    );
};

export default GanttChart;
