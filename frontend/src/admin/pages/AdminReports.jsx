/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, FolderKanban, ShieldCheck } from "lucide-react";
import {
    getAdminActivity,
    getAdminProjects,
    getAdminSummary,
    getAdminUsers,
} from "../../services/adminService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import { getStatusLabel } from "../../shared/i18n/optionLabels";
import { useI18n } from "../../shared/i18n/useI18n";
import { formatDateTime } from "../../user/components/projectHelpers";
import { BarChart, CHART_COLORS, DonutChart, StackedBar } from "../../user/components/DashboardCharts";
import AdminPageShell, { AdminPanel } from "../components/AdminPageShell";
import { AdminErrorState, AdminLoadingState } from "../components/AdminStateView";

const REPORT_COLORS = [
    "#d946ef",
    CHART_COLORS.progress,
    CHART_COLORS.done,
    CHART_COLORS.review,
    CHART_COLORS.violet,
    "#38bdf8",
];

function AdminReports() {
    const { t, locale } = useI18n();
    const [summary, setSummary] = useState(null);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [summaryData, userData, projectData, activityData] = await Promise.all([
                getAdminSummary(),
                getAdminUsers(),
                getAdminProjects(),
                getAdminActivity(),
            ]);
            setSummary(summaryData);
            setUsers(userData);
            setProjects(projectData);
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

    const report = useMemo(() => {
        const avgCompletion = projects.length
            ? Math.round(
                  projects.reduce((sum, p) => sum + (p.completionRate || 0), 0) / projects.length
              )
            : 0;
        const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
        const lockedUsers = users.filter((u) => u.accountStatus === "LOCKED").length;
        const adminUsers = users.filter((u) => u.role === "ADMIN").length;

        const activityTypes = Object.entries(
            activity.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {})
        ).map(([type, count]) => ({ type, count }));

        const topProjects = projects
            .slice()
            .sort((a, b) => (b.taskCount || 0) - (a.taskCount || 0))
            .slice(0, 8);

        const activeUsers = users
            .slice()
            .filter((u) => (u.memberships?.length || 0) > 0 || u.taskCount > 0 || u.messageCount > 0)
            .sort((a, b) => {
                const scoreA =
                    (a.taskCount || 0) + (a.messageCount || 0) + (a.memberships?.length || 0) * 2;
                const scoreB =
                    (b.taskCount || 0) + (b.messageCount || 0) + (b.memberships?.length || 0) * 2;
                return scoreB - scoreA;
            })
            .slice(0, 8);

        const projectStatusItems = ["ACTIVE", "ON_HOLD", "ARCHIVED"].map((status, index) => ({
            label: getStatusLabel(status, t),
            value: projects.filter((project) => project.status === status).length,
            color: REPORT_COLORS[index],
        }));

        const taskStatusItems = [
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
        ];

        const planItems = mapCounts(
            projects.map((project) => project.planCode || "FREE"),
            REPORT_COLORS
        );
        const userStatusItems = mapCounts(
            users.map((user) => user.accountStatus || "ACTIVE"),
            REPORT_COLORS
        );
        const userRoleItems = mapCounts(
            users.map((user) => user.role || "USER"),
            REPORT_COLORS
        );
        const workloadItems = activeUsers.slice(0, 6).map((user, index) => ({
            label: user.fullName || user.email,
            value: (user.taskCount || 0) + (user.messageCount || 0),
            color: REPORT_COLORS[index % REPORT_COLORS.length],
        }));

        return {
            avgCompletion,
            activeProjects,
            lockedUsers,
            adminUsers,
            activityTypes,
            topProjects,
            activeUsers,
            recentActivity: activity.slice(0, 12),
            projectStatusItems,
            taskStatusItems,
            planItems,
            userStatusItems,
            userRoleItems,
            workloadItems,
        };
    }, [activity, projects, t, users]);

    if (loading) {
        return (
            <AdminLoadingState
                title={t("admin.reports.loadingTitle")}
                description={t("admin.reports.desc")}
            />
        );
    }

    if (error) {
        return (
            <AdminErrorState
                title={t("admin.dashboard.errorTitle")}
                message={getApiErrorMessage(error, t("admin.reports.errorDesc"))}
                status={getApiErrorStatus(error)}
                onRetry={load}
            />
        );
    }

    return (
        <AdminPageShell
            eyebrow={t("layout.admin")}
            title={t("admin.reports.title")}
            description={t("admin.reports.desc")}
            stats={[
                {
                    label: t("admin.dashboard.users"),
                    value: summary.totalUsers,
                    note: t("admin.reports.statUsersNote", { count: report.adminUsers }),
                },
                {
                    label: t("admin.dashboard.projects"),
                    value: summary.totalProjects,
                    note: t("admin.reports.statProjectsNote", { active: report.activeProjects }),
                },
                {
                    label: t("admin.dashboard.tasks"),
                    value: summary.totalTasks,
                    note: t("admin.reports.statTasksNote"),
                },
                {
                    label: t("nav.chat"),
                    value: summary.totalMessages,
                    note: t("admin.reports.statChatNote"),
                },
            ]}
        >
            <section>
                <AdminPanel title={t("admin.reports.metricsTitle")} subtitle={t("admin.reports.metricsSubtitle")}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <MetricBar
                            icon={FolderKanban}
                            label={t("admin.reports.activeRooms")}
                            value={report.activeProjects}
                            total={projects.length}
                        />
                        <MetricBar
                            icon={BarChart3}
                            label={t("admin.reports.avgCompletion")}
                            value={report.avgCompletion}
                            total={100}
                            suffix="%"
                        />
                        <MetricBar
                            icon={ShieldCheck}
                            label={t("admin.reports.lockedAccounts")}
                            value={report.lockedUsers}
                            total={users.length}
                        />
                        <MetricBar
                            icon={Activity}
                            label={t("admin.reports.logEvents")}
                            value={activity.length}
                            total={Math.max(activity.length, 1)}
                        />
                    </div>
                </AdminPanel>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
                <AdminPanel title={t("admin.reports.projectStatusChart")} subtitle={t("admin.nav.projects")}>
                    <DonutChart
                        items={report.projectStatusItems}
                        centerValue={projects.length}
                        centerLabel={t("admin.dashboard.projects")}
                        emptyLabel={t("admin.reports.emptyRooms")}
                    />
                </AdminPanel>
                <AdminPanel title={t("admin.reports.planChart")} subtitle={t("admin.nav.billing")}>
                    <BarChart items={report.planItems} emptyLabel={t("admin.reports.emptyRooms")} />
                </AdminPanel>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <AdminPanel title={t("admin.reports.taskStatusChart")} subtitle={t("admin.dashboard.tasks")}>
                    <StackedBar items={report.taskStatusItems} emptyLabel={t("admin.reports.emptyRooms")} />
                </AdminPanel>
                <AdminPanel title={t("admin.reports.userStatusChart")} subtitle={t("admin.users.statusMix")}>
                    <StackedBar items={report.userStatusItems} emptyLabel={t("admin.reports.emptyUsers")} />
                </AdminPanel>
                <AdminPanel title={t("admin.reports.userRoleChart")} subtitle={t("admin.users.roleMix")}>
                    <DonutChart
                        items={report.userRoleItems}
                        centerValue={users.length}
                        centerLabel={t("admin.dashboard.users")}
                        emptyLabel={t("admin.reports.emptyUsers")}
                    />
                </AdminPanel>
            </section>

            <AdminPanel title={t("admin.reports.workloadChart")} subtitle={t("admin.users.topWorkload")}>
                <BarChart items={report.workloadItems} emptyLabel={t("admin.reports.emptyUsers")} />
            </AdminPanel>

            <section className="grid gap-4 xl:grid-cols-3">
                <AdminPanel
                    title={t("admin.reports.topProjectsTitle")}
                    subtitle={t("admin.reports.topProjectsSubtitle")}
                    scroll
                >
                    <div className="space-y-2">
                        {report.topProjects.map((project) => (
                            <ProjectRow key={project.id} project={project} t={t} />
                        ))}
                        {report.topProjects.length === 0 ? (
                            <EmptyNote>{t("admin.reports.emptyRooms")}</EmptyNote>
                        ) : null}
                    </div>
                </AdminPanel>

                <AdminPanel
                    title={t("admin.reports.usersTitle")}
                    subtitle={t("admin.reports.usersSubtitle")}
                    scroll
                >
                    <div className="space-y-2">
                        {report.activeUsers.map((user) => (
                            <UserRow key={user.id} user={user} t={t} />
                        ))}
                        {report.activeUsers.length === 0 ? (
                            <EmptyNote>{t("admin.reports.emptyUsers")}</EmptyNote>
                        ) : null}
                    </div>
                </AdminPanel>

                <AdminPanel title={t("admin.reports.logsTitle")} subtitle={t("admin.reports.logsSubtitle")} scroll>
                    {report.activityTypes.length > 0 ? (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {report.activityTypes.map((item) => (
                                <span
                                    key={item.type}
                                    className="rounded-md border border-fuchsia-400/20 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-200"
                                >
                                    {item.type}: {item.count}
                                </span>
                            ))}
                        </div>
                    ) : null}
                    <div className="space-y-2">
                        {report.recentActivity.map((item, index) => (
                            <ActivityRow
                                key={`${item.type}-${item.projectId}-${index}`}
                                item={item}
                                t={t}
                                locale={locale}
                            />
                        ))}
                        {report.recentActivity.length === 0 ? (
                            <EmptyNote>{t("admin.reports.emptyActivity")}</EmptyNote>
                        ) : null}
                    </div>
                </AdminPanel>
            </section>
        </AdminPageShell>
    );
}

