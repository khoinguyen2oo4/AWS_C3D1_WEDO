/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Edit3, FolderKanban, Mail, Plus, RefreshCw, Save, Search, Trash2, X } from "lucide-react";
import {
    addAdminProjectMember,
    deleteAdminProjectMember,
    getAdminProjectMembers,
    getAdminProjects,
    updateAdminProject,
    updateAdminProjectMember,
} from "../../services/adminService";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import DarkSelect from "../../shared/components/DarkSelect";
import useToast from "../../shared/components/toast/useToast";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import {
    getProjectStatusOptions,
    getProjectVisibilityOptions,
    getMemberRoleOptions,
    getStatusLabel,
} from "../../shared/i18n/optionLabels";
import { useI18n } from "../../shared/i18n/useI18n";
import { formatDateTime, getInitials } from "../../user/components/projectHelpers";
import AdminPageShell, { AdminPanel } from "../components/AdminPageShell";
import { AdminErrorState, AdminLoadingState } from "../components/AdminStateView";

const PLAN_KEYS = ["FREE", "PRO", "PREMIUM"];
const BILLING_KEYS = ["TRIAL", "PAID", "OVERDUE", "CANCELLED"];

const EMPTY_MEMBER_FORM = { memberEmail: "", role: "MEMBER" };

const EMPTY_PROJECT_FORM = {
    projectName: "",
    projectDescription: "",
    ownerEmail: "",
    status: "ACTIVE",
    visibility: "PRIVATE",
    logoUrl: "",
    planCode: "FREE",
    billingStatus: "TRIAL",
    monthlyCost: "",
    ownerAccessExpiresAt: "",
};

