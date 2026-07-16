/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { CheckSquare, FolderKanban, MessageSquareText, RefreshCw, Search } from "lucide-react";
import { getAdminActivity, getAdminProjects } from "../../services/adminService";
import DarkSelect from "../../shared/components/DarkSelect";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import { getStatusLabel } from "../../shared/i18n/optionLabels";
import { useI18n } from "../../shared/i18n/useI18n";
import { BarChart, CHART_COLORS, StackedBar } from "../../user/components/DashboardCharts";
import { formatDateTime } from "../../user/components/projectHelpers";
import AdminPageShell, { AdminPanel } from "../components/AdminPageShell";
import { AdminErrorState, AdminLoadingState } from "../components/AdminStateView";

const ACTIVITY_COLORS = [
    "#d946ef",
    CHART_COLORS.progress,
    CHART_COLORS.done,
    CHART_COLORS.review,
    CHART_COLORS.violet,
];

function AdminActivity() {
    const { t, locale } = useI18n();
    const [projects, setProjects] = useState([]);
    const [activity, setActivity] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectQuery, setProjectQuery] = useState("");
    const [eventQuery, setEventQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [projectData, activityData] = await Promise.all([
                getAdminProjects(),
                getAdminActivity(),
            ]);
            setProjects(projectData);
            setActivity(activityData);
            setSelectedProjectId((current) =>
                current && projectData.some((project) => project.id === current)
                    ? current
                    : projectData[0]?.id ?? null
            );
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const filteredProjects = useMemo(() => {
        const keyword = projectQuery.trim().toLowerCase();
        return projects.filter((project) => {
            if (!keyword) return true;
            return [project.projectName, project.ownerEmail, project.inviteCode, project.status]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        });
    }, [projectQuery, projects]);

    useEffect(() => {
        if (filteredProjects.length === 0) {
            setSelectedProjectId(null);
            return;
        }
        if (selectedProjectId && !filteredProjects.some((project) => project.id === selectedProjectId)) {
            setSelectedProjectId(filteredProjects[0].id);
        }
    }, [filteredProjects, selectedProjectId]);

    const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;

    const selectedActivity = useMemo(
        () => activity.filter((item) => item.projectId === selectedProjectId),
        [activity, selectedProjectId]
    );

    const typeOptions = useMemo(() => {
        const types = Array.from(new Set(selectedActivity.map((item) => item.type).filter(Boolean)));
        return [
            { value: "ALL", label: t("admin.activity.typeAll"), hint: "" },
            { value: "TASK", label: t("admin.activity.typeTask"), hint: t("nav.tasks") },
            { value: "MESSAGE", label: t("admin.activity.typeChat"), hint: t("nav.chat") },
            ...types
                .filter((type) => type !== "TASK" && type !== "MESSAGE")
                .map((type) => ({ value: type, label: type, hint: "" })),
        ];
    }, [selectedActivity, t]);

    const filteredActivity = useMemo(() => {
        const keyword = eventQuery.trim().toLowerCase();
        return selectedActivity.filter((item) => {
            const haystack = [
                item.title,
                item.description,
                item.projectName,
                item.actorEmail,
                item.type,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const matchQuery = !keyword || haystack.includes(keyword);
            const matchType = typeFilter === "ALL" || item.type === typeFilter;
            return matchQuery && matchType;
        });
    }, [eventQuery, selectedActivity, typeFilter]);

    const taskCount = selectedActivity.filter((item) => item.type === "TASK").length;
    const messageCount = selectedActivity.filter((item) => item.type === "MESSAGE").length;

    const typeItems = useMemo(
        () => mapCounts(filteredActivity.map((item) => item.type || "UNKNOWN"), ACTIVITY_COLORS),
        [filteredActivity]
    );

    const actorItems = useMemo(
        () =>
            mapCounts(
                filteredActivity.map((item) => item.actorEmail || t("common.unknown")),
                ACTIVITY_COLORS
            )
                .sort((left, right) => right.value - left.value)
                .slice(0, 6),
        [filteredActivity, t]
    );

    if (loading) {
        return (
            <AdminLoadingState
                title={t("admin.activity.loadingActivity")}
                description={t("admin.activity.loadingDesc")}
            />
        );
    }

    if (error) {
        return (
            <AdminErrorState
                title={t("admin.activity.errorTitle")}
                message={getApiErrorMessage(error, t("admin.activity.errorDesc"))}
                status={getApiErrorStatus(error)}
                onRetry={load}
            />
        );
    }

    return (
        <AdminPageShell
            eyebrow={t("layout.admin")}
            title={t("admin.activity.titleActivity")}
            description={t("admin.activity.projectFlowDesc")}
            actions={
                <button type="button" onClick={load} className="ui-btn-ghost">
                    <RefreshCw size={15} />
                    {t("common.refresh")}
                </button>
            }
            stats={[
                {
                    label: t("admin.activity.room"),
                    value: projects.length,
                    note: t("admin.activity.roomsTitle"),
                },
                {
                    label: t("admin.activity.statTask"),
                    value: taskCount,
                    note: selectedProject?.projectName || t("admin.activity.selectedRoom"),
                    tone: "text-cyan-400",
                },
                {
                    label: t("admin.activity.statChat"),
                    value: messageCount,
                    note: t("admin.activity.statChatNote"),
                    tone: "text-fuchsia-400",
                },
                {
                    label: t("admin.activity.statFiltered"),
                    value: filteredActivity.length,
                    note: t("admin.activity.statFilteredNote"),
                },
            ]}
        >
            <section className="grid gap-4 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
                <AdminPanel
                    title={t("admin.activity.roomsTitle")}
                    subtitle={`${filteredProjects.length}/${projects.length}`}
                    className="ui-panel-viewport"
                    scroll
                >
                    <label className="mb-3 block">
                        <span className="ui-label">{t("common.search")}</span>
                        <span className="ui-field mt-1">
                            <Search size={14} className="ui-text-faint shrink-0" />
                            <input
                                value={projectQuery}
                                onChange={(event) => setProjectQuery(event.target.value)}
                                className="ui-input min-w-0 flex-1"
                                placeholder={t("admin.activity.projectSearchPlaceholder")}
                            />
                        </span>
                    </label>

                    <div className="space-y-2">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedProjectId(project.id);
                                        setTypeFilter("ALL");
                                        setEventQuery("");
                                    }}
                                    className={[
                                        "ui-card flex w-full items-start gap-3 text-left",
                                        selectedProjectId === project.id
                                            ? "border-fuchsia-500/35 bg-fuchsia-500/10"
                                            : "",
                                    ].join(" ")}
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-400/10 text-fuchsia-200">
                                        <FolderKanban size={16} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="ui-text-primary block truncate text-sm font-bold">
                                            {project.projectName}
                                        </span>
                                        <span className="ui-text-faint block truncate text-xs">
                                            {project.ownerEmail}
                                        </span>
                                        <span className="mt-2 flex flex-wrap gap-1.5">
                                            <Badge>{getStatusLabel(project.status, t)}</Badge>
                                            <Badge>{project.memberCount} TV</Badge>
                                            <Badge>{project.taskCount} task</Badge>
                                        </span>
                                    </span>
                                </button>
                            ))
                        ) : (
                            <p className="ui-text-muted text-sm">{t("admin.reports.emptyRooms")}</p>
                        )}
                    </div>
                </AdminPanel>

                <div className="min-w-0 space-y-4">
                    {selectedProject ? (
                        <>
                            <AdminPanel
                                title={selectedProject.projectName}
                                subtitle={t("admin.activity.selectedRoom")}
                            >
                                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                                    <div className="ui-card flex items-start gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-fuchsia-400/10 text-fuchsia-200">
                                            <FolderKanban size={18} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="ui-text-primary truncate text-base font-bold">
                                                {selectedProject.projectName}
                                            </p>
                                            <p className="ui-text-muted truncate text-sm">
                                                {selectedProject.ownerEmail}
                                            </p>
                                            <p className="ui-text-faint mt-1 text-xs">
                                                {t("admin.projects.inviteCode", {
                                                    code: selectedProject.inviteCode || "N/A",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                                        <MiniMetric label={t("admin.projects.members")} value={selectedProject.memberCount} />
                                        <MiniMetric label={t("admin.dashboard.tasks")} value={selectedProject.taskCount} />
                                        <MiniMetric label={t("nav.chat")} value={selectedProject.messageCount} />
                                    </div>
                                </div>
                            </AdminPanel>

                            <AdminPanel title={t("admin.activity.filterTitle")} subtitle={t("admin.activity.filterSubtitle")}>
                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-end">
                                    <label className="block">
                                        <span className="ui-label">{t("admin.activity.searchLabel")}</span>
                                        <span className="ui-field mt-1">
                                            <Search size={14} className="ui-text-faint shrink-0" />
                                            <input
                                                value={eventQuery}
                                                onChange={(event) => setEventQuery(event.target.value)}
                                                className="ui-input min-w-0 flex-1"
                                                placeholder={t("admin.activity.searchPlaceholder")}
                                            />
                                        </span>
                                    </label>
                                    <DarkSelect
                                        label={t("admin.activity.filterType")}
                                        value={typeFilter}
                                        onChange={setTypeFilter}
                                        options={typeOptions}
                                        menuWidth="220px"
                                    />
                                </div>
                            </AdminPanel>

                            <section className="grid gap-4 lg:grid-cols-2">
                                <AdminPanel
                                    title={t("admin.activity.typeChart")}
                                    subtitle={t("admin.activity.eventsCount", { count: filteredActivity.length })}
                                >
                                    <StackedBar items={typeItems} emptyLabel={t("admin.activity.empty")} />
                                </AdminPanel>
                                <AdminPanel title={t("admin.activity.actorChart")} subtitle={t("admin.activity.room")}>
                                    <BarChart items={actorItems} emptyLabel={t("admin.activity.empty")} />
                                </AdminPanel>
                            </section>

                            <AdminPanel
                                title={t("admin.activity.timeline")}
                                subtitle={t("admin.activity.eventsCount", { count: filteredActivity.length })}
                                className="ui-panel-viewport"
                                scroll
                            >
                                <div className="space-y-2">
                                    {filteredActivity.length > 0 ? (
                                        filteredActivity.map((item, index) => (
                                            <ActivityRow
                                                key={`${item.type}-${item.projectId}-${index}`}
                                                item={item}
                                                t={t}
                                                locale={locale}
                                            />
                                        ))
                                    ) : (
                                        <p className="ui-text-muted text-sm">{t("admin.activity.empty")}</p>
                                    )}
                                </div>
                            </AdminPanel>
                        </>
                    ) : (
                        <AdminPanel title={t("admin.activity.roomsTitle")} subtitle={t("admin.activity.selectedRoom")}>
                            <div className="flex min-h-48 flex-col items-center justify-center text-center">
                                <FolderKanban size={32} className="text-fuchsia-400/60" />
                                <p className="ui-text-primary mt-3 text-sm font-semibold">
                                    {t("admin.projects.selectProject")}
                                </p>
                                <p className="ui-text-muted mt-1 max-w-sm text-xs">
                                    {t("admin.projects.selectHint")}
                                </p>
                            </div>
                        </AdminPanel>
                    )}
                </div>
            </section>
        </AdminPageShell>
    );
}

function ActivityRow({ item, t, locale }) {
    const isTask = item.type === "TASK";
    const Icon = isTask ? CheckSquare : MessageSquareText;

    return (
        <article className="ui-card">
            <div className="flex items-start gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]">
                    <Icon size={15} className="ui-text-accent" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase ui-text-accent">
                            {isTask ? t("admin.activity.typeTask") : t("admin.activity.typeChat")}
                        </span>
                        <span className="ui-text-faint text-[10px]">
                            {formatDateTime(item.occurredAt, locale)}
                        </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-semibold ui-text-primary">{item.title}</p>
                    {item.actorEmail ? (
                        <p className="ui-text-faint text-[10px]">
                            {isTask ? t("admin.activity.actorTask") : t("admin.activity.actorChat")}:{" "}
                            {item.actorEmail}
                        </p>
                    ) : null}
                    {item.description ? (
                        <p className="ui-text-muted mt-1 line-clamp-2 text-[11px] leading-snug">
                            {item.description}
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function MiniMetric({ label, value }) {
    return (
        <div className="ui-card px-2 py-2">
            <p className="ui-text-faint text-[10px] font-bold uppercase">{label}</p>
            <p className="ui-text-primary mt-1 text-base font-bold tabular-nums">{value}</p>
        </div>
    );
}

function Badge({ children }) {
    return (
        <span className="rounded-md border border-fuchsia-400/20 bg-fuchsia-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-fuchsia-200">
            {children}
        </span>
    );
}

function mapCounts(values, colors) {
    const counts = values.reduce((result, value) => {
        const key = String(value || "N/A");
        result.set(key, (result.get(key) || 0) + 1);
        return result;
    }, new Map());

    return [...counts.entries()].map(([label, value], index) => ({
        label,
        value,
        color: colors[index % colors.length],
    }));
}

export default AdminActivity;
