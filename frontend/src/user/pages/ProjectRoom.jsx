import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
    ArrowRight,
    CheckSquare,
    Megaphone,
    MessageSquareText,
    Plus,
    Trash2,
} from "lucide-react";
import {
    createProjectAnnouncement,
    deleteProjectAnnouncement,
    getProjectAnnouncements,
    getProjectInsight,
    getProjectMembers,
    getProjectMessages,
    getProjectSettings,
    getProjectTasks,
} from "../../services/projectService";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";
import { BarChart, CHART_COLORS, DonutChart, StackedBar } from "../components/DashboardCharts";
import { useI18n } from "../../shared/i18n/useI18n";
import { getStatusLabel } from "../../shared/i18n/optionLabels";
import { formatDate, getInitials } from "../components/projectHelpers";

const WORKLOAD_COLORS = [
    CHART_COLORS.progress,
    CHART_COLORS.done,
    CHART_COLORS.review,
    CHART_COLORS.violet,
    "#38bdf8",
    "#14b8a6",
];

function ProjectRoom() {
    const { t, locale } = useI18n();
    const { project, isOwner, canManageTasks } = useOutletContext();
    const canManageRoom = typeof canManageTasks === "boolean" ? canManageTasks : isOwner;
    const emptyDate = t("common.none");
    const [state, setState] = useState({
        loading: true,
        error: null,
        settings: null,
        tasks: [],
        members: [],
        messages: [],
        announcements: [],
        insight: null,
    });
    const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });
    const [announcementSaving, setAnnouncementSaving] = useState(false);

    const load = async () => {
        setState((current) => ({ ...current, loading: true, error: null }));

        try {
            const [settings, tasks, members, messages, announcements, insight] = await Promise.all([
                getProjectSettings(project.id),
                getProjectTasks(project.id),
                getProjectMembers(project.id),
                getProjectMessages(project.id),
                getProjectAnnouncements(project.id),
                getProjectInsight(project.id),
            ]);

            setState({
                loading: false,
                error: null,
                settings,
                tasks,
                members,
                messages,
                announcements,
                insight,
            });
        } catch (error) {
            setState((current) => ({ ...current, loading: false, error }));
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const summary = useMemo(() => {
        const done = state.tasks.filter((t) => t.status === "DONE").length;
        const inProgress = state.tasks.filter((t) => t.status === "IN_PROGRESS").length;
        const review = state.tasks.filter((t) => t.status === "REVIEW").length;
        const todo = state.tasks.filter((t) => t.status === "TODO").length;
        const completion =
            state.tasks.length === 0 ? 0 : Math.round((done * 1000) / state.tasks.length) / 10;

        return { done, inProgress, review, todo, open: todo + inProgress + review, completion };
    }, [state.tasks]);

    const statusItems = useMemo(
        () => [
            { label: getStatusLabel("TODO", t), value: summary.todo, color: CHART_COLORS.todo },
            { label: getStatusLabel("IN_PROGRESS", t), value: summary.inProgress, color: CHART_COLORS.progress },
            { label: getStatusLabel("REVIEW", t), value: summary.review, color: CHART_COLORS.review },
            { label: getStatusLabel("DONE", t), value: summary.done, color: CHART_COLORS.done },
        ],
        [summary.done, summary.inProgress, summary.review, summary.todo, t]
    );

    const workloadItems = useMemo(() => {
        const workload = new Map();
        state.members.forEach((member) => {
            const label = member.memberName || member.memberEmail || t("common.unknown");
            workload.set(label, 0);
        });
        state.tasks.forEach((task) => {
            const label = task.assigneeName || task.assigneeEmail || t("common.notSet");
            workload.set(label, (workload.get(label) || 0) + 1);
        });

        return [...workload.entries()]
            .sort((left, right) => right[1] - left[1])
            .slice(0, 6)
            .map(([label, value], index) => ({
                label,
                value,
                color: WORKLOAD_COLORS[index % WORKLOAD_COLORS.length],
            }));
    }, [state.members, state.tasks, t]);

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

    const deadlineItems = useMemo(() => {
        const today = startOfDay(new Date());
        const openTasks = state.tasks.filter((task) => task.status !== "DONE");
        const overdue = openTasks.filter((task) => {
            const due = parseLocalDate(task.dueDate);
            return due && due < today;
        }).length;
        const dueSoon = openTasks.filter((task) => {
            const due = parseLocalDate(task.dueDate);
            if (!due) return false;
            const days = Math.round((due.getTime() - today.getTime()) / 86400000);
            return days >= 0 && days <= 3;
        }).length;
        const stable = Math.max(0, openTasks.length - overdue - dueSoon);

        return [
            { label: t("project.performance.overdue"), value: overdue, color: CHART_COLORS.danger },
            { label: t("project.room.dueSoon"), value: dueSoon, color: CHART_COLORS.review },
            { label: t("project.room.stable"), value: stable, color: CHART_COLORS.done },
        ];
    }, [state.tasks, t]);

    const createAnnouncement = async (event) => {
        event.preventDefault();
        if (!canManageRoom || !announcementForm.title.trim()) return;

        setAnnouncementSaving(true);
        try {
            const announcement = await createProjectAnnouncement(project.id, {
                title: announcementForm.title.trim(),
                content: announcementForm.content.trim(),
            });
            setState((current) => ({
                ...current,
                announcements: [announcement, ...current.announcements],
            }));
            setAnnouncementForm({ title: "", content: "" });
        } finally {
            setAnnouncementSaving(false);
        }
    };

    const removeAnnouncement = async (announcementId) => {
        if (!canManageRoom) return;
        await deleteProjectAnnouncement(project.id, announcementId);
        setState((current) => ({
            ...current,
            announcements: current.announcements.filter((item) => item.id !== announcementId),
        }));
    };

    if (state.loading) {
        return (
            <WorkspaceLoadingState
                title={t("project.layout.loadingTitle")}
                description={t("project.layout.loadingDesc")}
            />
        );
    }

    if (state.error) {
        return (
            <WorkspaceErrorState
                title={t("project.layout.errorTitle")}
                message={t("project.layout.errorDesc")}
                status={state.error?.response?.status}
                onRetry={load}
            />
        );
    }

    const settingsLink = canManageRoom ? "settings" : "tasks";
    const settingsLabel = canManageRoom ? t("project.room.settings") : t("project.room.tasksLink");

    return (
        <div className="ui-page ui-stagger">
            <section className="ui-panel">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="ui-text-muted max-w-2xl text-xs leading-relaxed">
                        {state.settings?.projectDescription || t("common.none")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <Link to={`/project/${project.id}/tasks`} className="ui-btn-primary text-xs">
                            <CheckSquare size={13} />
                            {t("project.room.tasksLink")}
                        </Link>
                        <Link to="chat" className="ui-btn-ghost text-xs">
                            <MessageSquareText size={13} />
                            {t("nav.chat")}
                        </Link>
                        <Link to={settingsLink} className="ui-btn-ghost text-xs">
                            {settingsLabel}
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
                <dl className="mt-2.5 grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
                    <Fact
                        label={t("settings.inviteCode")}
                        value={state.settings?.inviteCode || project.inviteCode}
                    />
                    <Fact
                        label={t("settings.status")}
                        value={getStatusLabel(state.settings?.status || project.status, t)}
                    />
                    <Fact label={t("project.room.statsMembers")} value={String(state.members.length)} />
                    <Fact label={t("tasks.statProgress")} value={`${summary.completion}%`} />
                </dl>
            </section>

            <section className="ui-stat-grid">
                <MiniStat label={getStatusLabel("TODO", t)} value={summary.todo} />
                <MiniStat
                    label={getStatusLabel("IN_PROGRESS", t)}
                    value={summary.inProgress}
                    tone="text-cyan-200"
                />
                <MiniStat
                    label={getStatusLabel("REVIEW", t)}
                    value={summary.review}
                    tone="text-amber-200"
                />
                <MiniStat label={getStatusLabel("DONE", t)} value={summary.done} tone="text-emerald-200" />
            </section>

            <section className="ui-section-grid ui-section-grid--master-wide">
                <WorkspacePanel
                    title={t("project.room.progressOverview")}
                    subtitle={t("project.performance.breakdown")}
                >
                    <DonutChart
                        items={statusItems}
                        centerValue={`${summary.completion}%`}
                        centerLabel={t("project.performance.completion")}
                        emptyLabel={t("project.room.emptyTasks")}
                    />
                    <div className="mt-3">
                        <StackedBar items={statusItems} emptyLabel={t("project.room.emptyTasks")} />
                    </div>
                </WorkspacePanel>

                <WorkspacePanel
                    title={t("project.room.workloadOverview")}
                    subtitle={t("project.room.statsMembers")}
                >
                    <BarChart
                        items={workloadItems}
                        emptyLabel={t("project.room.noWorkload")}
                    />
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

            {state.insight?.summary ? (
                <section className="ui-panel border-cyan-500/10">
                    <p className="text-[10px] font-bold uppercase text-cyan-400">{t("project.ai.nextAction")}</p>
                    <p className="ui-text-primary mt-1 text-sm font-semibold">{state.insight.summary}</p>
                    {state.insight.nextAction ? (
                        <p className="ui-text-muted mt-1 text-xs">{state.insight.nextAction}</p>
                    ) : null}
                </section>
            ) : null}

            <section className="ui-section-grid ui-section-grid--split">
                <WorkspacePanel
                    title={t("project.room.announcements")}
                    subtitle={`${state.announcements.length} ${t("project.room.posts")}`}
                    scroll
                >
                    <div className="space-y-2">
                        {state.announcements.length > 0 ? (
                            state.announcements.map((a) => (
                                <article
                                    key={a.id}
                                    className="ui-card"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="ui-text-primary truncate text-sm font-bold">
                                                {a.title}
                                            </p>
                                            <p className="ui-text-muted mt-1 line-clamp-3 text-xs">
                                                {a.content || "—"}
                                            </p>
                                            <p className="mt-1 text-[10px] text-slate-500">
                                                {formatDate(a.createdAt, locale, emptyDate)}
                                            </p>
                                        </div>
                                        {canManageRoom ? (
                                            <button
                                                type="button"
                                                onClick={() => removeAnnouncement(a.id)}
                                                className="shrink-0 rounded-md p-1.5 text-red-300 hover:bg-red-500/10"
                                                aria-label={t("common.delete")}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        ) : (
                                            <Megaphone size={14} className="shrink-0 text-cyan-400" />
                                        )}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">{t("common.none")}</p>
                        )}
                    </div>
                </WorkspacePanel>

                <WorkspacePanel
                    title={t("project.room.announcements")}
                    subtitle={canManageRoom ? t("common.owner") : t("common.view")}
                >
                    {canManageRoom ? (
                        <form onSubmit={createAnnouncement} className="space-y-2">
                            <input
                                value={announcementForm.title}
                                onChange={(e) =>
                                    setAnnouncementForm((c) => ({ ...c, title: e.target.value }))
                                }
                                className="ui-input focus-ring"
                                placeholder={t("tasks.fieldTitle")}
                            />
                            <textarea
                                value={announcementForm.content}
                                onChange={(e) =>
                                    setAnnouncementForm((c) => ({ ...c, content: e.target.value }))
                                }
                                rows={3}
                                className="ui-textarea focus-ring resize-none"
                                placeholder={t("project.room.announcementPlaceholder")}
                            />
                            <button
                                type="submit"
                                disabled={announcementSaving || !announcementForm.title.trim()}
                                className="ui-btn-primary w-full disabled:opacity-50"
                            >
                                <Plus size={15} />
                                {announcementSaving ? t("common.saving") : t("project.room.postAnnouncement")}
                            </button>
                        </form>
                    ) : (
                        <p className="text-sm text-slate-500">{t("project.members.viewOnly")}</p>
                    )}
                </WorkspacePanel>
            </section>

            <section className="ui-section-grid ui-section-grid--3">
                <WorkspacePanel title={t("project.room.recentTasks")} subtitle={t("dashboard.messagesSubtitle")} scroll>
                    <TaskList tasks={state.tasks.slice(-5).reverse()} t={t} />
                </WorkspacePanel>
                <WorkspacePanel title={t("project.room.recentChat")} subtitle={t("dashboard.messagesSubtitle")} scroll>
                    <MessageList messages={state.messages.slice(-5).reverse()} t={t} />
                </WorkspacePanel>
                {canManageRoom ? (
                    <WorkspacePanel
                        title={t("project.room.statsMembers")}
                        subtitle={String(state.members.length)}
                        scroll
                    >
                        <MemberList members={state.members} />
                    </WorkspacePanel>
                ) : (
                    <WorkspacePanel title={t("project.room.memberGuide")} subtitle={t("project.room.memberSettings")}> 
                        <ul className="ui-text-muted list-inside list-disc space-y-1 text-xs">
                            <li>{t("project.room.guideSubmit")}</li>
                            <li>{t("project.room.guideChat")}</li>
                            <li>{t("project.room.guideStatus")}</li>
                            <li>{t("project.room.guideSettings")}</li>
                        </ul>
                    </WorkspacePanel>
                )}
            </section>
        </div>
    );
}

function MiniStat({ label, value, tone = "ui-text-primary" }) {
    return (
        <div className="ui-stat-card text-center sm:text-left">
            <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
            <p className={`text-base font-bold tabular-nums ${tone}`}>{value}</p>
        </div>
    );
}

function Fact({ label, value }) {
    return (
        <div>
            <dt className="text-[9px] font-bold uppercase text-slate-500">{label}</dt>
            <dd className="ui-text-primary mt-0.5 truncate text-xs font-semibold">{value}</dd>
        </div>
    );
}

function TaskList({ tasks, t }) {
    if (!tasks.length) return <p className="text-sm text-slate-500">{t("project.room.emptyTasks")}</p>;
    return (
        <div className="space-y-2">
            {tasks.map((task) => (
                <article key={task.id} className="ui-card">
                    <p className="ui-text-primary truncate text-sm font-semibold">{task.title}</p>
                    <p className="text-[10px] text-slate-500">{getStatusLabel(task.status, t)}</p>
                </article>
            ))}
        </div>
    );
}

function MessageList({ messages, t }) {
    if (!messages.length) return <p className="text-sm text-slate-500">{t("project.room.emptyChat")}</p>;
    return (
        <div className="space-y-2">
            {messages.map((m) => (
                <article key={m.id} className="ui-card">
                    <p className="ui-text-primary text-xs font-semibold">
                        {m.senderName || m.senderEmail}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-400">{m.content}</p>
                </article>
            ))}
        </div>
    );
}

function MemberList({ members }) {
    return (
        <div className="space-y-2">
            {members.map((member) => (
                <article
                    key={member.id}
                    className="ui-card flex items-center gap-2"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-200">
                        {getInitials(member.memberName || member.memberEmail)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="ui-text-primary truncate text-sm font-semibold">
                            {member.memberName || member.memberEmail}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">{member.role}</p>
                    </div>
                </article>
            ))}
        </div>
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

export default ProjectRoom;
