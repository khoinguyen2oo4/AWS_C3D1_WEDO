export function getProjectStatusOptions(t) {
    return ["ACTIVE", "ON_HOLD", "ARCHIVED"].map((value) => ({
        value,
        label: t(`status.project.${value}`),
        hint: t(`status.projectHint.${value}`),
    }));
}

export function getProjectVisibilityOptions(t) {
    return ["PRIVATE", "TEAM", "PUBLIC"].map((value) => ({
        value,
        label: t(`status.visibility.${value}`),
        hint: t(`status.visibilityHint.${value}`),
    }));
}

export function getTaskStatusOptions(t) {
    return ["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((value) => ({
        value,
        label: t(`status.task.${value}`),
        hint: t(`status.taskHint.${value}`),
    }));
}

export function getTaskPriorityOptions(t) {
    return ["LOW", "MEDIUM", "HIGH"].map((value) => ({
        value,
        label: t(`status.priority.${value}`),
        hint: t(`status.priorityHint.${value}`),
    }));
}

export function getMemberRoleOptions(t) {
    return ["CO_OWNER", "MANAGER", "MEMBER", "VIEWER"].map((value) => ({
        value,
        label: t(`status.memberRole.${value}`),
        hint: t(`status.memberRole.${value}`),
    }));
}

export function getRiskFilterOptions(t) {
    return [
        { value: "ALL", label: t("tasks.riskAll"), hint: t("tasks.riskAll") },
        { value: "STABLE", label: t("tasks.riskStable"), hint: t("tasks.riskStableHint") },
        { value: "LOW", label: t("tasks.riskLow"), hint: t("tasks.riskLowHint") },
        { value: "MEDIUM", label: t("tasks.riskMedium"), hint: t("tasks.riskMediumHint") },
        { value: "HIGH", label: t("tasks.riskHigh"), hint: t("tasks.riskHighHint") },
    ];
}

export function getAssigneeFilterOptions(t, members = []) {
    return [
        { value: "ALL", label: t("tasks.filterAll"), hint: "" },
        { value: "UNASSIGNED", label: t("tasks.unassigned"), hint: "" },
        ...members.map((m) => ({
            value: m.memberEmail,
            label: m.memberName || m.memberEmail,
            hint: m.role,
        })),
    ];
}

export function getDashboardScopeOptions(t) {
    return [
        { value: "ALL", label: t("dashboard.scopeAll"), hint: "" },
        { value: "OWNER", label: t("dashboard.scopeOwner"), hint: "" },
        { value: "MEMBER", label: t("dashboard.scopeMember"), hint: "" },
    ];
}

export function getStatusLabel(status, t) {
    const key = `status.task.${status}`;
    const translated = t(key);
    if (translated !== key) return translated;
    const projectKey = `status.project.${status}`;
    const projectTranslated = t(projectKey);
    if (projectTranslated !== projectKey) return projectTranslated;
    return status || t("common.unknown");
}

export function getPriorityLabel(priority, t) {
    const key = `status.priority.${priority}`;
    const translated = t(key);
    return translated !== key ? translated : priority || t("common.unknown");
}

export function getWorkspaceRoleLabel(ownedCount, memberCount, t) {
    if (ownedCount > 0 && memberCount > 0) return t("workspaceRole.ownerMember");
    if (ownedCount > 0) return t("workspaceRole.owner");
    if (memberCount > 0) return t("workspaceRole.member");
    return t("workspaceRole.user");
}
