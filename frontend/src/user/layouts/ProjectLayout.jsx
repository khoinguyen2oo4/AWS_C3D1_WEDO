/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getProjectById } from "../../services/projectService";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import AppShellLayout from "../../shared/components/AppShellLayout";
import { SidebarLink, SidebarSection } from "../../shared/components/AppSidebar";
import { formatDateTime } from "../components/projectHelpers";
import { getStatusLabel } from "../../shared/i18n/optionLabels";
import { useI18n } from "../../shared/i18n/useI18n";
import {
    canManageDelivery,
    canManageProject,
    getProjectNavItems,
    getProjectRole,
    isProjectOwner,
} from "../../shared/utils/projectRole";
import ProjectNotifications from "../components/ProjectNotifications";
import ProjectSearch from "../components/ProjectSearch";

function ProjectLayout() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { locale, t } = useI18n();
    const projectId = id;
    const currentEmail = localStorage.getItem("email") || "";
    const isOwner = project ? isProjectOwner(project, currentEmail) : false;
    const currentProjectRole = project ? getProjectRole(project, currentEmail) : "MEMBER";
    const canManageTasks = project ? canManageDelivery(project, currentEmail) : false;
    const canManageMembers = project ? canManageProject(project, currentEmail) : false;
    const navItems = useMemo(() => getProjectNavItems(canManageTasks), [canManageTasks]);

    const currentLabel = useMemo(() => {
        const match = navItems.find((item) => {
            if (!item.to) {
                return location.pathname === `/project/${projectId}`;
            }
            return location.pathname.startsWith(`/project/${projectId}/${item.to}`);
        });
        return match ? t(match.labelKey) : t("nav.overview");
    }, [location.pathname, navItems, projectId, t]);

    const loadProject = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getProjectById(projectId);
            setProject(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    if (loading) {
        return (
            <div className="ui-shell-root px-4 py-8">
                <div className="mx-auto max-w-lg">
                    <WorkspaceLoadingState
                        title={t("project.layout.loadingTitle")}
                        description={t("project.layout.loadingDesc")}
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ui-shell-root px-4 py-8">
                <div className="mx-auto max-w-lg">
                    <WorkspaceErrorState
                        title={t("project.layout.errorTitle")}
                        message={t("project.layout.errorDesc")}
                        status={error?.response?.status}
                        onRetry={loadProject}
                    />
                </div>
            </div>
        );
    }

    const sidebar = (
        <>
            <div className="border-b px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                <button
                    type="button"
                    onClick={() => navigate("/user/dashboard")}
                    className="ui-btn-ghost focus-ring w-auto border-0 bg-transparent px-0 py-0 text-[11px]"
                >
                    <ArrowLeft size={13} />
                        {t("layout.dashboard")}
                    </button>
                <h1 className="ui-text-primary mt-1.5 truncate text-sm font-bold">
                    {project.projectName}
                </h1>
                <p className="ui-text-faint truncate text-[11px]">{project.ownerEmail}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                    <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            canManageMembers
                                ? "border border-cyan-400/25 bg-cyan-400/10 text-cyan-700 dark:text-cyan-200"
                                : "border border-blue-400/25 bg-blue-400/10 text-blue-700 dark:text-blue-200"
                        }`}
                    >
                        {currentProjectRole}
                    </span>
                    <span className="ui-card rounded-md px-2 py-0.5 text-[10px] font-semibold ui-text-muted">
                        {getStatusLabel(project.status, t)}
                    </span>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                <SidebarSection title={t("layout.projectRoom")}>
                    {navItems.map((item) => {
                        const to = item.to
                            ? `/project/${projectId}/${item.to}`
                            : `/project/${projectId}`;
                        return (
                            <SidebarLink key={item.labelKey} to={to} end={item.end}>
                                {t(item.labelKey)}
                            </SidebarLink>
                        );
                    })}
                </SidebarSection>
            </div>

            <div
                className="ui-text-faint border-t px-3 py-1.5 text-[9px]"
                style={{ borderColor: "var(--color-border)" }}
            >
                {t("layout.updatedAt")}: {formatDateTime(project.updatedAt, locale)}
            </div>
        </>
    );

    return (
        <AppShellLayout
            sidebar={sidebar}
            topbarEyebrow={canManageTasks ? t("layout.projectManage") : t("layout.projectMember")}
            topbarTitle={currentLabel}
            topbarActions={
                <>
                    <div className="hidden md:block">
                        <ProjectSearch projectId={project.id} />
                    </div>
                    <ProjectNotifications projectId={project.id} />
                </>
            }
        >
            <div className="mb-2 hidden items-center gap-2 lg:flex">
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    {canManageTasks ? t("layout.projectManage") : t("layout.projectMember")}
                </span>
                <span className="ui-text-faint text-xs">/</span>
                <h2 className="ui-text-primary text-sm font-bold">{currentLabel}</h2>
            </div>
            <Outlet
                context={{
                    project,
                    reloadProject: loadProject,
                    isOwner,
                    canManageTasks,
                    canManageMembers,
                    canEditSettings: canManageMembers,
                    currentProjectRole,
                }}
            />
        </AppShellLayout>
    );
}

export default ProjectLayout;
