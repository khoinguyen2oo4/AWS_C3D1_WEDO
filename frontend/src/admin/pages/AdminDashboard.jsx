/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, FolderKanban, Users } from "lucide-react";
import { getAdminActivity, getAdminProjects, getAdminSummary, getAdminUsers } from "../../services/adminService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import { useI18n } from "../../shared/i18n/useI18n";
import { getStatusLabel } from "../../shared/i18n/optionLabels";
import AdminPageShell, { AdminPanel } from "../components/AdminPageShell";
import { AdminErrorState, AdminLoadingState } from "../components/AdminStateView";
import { BarChart, CHART_COLORS, DonutChart, StackedBar } from "../../user/components/DashboardCharts";

const ADMIN_CHART_COLORS = [
    "#d946ef",
    CHART_COLORS.progress,
    CHART_COLORS.done,
    CHART_COLORS.review,
    CHART_COLORS.violet,
    "#38bdf8",
];

function AdminDashboard() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [activity, setActivity] = useState([]);
    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const [summaryData, projectData, userData, activityData] = await Promise.all([
                getAdminSummary(),
                getAdminProjects(),
                getAdminUsers(),
                getAdminActivity(),
            ]);
            setSummary(summaryData);
            setProjects(projectData);
            setUsers(userData);
            setActivity(activityData);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const health = useMemo(() => {
        const avgCompletion = projects.length
            ? Math.round(
                  projects.reduce((sum, project) => sum + (project.completionRate || 0), 0) /
                      projects.length
              )
            : 0;

        return {
            avgCompletion,
            latestProjects: projects.slice(0, 6),
            latestActivity: activity.slice(0, 6),
        };
    }, [activity, projects]);

    const projectStatusItems = useMemo(
        () =>
            ["ACTIVE", "ON_HOLD", "ARCHIVED"].map((status, index) => ({
                label: getStatusLabel(status, t),
                value: projects.filter((project) => project.status === status).length,
                color: ADMIN_CHART_COLORS[index],
            })),
        [projects, t]
    );

    const taskStatusItems = useMemo(
        () => [
            {
                label: getStatusLabel("TODO", t),
                value: projects.reduce((sum, project) => sum + (project.todoTaskCount || 0), 0),
                color: CHART_COLORS.todo,
            },
            {
                label: getStatusLabel("IN_PROGRESS", t),
                value: projects.reduce((sum, project) => sum + (project.inProgressTaskCount || 0), 0),
                color: CHART_COLORS.progress,
            },
            {
                label: getStatusLabel("REVIEW", t),
                value: projects.reduce((sum, project) => sum + (project.reviewTaskCount || 0), 0),
                color: CHART_COLORS.review,
            },
            {
                label: getStatusLabel("DONE", t),
                value: projects.reduce((sum, project) => sum + (project.doneTaskCount || 0), 0),
                color: CHART_COLORS.done,
            },
        ],
        [projects, t]
    );

    const planItems = useMemo(() => {
        const counts = projects.reduce((result, project) => {
            const key = project.planCode || "FREE";
            result.set(key, (result.get(key) || 0) + 1);
            return result;
        }, new Map());

        return [...counts.entries()].map(([label, value], index) => ({
            label,
            value,
            color: ADMIN_CHART_COLORS[index % ADMIN_CHART_COLORS.length],
        }));
    }, [projects]);

    const activityTypeItems = useMemo(() => {
        const counts = activity.reduce((result, item) => {
            const key = item.type || "UNKNOWN";
            result.set(key, (result.get(key) || 0) + 1);
            return result;
        }, new Map());

        return [...counts.entries()].map(([label, value], index) => ({
            label,
            value,
            color: ADMIN_CHART_COLORS[index % ADMIN_CHART_COLORS.length],
        }));
    }, [activity]);

    if (loading) {
        return (
            <AdminLoadingState
                title={t("admin.dashboard.loadingTitle")}
                description={t("admin.dashboard.loadingDesc")}
            />
        );
    }

    if (error) {
        return (
            <AdminErrorState
                title={t("admin.dashboard.errorTitle")}
                message={getApiErrorMessage(error, t("admin.dashboard.errorDesc"))}
                status={getApiErrorStatus(error)}
                onRetry={load}
            />
        );
    }

    return (
        <AdminPageShell
            eyebrow={t("layout.admin")}
            title={t("admin.dashboard.title")}
            description={t("admin.dashboard.desc")}
            actions={
                <>
                    <Link
                        to="/admin/projects"
                        className="ui-btn-secondary"
                    >
                        <FolderKanban size={16} />
                        {t("admin.nav.projects")}
                    </Link>
                    <Link
                        to="/admin/reports"
                        className="ui-btn-ghost"
                    >
                        <Activity size={16} />
                        {t("admin.nav.reports")}
                    </Link>
                </>
            }
            stats={[
                {
                    label: t("admin.dashboard.projects"),
                    value: summary.totalProjects,
                    note: `${summary.activeProjects} ${t("status.project.ACTIVE")}`,
                },
                { label: t("project.room.statsMembers"), value: summary.totalMembers, note: t("admin.nav.projects") },
                { label: t("admin.dashboard.tasks"), value: summary.totalTasks, note: t("layout.workspace") },
                { label: t("settings.messages"), value: summary.totalMessages, note: t("nav.chat") },
            ]}
        >
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
                <AdminPanel title={t("admin.dashboard.title")} subtitle={t("admin.dashboard.quickLinks")}>
                    <div className="grid gap-2 md:grid-cols-3">
                        <HealthCard
                            icon={Users}
                            label={t("admin.dashboard.users")}
                            value={users.length}
                            note={t("admin.dashboard.lockedAccountsNote", {
                                count: summary.lockedUsers,
                            })}
                        />
                        <HealthCard
                            icon={FolderKanban}
                            label={t("project.performance.completion")}
                            value={`${health.avgCompletion}%`}
                            note={t("admin.dashboard.avgCompletionNote")}
                        />
                        <HealthCard
                            icon={Activity}
                            label={t("admin.nav.activity")}
                            value={activity.length}
                            note={t("admin.dashboard.recentEventsNote")}
                        />
                    </div>
                </AdminPanel>

                <AdminPanel title={t("admin.dashboard.quickLinks")} subtitle={t("layout.admin")}>
                    <div className="space-y-3">
                        <QuickLink
                            to="/admin/users"
                            label={t("admin.nav.users")}
                            hint={t("admin.users.desc")}
                        />
                        <QuickLink
                            to="/admin/projects"
                            label={t("admin.nav.projects")}
                            hint={t("admin.projects.selectHint")}
                        />
                        <QuickLink
                            to="/admin/reports"
                            label={t("admin.nav.reports")}
                            hint={t("admin.reports.desc")}
                        />
                        <QuickLink
                            to="/admin/system"
                            label={t("admin.nav.system")}
                            hint={t("admin.system.desc")}
                        />
                    </div>
                </AdminPanel>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
                <AdminPanel title={t("admin.dashboard.projectStatusChart")} subtitle={t("admin.nav.projects")}>
                    <DonutChart
                        items={projectStatusItems}
                        centerValue={summary.totalProjects}
                        centerLabel={t("admin.dashboard.projects")}
                        emptyLabel={t("admin.dashboard.emptyChart")}
                    />
                </AdminPanel>

                <AdminPanel title={t("admin.dashboard.planChart")} subtitle={t("admin.nav.billing")}>
                    <BarChart items={planItems} emptyLabel={t("admin.dashboard.emptyChart")} />
                </AdminPanel>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <AdminPanel title={t("admin.dashboard.taskStatusChart")} subtitle={t("admin.dashboard.tasks")}>
                    <StackedBar items={taskStatusItems} emptyLabel={t("admin.dashboard.emptyChart")} />
                </AdminPanel>
                <AdminPanel title={t("admin.dashboard.activityChart")} subtitle={t("admin.nav.activity")}>
                    <BarChart items={activityTypeItems} emptyLabel={t("admin.dashboard.emptyChart")} />
                </AdminPanel>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
                <AdminPanel
                    title={t("admin.nav.projects")}
                    subtitle={t("admin.dashboard.projects")}
                    className="ui-panel-viewport ui-panel-viewport--medium"
                >
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {health.latestProjects.length > 0 ? (
                            health.latestProjects.map((project) => (
                                <MiniCard
                                    key={project.id}
                                    title={project.projectName}
                                    meta={project.ownerEmail}
                                    badge={t("admin.dashboard.membersBadge", {
                                        count: project.memberCount,
                                    })}
                                />
                            ))
                        ) : (
                            <EmptyText text={t("dashboard.emptyProjects")} />
                        )}
                    </div>
                </AdminPanel>

                <AdminPanel
                    title={t("admin.nav.activity")}
                    subtitle={t("dashboard.messagesSubtitle")}
                    className="ui-panel-viewport ui-panel-viewport--medium"
                >
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {health.latestActivity.length > 0 ? (
                            health.latestActivity.map((item) => (
                                <MiniCard
                                    key={`${item.type}-${item.title}-${item.occurredAt}`}
                                    title={item.title}
                                    meta={item.projectName || item.description}
                                    badge={item.type}
                                />
                            ))
                        ) : (
                            <EmptyText text={t("admin.reports.emptyActivity")} />
                        )}
                    </div>
                </AdminPanel>
            </section>
        </AdminPageShell>
    );
}

