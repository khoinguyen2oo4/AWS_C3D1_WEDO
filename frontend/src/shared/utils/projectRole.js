export function normalizeEmail(email) {
    return (email || "").trim().toLowerCase();
}

export function isProjectOwner(project, email) {
    return getProjectRole(project, email) === "OWNER";
}

export function getProjectRole(project, email) {
    if (project?.currentUserRole) {
        return project.currentUserRole;
    }
    return normalizeEmail(project?.ownerEmail) === normalizeEmail(email) ? "OWNER" : "MEMBER";
}

export function canManageProject(project, email) {
    return ["OWNER", "CO_OWNER"].includes(getProjectRole(project, email));
}

export function canManageDelivery(project, email) {
    return ["OWNER", "CO_OWNER", "MANAGER"].includes(getProjectRole(project, email));
}

export function canInteractInProject(project, email) {
    return getProjectRole(project, email) !== "VIEWER";
}

/** Menu trong phòng dự án — Owner quản lý, Member làm việc & nộp file */
export const PROJECT_NAV_OWNER = [
    { to: "", labelKey: "nav.overview", end: true },
    { to: "tasks", labelKey: "nav.tasks" },
    { to: "members", labelKey: "nav.members" },
    { to: "chat", labelKey: "nav.chat" },
    { to: "files", labelKey: "nav.files" },
    { to: "performance", labelKey: "nav.performance" },
    { to: "ai", labelKey: "nav.ai" },
    { to: "invite", labelKey: "nav.invite" },
    { to: "settings", labelKey: "nav.settings" },
];

export const PROJECT_NAV_MEMBER = [
    { to: "", labelKey: "nav.overview", end: true },
    { to: "tasks", labelKey: "nav.tasks" },
    { to: "chat", labelKey: "nav.chat" },
    { to: "files", labelKey: "nav.filesMember" },
    { to: "performance", labelKey: "nav.performance" },
    { to: "ai", labelKey: "nav.ai" },
    { to: "settings", labelKey: "nav.settings" },
];

export function getProjectNavItems(canManage) {
    return canManage ? PROJECT_NAV_OWNER : PROJECT_NAV_MEMBER;
}

export function getWorkspaceRoleLabel(ownedCount, memberCount) {
    if (ownedCount > 0 && memberCount > 0) return "Owner · Member";
    if (ownedCount > 0) return "Owner";
    if (memberCount > 0) return "Member";
    return "User";
}
