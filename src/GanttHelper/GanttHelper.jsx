export function initTasks() {
    const currentDate = new Date();
    const tasks = [
        {
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            name: "Some Project",
            id: "ProjectSample",
            progress: 25,
            type: "project",
            hideChildren: false
        },
        {
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                2,
                12,
                28
            ),
            name: "Idea",
            id: "Task 0",
            progress: 45,
            type: "task",
            project: "ProjectSample"
        },
        {
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
            name: "Research",
            id: "Task 1",
            progress: 25,
            dependencies: ["Task 0"],
            type: "task",
            project: "ProjectSample"
        },
        {
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
            name: "Discussion with team",
            id: "Task 2",
            progress: 10,
            dependencies: ["Task 1"],
            type: "task",
            project: "ProjectSample"
        },
        {
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
            name: "Developing",
            id: "Task 3",
            progress: 2,
            dependencies: ["Task 2"],
            type: "task",
            project: "ProjectSample"
        },
        {
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
            name: "Review",
            id: "Task 4",
            type: "task",
            progress: 70,
            dependencies: ["Task 2"],
            project: "ProjectSample"
        },
        {
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            name: "Release",
            id: "Task 6",
            progress: currentDate.getMonth(),
            type: "milestone",
            dependencies: ["Task 4"],
            project: "ProjectSample"
        },
    ];
    return tasks;
}
export function getStartEndDateForProject(tasks, projectId) {
    const projectTasks = tasks.filter((t) => t.project === projectId);
    let start = projectTasks[0].start;
    let end = projectTasks[0].end;
    for (let i = 0; i < projectTasks.length; i++) {
        const task = projectTasks[i];
        if (start.getTime() > task.start.getTime()) {
            start = task.start;
        }
        if (end.getTime() < task.end.getTime()) {
            end = task.end;
        }
    }
    return [start, end];
}

export function calculateProgress(tasks) {
    if (!tasks || tasks.length === 0) return 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'Done').length;

    return (completedTasks / totalTasks) * 100;
}

export function convertFirestoreProjectsToGanttFormat(projects) {
    const ganttData = [];

    projects.forEach((project) => {
        const projectData = {
            start: project.startDate ? new Date(project.startDate) : new Date(),
            end: project.endDate ? new Date(project.endDate) : new Date(),
            name: project.name || "",
            id: project.id || "",
            progress: project.tasks ? calculateProgress(project.tasks) : 0,
            type: "project",
            hideChildren: false,
        };

        const projectTasks = project.tasks || [];
        const taskData = convertFirestoreTasksToGanttFormat(projectTasks);

        ganttData.push(projectData, ...taskData);
    });

    return ganttData;
}

export function convertFirestoreTasksToGanttFormat(tasks) {
    return tasks.map((task) => {
        const dependencies = task.dependencies || [];

        // Filter out dependencies that don't exist in the tasks array
        const validDependencies = dependencies.filter((depId) =>
            tasks.some((t) => t.id === depId)
        );

        return {
            start: task.startDate ? new Date(task.startDate) : new Date(),
            end: task.endDate ? new Date(task.endDate) : new Date(),
            name: task.name || "",
            id: task.id || "",
            progress: task.progress || 0,
            type: task.type || "task",
            dependencies: validDependencies,
            project: task.project || "",
        };
    });
}
