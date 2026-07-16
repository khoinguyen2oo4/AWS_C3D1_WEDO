/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CirclePlus, Clock3, RefreshCw } from "lucide-react";
import { createProject, joinProject } from "../../services/projectService";
import {
    buildWorkspaceNotifications,
    buildWorkspaceReports,
    getWorkspaceSnapshot,
} from "../../services/workspaceService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import {
    getDashboardScopeOptions,
    getProjectStatusOptions,
    getWorkspaceRoleLabel,
} from "../../shared/i18n/optionLabels";
import { useI18n } from "../../shared/i18n/useI18n";
import DarkSelect from "../../shared/components/DarkSelect";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import WorkspacePageShell, { WorkspacePanel } from "../components/WorkspacePageShell";
import { formatDateTime, getInitials } from "../components/projectHelpers";

function UserDashboard() {
    const { t, locale } = useI18n();
    const navigate = useNavigate();
    const [snapshot, setSnapshot] = useState(null);
    const [reports, setReports] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [createName, setCreateName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [projectQuery, setProjectQuery] = useState("");
    const [projectStatus, setProjectStatus] = useState("ALL");
    const [projectScope, setProjectScope] = useState("ALL");

    const statusFilterOptions = useMemo(
        () => [{ value: "ALL", label: t("dashboard.statusAll"), hint: "" }, ...getProjectStatusOptions(t)],
        [t]
    );
    const scopeOptions = useMemo(() => getDashboardScopeOptions(t), [t]);
    const emptyDate = t("common.none");

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getWorkspaceSnapshot();
            setSnapshot(data);
            setReports(buildWorkspaceReports(data));
            setNotifications(buildWorkspaceNotifications(data));
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const ownedCount = useMemo(
        () => (reports?.projects ?? []).filter((p) => p.owner).length,
        [reports]
    );
    const memberCount = useMemo(
        () => (reports?.projects ?? []).filter((p) => !p.owner).length,
        [reports]
    );
    const workspaceRole = getWorkspaceRoleLabel(ownedCount, memberCount, t);

    const summaryStats = useMemo(() => {
        if (!reports) return [];

        return [
            {
                label: t("admin.dashboard.projects"),
                value: reports.totalProjects,
                note: `${reports.activeProjects} ${t("status.project.ACTIVE")}`,
                tone: "text-cyan-200",
            },
            {
                label: t("admin.dashboard.tasks"),
                value: reports.totalTasks,
                note: `${reports.doneTasks} ${t("tasks.statDone")}`,
                tone: "text-emerald-200",
            },
            {
                label: t("settings.messages"),
                value: reports.totalMessages,
                note: t("dashboard.messagesSubtitle"),
                tone: "text-fuchsia-200",
            },
            {
                label: t("tasks.statProgress"),
                value: `${reports.completionRate}%`,
                note: `${reports.upcomingDeadlines} deadline`,
                tone: "text-white",
            },
        ];
    }, [reports, t]);

    const filteredProjects = useMemo(() => {
        const projects = reports?.projects ?? [];
        const keyword = projectQuery.trim().toLowerCase();

        return projects.filter((project) => {
            const matchQuery =
                !keyword ||
                project.projectName?.toLowerCase().includes(keyword) ||
                project.ownerEmail?.toLowerCase().includes(keyword);
            const matchStatus = projectStatus === "ALL" || project.status === projectStatus;
            const matchScope =
                projectScope === "ALL" ||
                (projectScope === "OWNER" && project.owner) ||
                (projectScope === "MEMBER" && !project.owner);

            return matchQuery && matchStatus && matchScope;
        });
    }, [projectQuery, projectScope, projectStatus, reports]);

    const upcomingTasks = useMemo(() => {
        return (snapshot?.tasks ?? [])
            .filter((task) => task.dueDate)
            .slice()
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);
    }, [snapshot]);

    const recentMessages = useMemo(() => snapshot?.messages?.slice(0, 5) ?? [], [snapshot]);
    const feedItems = useMemo(() => notifications.slice(0, 5), [notifications]);

    const openProject = (projectId) => navigate(`/project/${projectId}`);

    const handleCreate = async (event) => {
        event.preventDefault();
        if (!createName.trim()) return;

        setActionLoading(true);
        setActionError(null);

        try {
            const data = await createProject(createName.trim());
            const projectId = data?.id ?? data?.projectId ?? data;
            if (projectId) navigate(`/project/${projectId}`);
            else await load();
        } catch (err) {
            setActionError(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async (event) => {
        event.preventDefault();
        if (!inviteCode.trim()) return;

        setActionLoading(true);
        setActionError(null);

        try {
            const projectId = await joinProject(inviteCode.trim());
            navigate(`/project/${projectId}`);
        } catch (err) {
            setActionError(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <WorkspaceLoadingState
                title={t("dashboard.loadingTitle")}
                description={t("dashboard.loadingDesc")}
            />
        );
    }

    if (error) {
        return (
            <WorkspaceErrorState
                title={t("dashboard.errorTitle")}
                message={getApiErrorMessage(error, t("dashboard.errorDesc"))}
                status={getApiErrorStatus(error)}
                onRetry={load}
            />
        );
    }

    const actionErrorMessage = actionError
        ? getApiErrorMessage(actionError, t("dashboard.actionFailed"))
        : null;

    return (
        <WorkspacePageShell
            eyebrow={workspaceRole}
            title={t("dashboard.title")}
            description={ownedCount > 0 ? t("dashboard.descOwner") : t("dashboard.descMember")}
            actions={
                <button type="button" onClick={load} className="ui-btn-ghost focus-ring">
                    <RefreshCw size={15} />
                    {t("common.refresh")}
                </button>
            }
            stats={summaryStats}
        >
            {actionErrorMessage ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {actionErrorMessage}
                </div>
            ) : null}

            <section className="grid w-full min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
                <WorkspacePanel
                    title={t("dashboard.projectsTitle")}
                    subtitle={t("dashboard.projectsSubtitle", {
                        filtered: filteredProjects.length,
                        total: reports?.projects?.length ?? 0,
                    })}
                    scroll
                >
                    <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                        <input
                            value={projectQuery}
                            onChange={(e) => setProjectQuery(e.target.value)}
                            className="ui-input focus-ring"
                            placeholder={t("dashboard.searchPlaceholder")}
                        />
                        <DarkSelect
                            label={t("dashboard.filterRole")}
                            value={projectScope}
                            onChange={setProjectScope}
                            options={scopeOptions}
                            menuWidth="220px"
                        />
                        <DarkSelect
                            label={t("dashboard.filterStatus")}
                            value={projectStatus}
                            onChange={setProjectStatus}
                            options={statusFilterOptions}
                            menuWidth="200px"
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => openProject(project.id)}
                                    className="ui-card flex w-full items-center gap-3 py-2.5 text-left transition hover:border-cyan-500/30"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-200">
                                        {getInitials(project.projectName)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="ui-text-primary truncate text-sm font-bold">
                                            {project.projectName}
                                        </p>
                                        <p className="ui-text-muted truncate text-xs">
                                            {project.memberCount} TV · {project.taskCount} task ·{" "}
                                            {project.completionRate?.toFixed?.(0) ??
                                                project.completionRate}
                                            %
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                            project.owner
                                                ? "text-cyan-600 dark:text-cyan-300"
                                                : "text-fuchsia-600 dark:text-fuchsia-300"
                                        }`}
                                    >
                                        {project.owner ? t("common.owner") : t("common.member")}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">{t("dashboard.emptyProjects")}</p>
                        )}
                    </div>
                </WorkspacePanel>

                <div className="space-y-3">
                    <WorkspacePanel
                        title={t("dashboard.createEyebrow")}
                        subtitle={t("dashboard.joinEyebrow")}
                    >
                        <div className="space-y-3">
                            <form onSubmit={handleCreate} className="space-y-2">
                                <p className="ui-text-muted text-xs">{t("dashboard.createDesc")}</p>
                                <label className="block">
                                    <span className="ui-label">{t("dashboard.createLabel")}</span>
                                    <input
                                        value={createName}
                                        onChange={(e) => setCreateName(e.target.value)}
                                        className="ui-input focus-ring mt-1"
                                        placeholder={t("dashboard.createPlaceholder")}
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="ui-btn-primary w-full"
                                >
                                    <CirclePlus size={15} />
                                    {t("dashboard.createBtn")}
                                </button>
                            </form>

                            <form
                                onSubmit={handleJoin}
                                className="space-y-2 border-t pt-3"
                                style={{ borderColor: "var(--color-border-subtle)" }}
                            >
                                <p className="ui-text-muted text-xs">{t("dashboard.joinDesc")}</p>
                                <label className="block">
                                    <span className="ui-label">{t("dashboard.joinLabel")}</span>
                                    <input
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value)}
                                        className="ui-input focus-ring mt-1"
                                        placeholder={t("dashboard.joinPlaceholder")}
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="ui-btn-secondary w-full"
                                >
                                    <ArrowRight size={15} />
                                    {t("dashboard.joinBtn")}
                                </button>
                            </form>
                        </div>
                    </WorkspacePanel>

                    <WorkspacePanel
                        title={t("dashboard.deadlinesTitle")}
                        subtitle={t("dashboard.deadlinesSubtitle")}
                        scroll
                    >
                        <div className="space-y-2">
                            {upcomingTasks.length > 0 ? (
                                upcomingTasks.map((task) => (
                                    <article key={`${task.projectId}-${task.id}`} className="ui-card">
                                        <p className="text-[10px] font-bold uppercase text-slate-500">
                                            {task.projectName}
                                        </p>
                                        <p className="ui-text-primary truncate text-sm font-semibold">
                                            {task.title}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                            <Clock3 size={12} />
                                            {formatDateTime(task.dueDate, locale, emptyDate)}
                                        </p>
                                    </article>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">{t("dashboard.emptyDeadlines")}</p>
                            )}
                        </div>
                    </WorkspacePanel>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <WorkspacePanel
                    title={t("dashboard.messagesTitle")}
                    subtitle={t("dashboard.messagesSubtitle")}
                    scroll
                >
                    <div className="space-y-2">
                        {recentMessages.length > 0 ? (
                            recentMessages.map((message) => (
                                <article
                                    key={`${message.projectId}-${message.id}`}
                                    className="ui-card"
                                >
                                    <p className="text-[10px] text-slate-500">{message.projectName}</p>
                                    <p className="ui-text-primary text-sm font-semibold">
                                        {message.senderName || message.senderEmail}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                                        {message.content}
                                    </p>
                                </article>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">{t("dashboard.emptyMessages")}</p>
                        )}
                    </div>
                </WorkspacePanel>

                <WorkspacePanel
                    title={t("dashboard.alertsTitle")}
                    subtitle={t("dashboard.alertsSubtitle")}
                    scroll
                >
                    <div className="space-y-2">
                        {feedItems.length > 0 ? (
                            feedItems.map((item) => (
                                <article key={item.id} className="ui-card">
                                    <p className="text-[10px] font-bold uppercase text-slate-500">
                                        {item.type}
                                    </p>
                                    <p className="ui-text-primary text-sm font-semibold">{item.title}</p>
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                                        {item.detail}
                                    </p>
                                </article>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">{t("dashboard.emptyAlerts")}</p>
                        )}
                    </div>
                </WorkspacePanel>
            </section>
        </WorkspacePageShell>
    );
}

export default UserDashboard;
