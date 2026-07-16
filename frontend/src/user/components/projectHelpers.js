const TASK_STATUS_VALUES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export function formatDate(value, locale = "vi", emptyLabel) {
    const empty = emptyLabel ?? (locale === "en" ? "N/A" : "Chưa có");
    if (!value) return empty;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return empty;
    return new Intl.DateTimeFormat(getDateLocale(locale), { dateStyle: "medium" }).format(date);
}

export function formatDateTime(value, locale = "vi", emptyLabel) {
    const empty = emptyLabel ?? (locale === "en" ? "N/A" : "Chưa có");
    if (!value) return empty;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return empty;
    return new Intl.DateTimeFormat(getDateLocale(locale), {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export { getStatusLabel, getPriorityLabel } from "../../shared/i18n/optionLabels";

export function groupTasksByStatus(tasks) {
    return TASK_STATUS_VALUES.reduce((acc, value) => {
        acc[value] = tasks.filter((task) => task.status === value);
        return acc;
    }, {});
}

export function getInitials(value) {
    if (!value) return "?";
    return value
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item[0]?.toUpperCase() || "")
        .join("");
}

function getDateLocale(locale) {
    return locale === "en" ? "en-US" : "vi-VN";
}