function HealthCard({ icon: Icon, label, value, note }) {
    return (
        <div className="ui-card">
            <Icon size={18} className="text-fuchsia-200" />
            <p className="ui-text-faint mt-2 text-[10px] font-bold uppercase tracking-wider">{label}</p>
            <h3 className="ui-text-primary mt-0.5 break-all text-lg font-bold">{value}</h3>
            <p className="ui-text-muted mt-1 line-clamp-2 text-xs leading-5">{note}</p>
        </div>
    );
}

function QuickLink({ to, label, hint }) {
    return (
        <Link
            to={to}
            className="ui-card flex items-start justify-between gap-3"
        >
            <div className="min-w-0">
                <p className="ui-text-primary text-sm font-bold">{label}</p>
                <p className="ui-text-muted mt-1 line-clamp-2 text-xs leading-5">{hint}</p>
            </div>
            <ArrowRight size={16} className="mt-1 shrink-0 text-fuchsia-200" />
        </Link>
    );
}

function MiniCard({ title, meta, badge }) {
    return (
        <article className="ui-card">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="ui-text-primary truncate text-sm font-bold">{title}</h3>
                    <p className="ui-text-faint mt-1 truncate text-xs">{meta}</p>
                </div>
                <span className="shrink-0 rounded-md border border-fuchsia-400/20 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-fuchsia-100">
                    {badge}
                </span>
            </div>
        </article>
    );
}

function EmptyText({ text }) {
    return (
        <div className="ui-card text-sm leading-6">
            {text}
        </div>
    );
}

export default AdminDashboard;