function AdminProjects() {
    const { t, locale } = useI18n();
    const toast = useToast();
    const statusFilterOptions = useMemo(
        () => [{ value: "ALL", label: t("tasks.filterAll"), hint: "" }, ...getProjectStatusOptions(t)],
        [t]
    );
    const memberRoleOptions = useMemo(() => getMemberRoleOptions(t), [t]);
    const memberFilterOptions = useMemo(
        () => [
            { value: "ALL", label: t("tasks.filterAll"), hint: "" },
            ...memberRoleOptions,
            { value: "OWNER", label: t("common.owner"), hint: t("common.owner") },
        ],
        [memberRoleOptions, t]
    );
    const visibilityOptions = useMemo(() => getProjectVisibilityOptions(t), [t]);
    const planOptions = useMemo(
        () =>
            PLAN_KEYS.map((key) => ({
                value: key,
                label: t(`admin.projects.plans.${key}.label`),
                hint: t(`admin.projects.plans.${key}.hint`),
            })),
        [t]
    );
    const billingOptions = useMemo(
        () =>
            BILLING_KEYS.map((key) => ({
                value: key,
                label: t(`admin.projects.billing.${key}.label`),
                hint: t(`admin.projects.billing.${key}.hint`),
            })),
        [t]
    );
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [memberQuery, setMemberQuery] = useState("");
    const [memberRoleFilter, setMemberRoleFilter] = useState("ALL");
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM);
    const [memberForm, setMemberForm] = useState(EMPTY_MEMBER_FORM);
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [confirmDeleteMember, setConfirmDeleteMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [memberLoading, setMemberLoading] = useState(false);
    const [savingProject, setSavingProject] = useState(false);
    const [savingMember, setSavingMember] = useState(false);
    const [error, setError] = useState(null);
    const [projectActionError, setProjectActionError] = useState(null);
    const [projectActionMessage, setProjectActionMessage] = useState(null);
    const [memberError, setMemberError] = useState(null);
    const [memberActionError, setMemberActionError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAdminProjects();
            setProjects(data);
            setSelectedProjectId((current) =>
                current && data.some((p) => p.id === current) ? current : data[0]?.id ?? null
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
        const keyword = query.trim().toLowerCase();
        return projects.filter((project) => {
            const matchQuery =
                !keyword ||
                project.projectName?.toLowerCase().includes(keyword) ||
                project.ownerEmail?.toLowerCase().includes(keyword) ||
                project.inviteCode?.toLowerCase().includes(keyword);
            const matchStatus = statusFilter === "ALL" || project.status === statusFilter;
            return matchQuery && matchStatus;
        });
    }, [projects, query, statusFilter]);

    useEffect(() => {
        if (filteredProjects.length === 0) {
            setSelectedProjectId(null);
            return;
        }
        if (selectedProjectId && !filteredProjects.some((p) => p.id === selectedProjectId)) {
            setSelectedProjectId(filteredProjects[0].id);
        }
    }, [filteredProjects, selectedProjectId]);

    useEffect(() => {
        const loadMembers = async () => {
            if (!selectedProjectId) {
                setMembers([]);
                return;
            }
            setMemberLoading(true);
            setMemberError(null);
            setMemberActionError(null);
            setMemberForm(EMPTY_MEMBER_FORM);
            setEditingMemberId(null);
            setMemberQuery("");
            setMemberRoleFilter("ALL");
            try {
                setMembers(await getAdminProjectMembers(selectedProjectId));
            } catch (err) {
                setMembers([]);
                setMemberError(err);
            } finally {
                setMemberLoading(false);
            }
        };
        void loadMembers();
    }, [selectedProjectId]);

    const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

    useEffect(() => {
        if (!selectedProject) {
            setProjectForm(EMPTY_PROJECT_FORM);
            return;
        }
        setProjectForm({
            projectName: selectedProject.projectName || "",
            projectDescription: selectedProject.projectDescription || "",
            ownerEmail: selectedProject.ownerEmail || "",
            status: selectedProject.status || "ACTIVE",
            visibility: selectedProject.visibility || "PRIVATE",
            logoUrl: selectedProject.logoUrl || "",
            planCode: selectedProject.planCode || "FREE",
            billingStatus: selectedProject.billingStatus || "TRIAL",
            monthlyCost: selectedProject.monthlyCost ?? "",
            ownerAccessExpiresAt: selectedProject.ownerAccessExpiresAt || "",
        });
        setProjectActionError(null);
        setProjectActionMessage(null);
    }, [selectedProject]);

    const filteredMembers = useMemo(() => {
        const keyword = memberQuery.trim().toLowerCase();
        return members.filter((member) => {
            const matchQuery =
                !keyword ||
                member.memberName?.toLowerCase().includes(keyword) ||
                member.memberEmail?.toLowerCase().includes(keyword);
            const matchRole = memberRoleFilter === "ALL" || member.role === memberRoleFilter;
            return matchQuery && matchRole;
        });
    }, [memberQuery, memberRoleFilter, members]);

    const stats = useMemo(() => {
        const active = projects.filter((p) => p.status === "ACTIVE").length;
        const memberCount = projects.reduce((s, p) => s + (p.memberCount || 0), 0);
        const avgCompletion = projects.length
            ? Math.round(projects.reduce((s, p) => s + (p.completionRate || 0), 0) / projects.length)
            : 0;
        return [
            {
                label: t("admin.projects.statProjects"),
                value: projects.length,
                note: t("admin.projects.statProjectsNote", { active }),
                tone: "text-white",
            },
            {
                label: t("admin.projects.statMembers"),
                value: memberCount,
                note: t("admin.projects.statMembersNote"),
                tone: "text-fuchsia-200",
            },
            {
                label: t("admin.projects.statAvgProgress"),
                value: `${avgCompletion}%`,
                note: t("admin.projects.statAvgProgressNote"),
                tone: "text-cyan-200",
            },
            {
                label: t("admin.projects.statSelected"),
                value: selectedProject ? "1" : "0",
                note: selectedProject?.projectName?.slice(0, 20) || "—",
                tone: "text-emerald-200",
            },
        ];
    }, [projects, selectedProject, t]);

    const updateMembers = (updatedMembers) => {
        setMembers(updatedMembers);
        setProjects((current) =>
            current.map((p) =>
                p.id === selectedProjectId ? { ...p, memberCount: updatedMembers.length } : p
            )
        );
    };

    const resetMemberForm = () => {
        setMemberForm(EMPTY_MEMBER_FORM);
        setEditingMemberId(null);
    };

    const resetProjectForm = () => {
        if (!selectedProject) return;
        setProjectForm({
            projectName: selectedProject.projectName || "",
            projectDescription: selectedProject.projectDescription || "",
            ownerEmail: selectedProject.ownerEmail || "",
            status: selectedProject.status || "ACTIVE",
            visibility: selectedProject.visibility || "PRIVATE",
            logoUrl: selectedProject.logoUrl || "",
            planCode: selectedProject.planCode || "FREE",
            billingStatus: selectedProject.billingStatus || "TRIAL",
            monthlyCost: selectedProject.monthlyCost ?? "",
            ownerAccessExpiresAt: selectedProject.ownerAccessExpiresAt || "",
        });
        setProjectActionError(null);
        setProjectActionMessage(null);
    };

    const handleSaveProject = async (event) => {
        event.preventDefault();
        if (!selectedProjectId || !projectForm.projectName.trim()) return;

        setSavingProject(true);
        setProjectActionError(null);
        setProjectActionMessage(null);

        try {
            const updated = await updateAdminProject(selectedProjectId, {
                projectName: projectForm.projectName.trim(),
                projectDescription: projectForm.projectDescription.trim(),
                ownerEmail: projectForm.ownerEmail.trim(),
                status: projectForm.status,
                visibility: projectForm.visibility,
                logoUrl: projectForm.logoUrl.trim(),
                planCode: projectForm.planCode,
                billingStatus: projectForm.billingStatus,
                monthlyCost: projectForm.monthlyCost === "" ? 0 : Number(projectForm.monthlyCost),
                ownerAccessExpiresAt: projectForm.ownerAccessExpiresAt || null,
            });
            setProjects((current) => current.map((p) => (p.id === updated.id ? updated : p)));
            setMembers(await getAdminProjectMembers(selectedProjectId));
            setProjectActionMessage(t("admin.projects.savedMessage"));
            toast.success(t("admin.projects.savedMessage"));
        } catch (err) {
            setProjectActionError(err);
            toast.error(getApiErrorMessage(err, t("admin.projects.saveFailed")));
        } finally {
            setSavingProject(false);
        }
    };

    const handleSaveMember = async (event) => {
        event.preventDefault();
        if (!selectedProjectId || !memberForm.memberEmail.trim()) return;

        setSavingMember(true);
        setMemberActionError(null);
        try {
            const payload = {
                memberEmail: memberForm.memberEmail.trim(),
                role: memberForm.role,
            };
            const updatedMembers = editingMemberId
                ? await updateAdminProjectMember(selectedProjectId, editingMemberId, payload)
                : await addAdminProjectMember(selectedProjectId, payload);
            updateMembers(updatedMembers);
            resetMemberForm();
            toast.success(t("admin.projects.memberSaved"));
        } catch (err) {
            setMemberActionError(err);
            toast.error(getApiErrorMessage(err, t("admin.projects.memberError")));
        } finally {
            setSavingMember(false);
        }
    };

    const handleEditMember = (member) => {
        setEditingMemberId(member.id);
        setMemberActionError(null);
        setMemberForm({
            memberEmail: member.memberEmail || "",
            role: member.role === "OWNER" ? "MEMBER" : member.role || "MEMBER",
        });
    };

    const handleDeleteMember = async () => {
        if (!selectedProjectId || !confirmDeleteMember) return;
        setSavingMember(true);
        setMemberActionError(null);
        try {
            const updatedMembers = await deleteAdminProjectMember(
                selectedProjectId,
                confirmDeleteMember.id
            );
            updateMembers(updatedMembers);
            setConfirmDeleteMember(null);
            toast.success(t("admin.projects.memberDeleted"));
        } catch (err) {
            setMemberActionError(err);
            toast.error(getApiErrorMessage(err, t("admin.projects.memberError")));
        } finally {
            setSavingMember(false);
        }
    };

    const isOwnerMember = (member) =>
        member.role === "OWNER" ||
        member.memberEmail?.toLowerCase() === selectedProject?.ownerEmail?.toLowerCase();

    if (loading) {
        return (
            <AdminLoadingState
                title={t("admin.projects.title")}
                description={t("admin.projects.desc")}
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
            title={t("admin.projects.title")}
            description={t("admin.projects.desc")}
            stats={stats}
            actions={
                <button
                    type="button"
                    onClick={load}
                    className="ui-btn-ghost focus-ring"
                >
                    <RefreshCw size={15} />
                    {t("common.refresh")}
                </button>
            }
        >
            <div className="ui-responsive-grid ui-responsive-grid--master-detail">
                {/* Danh sách dự án */}
                <AdminPanel title={t("admin.projects.list")} subtitle={`${filteredProjects.length}`} scroll>
                    <div className="mb-3 space-y-2">
                        <div className="ui-field">
                            <Search size={14} className="ui-text-faint shrink-0" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="ui-input min-w-0 flex-1"
                                placeholder={t("admin.projects.searchPlaceholder")}
                            />
                        </div>
                        <DarkSelect
                            label={t("admin.projects.filterStatus")}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusFilterOptions}
                            menuWidth="220px"
                        />
                    </div>

                    <div className="space-y-1.5">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => {
                                const active = selectedProjectId === project.id;
                                return (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                                            active
                                                ? "border-fuchsia-500/35 bg-fuchsia-500/10"
                                                : "ui-card hover:bg-[var(--color-surface)]"
                                        }`}
                                    >
                                        <p className="ui-text-primary truncate text-sm font-bold">
                                            {project.projectName}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                            {project.ownerEmail}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                            <Badge>{getStatusLabel(project.status, t)}</Badge>
                                            <Badge tone="fuchsia">{project.planCode || "FREE"}</Badge>
                                            <Badge tone="cyan">
                                                {project.monthlyCost != null
                                                    ? `${project.monthlyCost}`
                                                    : "0"}
                                            </Badge>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-sm text-slate-500">{t("admin.projects.emptyFilter")}</p>
                        )}
                    </div>
                </AdminPanel>

                {/* Chi tiết */}
                <div className="min-w-0 space-y-3">
                    {selectedProject ? (
                        <>
                            <AdminPanel
                                title={selectedProject.projectName}
                                subtitle={t("admin.projects.inviteCode", {
                                    code: selectedProject.inviteCode || "—",
                                })}
                            >
                                <form onSubmit={handleSaveProject} className="space-y-3">
                                    <SectionTitle>{t("admin.projects.sectionInfo")}</SectionTitle>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field
                                            label={t("settings.projectName")}
                                            value={projectForm.projectName}
                                            onChange={(e) =>
                                                setProjectForm((c) => ({
                                                    ...c,
                                                    projectName: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                        <Field
                                            label={t("admin.projects.ownerEmail")}
                                            value={projectForm.ownerEmail}
                                            onChange={(e) =>
                                                setProjectForm((c) => ({
                                                    ...c,
                                                    ownerEmail: e.target.value,
                                                }))
                                            }
                                            icon={Mail}
                                            required
                                        />
                                        <Field
                                            label="Logo URL"
                                            value={projectForm.logoUrl}
                                            onChange={(e) =>
                                                setProjectForm((c) => ({
                                                    ...c,
                                                    logoUrl: e.target.value,
                                                }))
                                            }
                                            className="sm:col-span-2"
                                        />
                                    </div>
                                    <label className="block">
                                        <span className="ui-label">{t("settings.description")}</span>
                                        <textarea
                                            value={projectForm.projectDescription}
                                            onChange={(e) =>
                                                setProjectForm((c) => ({
                                                    ...c,
                                                    projectDescription: e.target.value,
                                                }))
                                            }
                                            rows={2}
                                            className="ui-textarea focus-ring mt-1 resize-none"
                                        />
                                    </label>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <DarkSelect
                                            label={t("admin.projects.filterStatus")}
                                            value={projectForm.status}
                                            onChange={(v) =>
                                                setProjectForm((c) => ({ ...c, status: v }))
                                            }
                                            options={statusFilterOptions.filter((o) => o.value !== "ALL")}
                                        />
                                        <DarkSelect
                                            label={t("admin.projects.visibilityLabel")}
                                            value={projectForm.visibility}
                                            onChange={(v) =>
                                                setProjectForm((c) => ({ ...c, visibility: v }))
                                            }
                                            options={visibilityOptions}
                                        />
                                    </div>

                                    <SectionTitle>{t("admin.projects.sectionPlan")}</SectionTitle>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <DarkSelect
                                            label={t("admin.projects.planLabel")}
                                            value={projectForm.planCode}
                                            onChange={(v) =>
                                                setProjectForm((c) => ({ ...c, planCode: v }))
                                            }
                                            options={planOptions}
                                        />
                                        <DarkSelect
                                            label={t("admin.projects.billingLabel")}
                                            value={projectForm.billingStatus}
                                            onChange={(v) =>
                                                setProjectForm((c) => ({ ...c, billingStatus: v }))
                                            }
                                            options={billingOptions}
                                        />
                                        <Field
                                            label={t("admin.projects.monthlyCost")}
                                            type="number"
                                            min="0"
                                            value={projectForm.monthlyCost}
                                            onChange={(e) =>
                                                setProjectForm((c) => ({
                                                    ...c,
                                                    monthlyCost: e.target.value,
                                                }))
                                            }
                                        />
                                        <Field
                                            label={t("admin.projects.ownerExpiry")}
                                            type="date"
                                            value={projectForm.ownerAccessExpiresAt}
                                            onChange={(e) =>
                                                setProjectForm((c) => ({
                                                    ...c,
                                                    ownerAccessExpiresAt: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                                        <Meta label={t("admin.dashboard.tasks")} value={selectedProject.taskCount} />
                                        <Meta
                                            label={t("admin.projects.members")}
                                            value={selectedProject.memberCount}
                                        />
                                        <Meta label={t("nav.chat")} value={selectedProject.messageCount} />
                                        <Meta
                                            label={t("admin.projects.updatedLabel")}
                                            value={formatDateTime(selectedProject.updatedAt, locale)}
                                        />
                                    </div>

                                    {projectActionError ? (
                                        <Alert tone="error">
                                            {getApiErrorMessage(
                                                projectActionError,
                                                t("admin.projects.saveFailed")
                                            )}
                                        </Alert>
                                    ) : null}
                                    {projectActionMessage ? (
                                        <Alert tone="success">{projectActionMessage}</Alert>
                                    ) : null}

                                    <div
                                        className="flex flex-wrap gap-2 border-t pt-3"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <button
                                            type="submit"
                                            disabled={
                                                savingProject ||
                                                !projectForm.projectName.trim() ||
                                                !projectForm.ownerEmail.trim()
                                            }
                                            className="ui-btn-secondary disabled:opacity-50"
                                        >
                                            <Save size={15} />
                                            {savingProject ? t("common.saving") : t("admin.projects.saveProject")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetProjectForm}
                                            className="ui-btn-ghost focus-ring"
                                        >
                                            <X size={15} />
                                            {t("admin.projects.revert")}
                                        </button>
                                    </div>
                                </form>
                            </AdminPanel>

                            <AdminPanel
                                title={t("admin.projects.members")}
                                subtitle={`${filteredMembers.length} / ${members.length}`}
                                scroll
                            >
                                <form
                                    onSubmit={handleSaveMember}
                                    className="ui-card mb-3 p-2.5"
                                >
                                    <div className="grid gap-2 sm:grid-cols-[1fr_132px_auto] sm:items-end">
                                        <Field
                                            label={t("admin.projects.emailLabel")}
                                            value={memberForm.memberEmail}
                                            onChange={(e) =>
                                                setMemberForm((c) => ({
                                                    ...c,
                                                    memberEmail: e.target.value,
                                                }))
                                            }
                                            icon={Mail}
                                            placeholder={t("admin.projects.emailPlaceholder")}
                                        />
                                        <DarkSelect
                                            label={t("admin.projects.roleLabel")}
                                            value={memberForm.role}
                                            onChange={(v) =>
                                                setMemberForm((c) => ({ ...c, role: v }))
                                            }
                                            options={memberRoleOptions}
                                        />
                                        <div className="flex gap-2 pb-0.5">
                                            <button
                                                type="submit"
                                                disabled={savingMember || !memberForm.memberEmail.trim()}
                                                className="ui-btn-secondary px-2.5 disabled:opacity-50"
                                            >
                                                <Plus size={14} />
                                                {editingMemberId ? t("common.save") : t("common.add")}
                                            </button>
                                            {editingMemberId ? (
                                                <button
                                                    type="button"
                                                    onClick={resetMemberForm}
                                                    className="ui-btn-ghost focus-ring px-3 py-2 text-sm"
                                                >
                                                    {t("common.cancel")}
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                    {memberActionError ? (
                                        <p className="mt-2 text-xs text-red-300">
                                            {getApiErrorMessage(
                                                memberActionError,
                                                t("admin.projects.memberError")
                                            )}
                                        </p>
                                    ) : null}
                                </form>

                                <div className="mb-3 grid gap-2 sm:grid-cols-2">
                                    <div className="ui-field">
                                        <Search size={14} className="ui-text-faint shrink-0" />
                                        <input
                                            value={memberQuery}
                                            onChange={(e) => setMemberQuery(e.target.value)}
                                            className="ui-input min-w-0 flex-1"
                                            placeholder={t("admin.projects.searchMember")}
                                        />
                                    </div>
                                    <DarkSelect
                                        label={t("admin.projects.filterRole")}
                                        value={memberRoleFilter}
                                        onChange={setMemberRoleFilter}
                                        options={memberFilterOptions}
                                    />
                                </div>

                                <div className="space-y-2">
                                    {memberLoading ? (
                                        <p className="text-sm text-slate-500">{t("common.loading")}</p>
                                    ) : memberError ? (
                                        <p className="text-sm text-red-300">
                                            {getApiErrorMessage(
                                                memberError,
                                                t("admin.projects.memberLoadError")
                                            )}
                                        </p>
                                    ) : filteredMembers.length > 0 ? (
                                        filteredMembers.map((member) => {
                                            const ownerMember = isOwnerMember(member);
                                            return (
                                                <article
                                                    key={member.id}
                                                    className="ui-card flex items-center gap-3"
                                                >
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-400/10 text-xs font-bold text-fuchsia-200">
                                                        {getInitials(
                                                            member.memberName || member.memberEmail
                                                        )}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="ui-text-primary truncate text-sm font-semibold">
                                                            {member.memberName || member.memberEmail}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {member.memberEmail}
                                                        </p>
                                                    </div>
                                                    <Badge tone="slate">{member.role}</Badge>
                                                    <div className="flex shrink-0 gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditMember(member)}
                                                            disabled={ownerMember || savingMember}
                                                            className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 disabled:opacity-30"
                                                            title={t("common.edit")}
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setConfirmDeleteMember(member)
                                                            }
                                                            disabled={ownerMember || savingMember}
                                                            className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                                                            title={t("common.delete")}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            {t("admin.projects.emptyMembers")}
                                        </p>
                                    )}
                                </div>
                            </AdminPanel>
                        </>
                    ) : (
                        <div className="ui-panel flex min-h-[280px] flex-col items-center justify-center text-center">
                            <FolderKanban size={32} className="text-fuchsia-400/60" />
                            <p className="ui-text-primary mt-3 text-sm font-semibold">
                                {t("admin.projects.selectProject")}
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-slate-500">
                                {t("admin.projects.selectHint")}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(confirmDeleteMember)}
                title={t("admin.projects.deleteMemberTitle")}
                description={t("admin.projects.deleteMemberDesc", {
                    email: confirmDeleteMember?.memberEmail || "",
                })}
                confirmLabel={t("common.delete")}
                cancelLabel={t("common.cancel")}
                danger
                onConfirm={handleDeleteMember}
                onCancel={() => setConfirmDeleteMember(null)}
            />
        </AdminPageShell>
    );
}

function SectionTitle({ children }) {
    return (
        <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400/90">
            {children}
        </p>
    );
}

function Field({ label, icon: Icon, className = "", ...props }) {
    return (
        <label className={`block ${className}`}>
            <span className="ui-label">{label}</span>
            <div className="ui-field mt-1">
                {Icon ? <Icon size={15} className="ui-text-accent shrink-0" /> : null}
                <input {...props} className="ui-input min-w-0 flex-1" />
            </div>
        </label>
    );
}

function Badge({ children, tone = "slate" }) {
    const tones = {
        slate: "border-[var(--color-border)] bg-[var(--color-surface-muted)] ui-text-muted",
        fuchsia:
            "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200",
        cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
    };
    return (
        <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${tones[tone] || tones.slate}`}
        >
            {children}
        </span>
    );
}

function Meta({ label, value }) {
    return (
        <div className="ui-card px-2 py-1.5">
            <p className="ui-text-faint text-[10px]">{label}</p>
            <p className="ui-text-primary truncate text-xs font-semibold">{value ?? "—"}</p>
        </div>
    );
}

function Alert({ children, tone }) {
    const cls =
        tone === "error"
            ? "border-red-500/20 bg-red-500/10 text-red-100"
            : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    return <div className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

export default AdminProjects;
