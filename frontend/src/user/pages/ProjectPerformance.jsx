/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, Download, Gauge, MessageSquareText, Users } from "lucide-react";
import {
    exportWeeklyReport,
    getProjectActivity,
    getProjectPerformance,
    getProjectTasks,
} from "../../services/projectService";
import useToast from "../../shared/components/toast/useToast";
import { useI18n } from "../../shared/i18n/useI18n";
import { getStatusLabel } from "../../shared/i18n/optionLabels";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";
import { BarChart, CHART_COLORS, DonutChart, StackedBar } from "../components/DashboardCharts";
import { formatDateTime } from "../components/projectHelpers";

const WORKLOAD_COLORS = [
    CHART_COLORS.progress,
    CHART_COLORS.done,
    CHART_COLORS.review,
    CHART_COLORS.violet,
    "#38bdf8",
    "#14b8a6",
];

function ProjectPerformance() {
    const { t, locale } = useI18n();
    const toast = useToast();
    const { project } = useOutletContext();
    const [state, setState] = useState({ loading: true, error: null, data: null, tasks: [], activity: [] });
    const [exporting, setExporting] = useState(false);

    const load = async () => {
        setState({ loading: true, error: null, data: null, tasks: [], activity: [] });

        try {
            const [data, tasks, activity] = await Promise.all([
                getProjectPerformance(project.id),
                getProjectTasks(project.id),
                getProjectActivity(project.id),
            ]);
            setState({ loading: false, error: null, data, tasks, activity });
        } catch (error) {
            setState({ loading: false, error, data: null, tasks: [], activity: [] });
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const breakdown = useMemo(() => {
        if (!state.data) return [];
        const data = state.data;
        return [
            { status: "TODO", value: data.todoTasks, color: CHART_COLORS.todo },
            { status: "IN_PROGRESS", value: data.inProgressTasks, color: CHART_COLORS.progress },
            { status: "REVIEW", value: data.reviewTasks, color: CHART_COLORS.review },
            { status: "DONE", value: data.doneTasks, color: CHART_COLORS.done },
        ];
    }, [state.data]);

    const ownerDashboard = useMemo(() => {
        const today = startOfDay(new Date());
        const openTasks = state.tasks.filter((task) => task.status !== "DONE");
        const overdue = openTasks.filter((task) => {
            const due = parseLocalDate(task.dueDate);
            return due && due < today;
        });
        const dueSoon = openTasks.filter((task) => {
            const due = parseLocalDate(task.dueDate);
            if (!due) return false;
            const days = Math.round((due.getTime() - today.getTime()) / 86400000);
            return days >= 0 && days <= 3;
        });
        const pendingReview = state.tasks.filter(
            (task) => task.submissionStatus === "PENDING_REVIEW" || task.status === "REVIEW"
        );
        const workload = new Map();
        state.tasks.forEach((task) => {
            const key = task.assigneeName || task.assigneeEmail || "Unassigned";
            workload.set(key, (workload.get(key) || 0) + 1);
        });

        return {
            overdue,
            dueSoon,
            pendingReview,
            workload: [...workload.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6),
        };
    }, [state.tasks]);

    const statusItems = useMemo(
        () =>
            breakdown.map((item) => ({
                label: getStatusLabel(item.status, t),
                value: item.value,
                color: item.color,
            })),
        [breakdown, t]
    );

    const workloadItems = useMemo(
        () =>
            ownerDashboard.workload.map(([label, value], index) => ({
                label,
                value,
                color: WORKLOAD_COLORS[index % WORKLOAD_COLORS.length],
            })),
        [ownerDashboard.workload]
    );

    const priorityItems = useMemo(() => {
        const counts = state.tasks.reduce(
            (result, task) => {
                const priority = (task.priority || "MEDIUM").toUpperCase();
                result[priority] = (result[priority] || 0) + 1;
                return result;
            },
            { HIGH: 0, MEDIUM: 0, LOW: 0 }
        );

        return [
            { label: t("status.priority.HIGH"), value: counts.HIGH, color: CHART_COLORS.danger },
            { label: t("status.priority.MEDIUM"), value: counts.MEDIUM, color: CHART_COLORS.review },
            { label: t("status.priority.LOW"), value: counts.LOW, color: CHART_COLORS.done },
        ];
    }, [state.tasks, t]);

    const deadlineItems = useMemo(
        () => [
            { label: t("project.performance.overdue"), value: ownerDashboard.overdue.length, color: CHART_COLORS.danger },
            { label: t("project.room.dueSoon"), value: ownerDashboard.dueSoon.length, color: CHART_COLORS.review },
            { label: t("status.submission.PENDING_REVIEW"), value: ownerDashboard.pendingReview.length, color: CHART_COLORS.progress },
        ],
        [ownerDashboard.dueSoon.length, ownerDashboard.overdue.length, ownerDashboard.pendingReview.length, t]
    );

    if (state.loading) {
        return (
            <WorkspaceLoadingState
                title={t("project.performance.loadingTitle")}
                description={t("project.performance.loadingDesc")}
            />
        );
    }

    if (state.error) {
        return (
            <WorkspaceErrorState
                title={t("project.performance.errorTitle")}
                message={t("project.performance.errorDesc")}
                status={state.error?.response?.status}
                onRetry={load}
            />
        );
    }

    const data = state.data;

    const downloadReport = async (format) => {
        setExporting(true);
        try {
            const response = await exportWeeklyReport(project.id, format);
            const extension = format === "pdf" ? "pdf" : "xlsx";
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${project.projectName}-weekly-report.${extension}`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error?.message || t("features.report.exporting"));
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="ui-page ui-stagger">
            <section className="ui-panel flex flex-wrap items-center justify-between gap-2 py-2">
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase text-cyan-400">
                        {t("project.performance.title")}
                    </p>
                    <p className="ui-text-muted mt-0.5 text-xs leading-relaxed">{data.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        disabled={exporting}
                        onClick={() => downloadReport("excel")}
                        className="ui-btn-ghost text-[11px]"
                    >
                        <Download size={13} />
                        {exporting ? t("features.report.exporting") : t("features.report.excel")}
                    </button>
                    <button
                        type="button"
                        disabled={exporting}
                        onClick={() => downloadReport("pdf")}
                        className="ui-btn-ghost text-[11px]"
                    >
                        <Download size={13} />
                        {t("features.report.pdf")}
                    </button>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-bold uppercase text-slate-500">
                        {t("project.performance.completion")}
                    </p>
                    <p className="ui-text-primary flex items-center justify-end gap-1.5 text-base font-bold">
                        <Gauge size={15} className="text-cyan-300" />
                        {data.completionRate?.toFixed?.(1) ?? data.completionRate}%
                    </p>
                </div>
            </section>

            <section className="ui-stat-grid">
                <Metric icon={CheckCircle2} label={t("project.room.statsDone")} value={data.doneTasks} />
                <Metric icon={BarChart3} label={t("project.room.statsTasks")} value={data.totalTasks} />
                <Metric icon={Users} label={t("project.room.statsMembers")} value={data.memberCount} />
                <Metric icon={MessageSquareText} label={t("settings.messages")} value={data.messageCount} />
            </section>

            <section className="ui-stat-grid md:grid-cols-3">
                <Metric icon={Gauge} label={t("features.sla.overdue")} value={data.overdueTasks ?? 0} />
                <Metric icon={Gauge} label={t("features.sla.dueSoon")} value={data.dueSoonTasks ?? 0} />
                <Metric icon={Gauge} label={t("features.sla.onTimeRate")} value={`${data.onTimeRate ?? 0}%`} />
            </section>

            {data.workloadAlerts?.length > 0 ? (
                <section className="space-y-2">
                    {data.workloadAlerts.map((alert) => (
                        <div
                            key={alert.memberEmail}
                            className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-100"
                        >
                            {t("features.sla.workloadAlert", {
                                name: alert.memberName || alert.memberEmail,
                                count: alert.highPriorityOpenTasks,
                            })}
                        </div>
                    ))}
                </section>
            ) : null}

            <section className="ui-section-grid ui-section-grid--2">
                <WorkspacePanel
                    title={t("project.performance.breakdown")}
                    subtitle={t("tasks.filterStatus")}
                >
                    <DonutChart
                        items={statusItems}
                        centerValue={`${data.completionRate?.toFixed?.(1) ?? data.completionRate}%`}
                        centerLabel={t("project.performance.completion")}
                        emptyLabel={t("project.room.emptyTasks")}
                    />
                    <div className="mt-3">
                        <StackedBar items={statusItems} emptyLabel={t("project.room.emptyTasks")} />
                    </div>
                </WorkspacePanel>

                <WorkspacePanel title={t("project.ai.title")} subtitle={t("admin.system.title")} scroll>
                    <div className="space-y-2">
                        {data.signals.map((signal) => (
                            <p
                                key={signal}
                                className="ui-card text-sm"
                            >
                                {signal}
                            </p>
                        ))}
                    </div>
                </WorkspacePanel>
            </section>

            <section className="ui-section-grid ui-section-grid--2">
                <WorkspacePanel title={t("project.room.deadlineHealth")} subtitle={t("project.room.openTasks")}>
                    <StackedBar items={deadlineItems} emptyLabel={t("project.room.emptyTasks")} />
                </WorkspacePanel>
                <WorkspacePanel title={t("project.room.priorityMix")} subtitle={t("tasks.fieldPriority")}>
                    <StackedBar items={priorityItems} emptyLabel={t("project.room.emptyTasks")} />
                </WorkspacePanel>
            </section>

            <section className="ui-section-grid ui-section-grid--master-wide">
                <WorkspacePanel
                    title={t("project.performance.ownerDashboard")}
                    subtitle={t("project.performance.ownerDashboardSubtitle")}
                >
                    <div className="grid gap-2 md:grid-cols-3">
                        <SignalCard label={t("project.performance.overdue")} value={ownerDashboard.overdue.length} tone="text-red-200" />
                        <SignalCard label={t("dashboard.deadlinesTitle")} value={ownerDashboard.dueSoon.length} tone="text-amber-200" />
                        <SignalCard label={t("status.submission.PENDING_REVIEW")} value={ownerDashboard.pendingReview.length} tone="text-cyan-200" />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <ReminderList title={t("project.performance.overdue")} items={ownerDashboard.overdue} />
                        <ReminderList title={t("status.submission.PENDING_REVIEW")} items={ownerDashboard.pendingReview} />
                    </div>
                </WorkspacePanel>

                <WorkspacePanel title={t("project.performance.activityLog")} subtitle={`${state.activity.length}`} scroll>
                    <div className="space-y-2">
                        {state.activity.length > 0 ? (
                            state.activity.slice(0, 8).map((item) => (
                                <ActivityItem key={item.id} item={item} locale={locale} />
                            ))
                        ) : (
                            <p className="ui-text-muted text-sm">{t("common.none")}</p>
                        )}
                    </div>
                </WorkspacePanel>
            </section>

            <WorkspacePanel title={t("project.performance.workload")} subtitle={t("project.room.statsMembers")}>
                <BarChart
                    items={workloadItems}
                    emptyLabel={t("project.room.noWorkload")}
                />
            </WorkspacePanel>

            <WorkspacePanel title={t("project.ai.nextAction")} subtitle={t("project.ai.summary")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="ui-text-muted text-sm">{data.nextAction}</p>
                    <Link
                        to={`/project/${project.id}/tasks`}
                        className="ui-btn-primary"
                    >
                        {t("project.room.tasksLink")}
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </WorkspacePanel>

        </div>
    );
}

function Metric({ icon: Icon, label, value }) {
    return (
        <div className="ui-stat-card">
            <div className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300">
                <Icon size={13} />
            </div>
            <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
            <p className="ui-text-primary text-sm font-bold">{value}</p>
        </div>
    );
}

function SignalCard({ label, value, tone }) {
    return (
        <div className="ui-card">
            <p className="ui-text-faint text-[9px] font-bold uppercase">{label}</p>
            <p className={`mt-0.5 text-sm font-bold ${tone}`}>{value}</p>
        </div>
    );
}

function ReminderList({ title, items }) {
    return (
        <div className="ui-card">
            <p className="ui-text-faint text-[10px] font-bold uppercase">{title}</p>
            <div className="mt-2 space-y-1.5">
                {items.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="ui-text-primary min-w-0 truncate font-semibold">{task.title}</span>
                        <span className="ui-text-faint shrink-0">{task.dueDate || task.submissionStatus}</span>
                    </div>
                ))}
                {items.length === 0 ? <p className="ui-text-muted text-xs">N/A</p> : null}
            </div>
        </div>
    );
}

function ActivityItem({ item, locale }) {
    return (
        <article className="ui-card">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="ui-text-primary truncate text-sm font-semibold">{item.title}</p>
                    <p className="ui-text-muted mt-1 line-clamp-2 text-xs">{item.detail}</p>
                </div>
                <span className="ui-text-faint shrink-0 text-[10px]">
                    {formatDateTime(item.createdAt, locale, "")}
                </span>
            </div>
            <p className="ui-text-faint mt-1 text-[10px]">{item.actorName || item.actorEmail}</p>
        </article>
    );
}

function parseLocalDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

export default ProjectPerformance;