function ProjectRow({ project, t }) {
    return (
        <article className="ui-card">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="ui-text-primary truncate text-sm font-semibold">{project.projectName}</p>
                    <p className="truncate text-[11px] text-slate-500">
                        {t("admin.reports.ownerLabel")}: {project.ownerEmail}
                    </p>
                </div>
                <Tag>{getStatusLabel(project.status, t)}</Tag>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
                {t("admin.reports.projectMeta", {
                    tasks: project.taskCount,
                    members: project.memberCount,
                    messages: project.messageCount,
                    completion: project.completionRate?.toFixed?.(0) ?? project.completionRate,
                })}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
                {t("admin.reports.taskBreakdown", {
                    todo: project.todoTaskCount ?? 0,
                    doing: project.inProgressTaskCount ?? 0,
                    review: project.reviewTaskCount ?? 0,
                    done: project.doneTaskCount ?? 0,
                })}
            </p>
            <p className="mt-1 text-[10px] text-fuchsia-300/80">
                {t("admin.reports.planMeta", {
                    plan: project.planCode || "FREE",
                    id: project.id,
                })}
            </p>
        </article>
    );
}

function UserRow({ user, t }) {
    const memberships = user.memberships || [];

    return (
        <article className="ui-card">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="ui-text-primary truncate text-sm font-semibold">
                        {user.fullName || user.email}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                </div>
                <Tag tone="cyan">{user.role}</Tag>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
                {t("admin.reports.userSummary", {
                    tasks: user.taskCount,
                    messages: user.messageCount,
                    rooms: memberships.length,
                })}
            </p>
            {memberships.length > 0 ? (
                <ul
                    className="mt-2 space-y-1 border-t pt-2"
                    style={{ borderColor: "var(--color-border-subtle)" }}
                >
                    {memberships.map((room) => (
                        <li
                            key={room.projectId}
                            className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[11px]"
                        >
                            <span className="min-w-0 truncate font-medium text-slate-200">
                                {room.projectName}
                            </span>
                            <span className="shrink-0 text-slate-500">
                                {t("admin.reports.roomMeta", {
                                    role: room.role,
                                    tasks: room.assignedTaskCount,
                                    messages: room.messageCount,
                                })}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-2 text-[11px] text-slate-500">{t("admin.reports.noRooms")}</p>
            )}
        </article>
    );
}

function ActivityRow({ item, t, locale }) {
    const isTask = item.type === "TASK";

    return (
        <article className="ui-card">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-fuchsia-300">
                    {isTask ? t("admin.activity.typeTask") : t("admin.activity.typeChat")}
                </span>
                <span className="text-[10px] text-slate-500">
                    {formatDateTime(item.occurredAt, locale)}
                </span>
            </div>
            <p className="ui-text-primary mt-1 truncate text-sm font-semibold">{item.title}</p>
            <p className="text-[11px] font-medium text-cyan-600 dark:text-cyan-300/90">
                {t("admin.activity.roomPrefix")}: {item.projectName || "—"}
                {item.projectId ? ` (#${item.projectId})` : ""}
            </p>
            {item.actorEmail ? (
                <p className="text-[10px] text-slate-500">
                    {isTask ? t("admin.activity.actorTask") : t("admin.activity.actorChat")}:{" "}
                    {item.actorEmail}
                </p>
            ) : null}
            {item.description ? (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-400">
                    {item.description}
                </p>
            ) : null}
        </article>
    );
}

function Tag({ children, tone = "slate" }) {
    const tones = {
        slate: "border-[var(--color-border)] bg-[var(--color-surface-muted)] ui-text-muted",
        cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
    };
    return (
        <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${tones[tone] || tones.slate}`}
        >
            {children}
        </span>
    );
}

function EmptyNote({ children }) {
    return <p className="text-xs text-slate-500">{children}</p>;
}

function MetricBar({ icon: Icon, label, value, total, suffix = "" }) {
    const percent = total ? Math.min(Math.round((value / total) * 100), 100) : 0;
    return (
        <div className="ui-card p-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <Icon size={15} className="shrink-0 text-fuchsia-600 dark:text-fuchsia-300" />
                    <div className="min-w-0">
                        <p className="ui-text-primary truncate text-xs font-semibold">{label}</p>
                        <p className="text-[10px] text-slate-500">
                            {value}
                            {suffix} / {total}
                            {suffix}
                        </p>
                    </div>
                </div>
                <span className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-200">
                    {percent}%
                </span>
            </div>
            <div
                className="mt-2 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-border-subtle)" }}
            >
                <div className="h-1.5 rounded-full bg-fuchsia-400/80" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

function mapCounts(values, colors) {
    const counts = values.reduce((result, value) => {
        const key = value || "N/A";
        result.set(key, (result.get(key) || 0) + 1);
        return result;
    }, new Map());

    return [...counts.entries()].map(([label, value], index) => ({
        label,
        value,
        color: colors[index % colors.length],
    }));
}

export default AdminReports;
