import {
    getDashboardProjects,
    getProjectById,
    getProjectMessages,
    getProjectTasks,
} from "./projectService";

function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function sortByDateDesc(items, picker) {
    return [...items].sort((left, right) => {
        const leftTime = picker(left)?.getTime?.() ?? 0;
        const rightTime = picker(right)?.getTime?.() ?? 0;
        return rightTime - leftTime;
    });
}

export const getWorkspaceSnapshot = async () => {
    const projects = await getDashboardProjects();

    const taskResults = await Promise.all(
        projects.map(async (project) => ({
            project,
            tasks: await getProjectTasks(project.id),
        }))
    );

    const messageResults = await Promise.all(
        projects.map(async (project) => ({
            project,
            messages: await getProjectMessages(project.id),
        }))
    );

    const projectMap = new Map(projects.map((project) => [project.id, project]));

    const tasks = taskResults.flatMap(({ project, tasks: projectTasks }) =>
        projectTasks.map((task) => ({
            ...task,
            projectId: project.id,
            projectName: project.projectName,
        }))
    );

    const messages = messageResults.flatMap(({ project, messages: projectMessages }) =>
        projectMessages.map((message) => ({
            ...message,
            projectId: project.id,
            projectName: project.projectName,
        }))
    );

    const files = [];

    const projectDetails = await Promise.all(
        projects.map(async (project) => getProjectById(project.id))
    );

    return {
        projects: sortByDateDesc(projects, (project) => parseDate(project.updatedAt)),
        projectMap,
        projectDetails,
        tasks: sortByDateDesc(tasks, (task) => parseDate(task.updatedAt) || parseDate(task.createdAt)),
        messages: sortByDateDesc(messages, (message) => parseDate(message.createdAt)),
        files,
    };
};

export const buildWorkspaceNotifications = (snapshot) => {
    const notifications = [];

    snapshot.tasks
        .filter((task) => task.dueDate)
        .filter((task) => {
            const due = parseDate(task.dueDate);
            if (!due) return false;
            const now = new Date();
            const diff = due.getTime() - now.getTime();
            return diff <= 1000 * 60 * 60 * 24 * 7;
        })
        .slice(0, 6)
        .forEach((task) => {
            notifications.push({
                id: `deadline-${task.id}`,
                type: "DEADLINE",
                title: task.title,
                projectName: task.projectName,
                detail: task.dueDate ? `Deadline ${formatDate(task.dueDate)}` : "Chưa có deadline",
                createdAt: task.dueDate,
            });
        });

    snapshot.messages.slice(0, 6).forEach((message) => {
        notifications.push({
            id: `message-${message.id}`,
            type: "MESSAGE",
            title: message.senderName || message.senderEmail,
            projectName: message.projectName,
            detail: message.content,
            createdAt: message.createdAt,
        });
    });

    snapshot.projects.slice(0, 6).forEach((project) => {
        notifications.push({
            id: `project-${project.id}`,
            type: "PROJECT",
            title: project.projectName,
            projectName: project.projectName,
            detail: project.nextAction,
            createdAt: project.updatedAt || project.createdAt,
        });
    });

    return sortByDateDesc(notifications, (item) => parseDate(item.createdAt));
};

export const buildWorkspaceReports = (snapshot) => {
    const totalProjects = snapshot.projects.length;
    const totalTasks = snapshot.tasks.length;
    const totalMessages = snapshot.messages.length;
    const doneTasks = snapshot.tasks.filter((task) => task.status === "DONE").length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks * 1000) / totalTasks) / 10;

    return {
        totalProjects,
        totalTasks,
        totalMessages,
        doneTasks,
        completionRate,
        upcomingDeadlines: snapshot.tasks.filter((task) => task.dueDate).length,
        activeProjects: snapshot.projects.filter((project) => project.status === "ACTIVE").length,
        projects: snapshot.projects,
        tasks: snapshot.tasks,
    };
};

function formatDate(value) {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
    }).format(new Date(value));
}
