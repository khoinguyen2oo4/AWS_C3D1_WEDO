/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Edit3, Mail, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import {
    addProjectMember,
    deleteProjectMember,
    getProjectMembers,
    getProjectTasks,
    updateProjectMember,
} from "../../services/projectService";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import DarkSelect from "../../shared/components/DarkSelect";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";
import { useI18n } from "../../shared/i18n/useI18n";
import { getMemberRoleOptions } from "../../shared/i18n/optionLabels";
import { formatDate, getInitials } from "../components/projectHelpers";

const EMPTY_FORM = {
    memberEmail: "",
    role: "MEMBER",
};

function ProjectMembers() {
    const { t, locale } = useI18n();
    const memberRoleOptions = useMemo(() => getMemberRoleOptions(t), [t]);
    const { project, canManageMembers } = useOutletContext();
    const emptyDate = t("common.none");
    const currentEmail = localStorage.getItem("email") || "";
    const isOwner =
        typeof canManageMembers === "boolean"
            ? canManageMembers
            : (project.ownerEmail || "").toLowerCase() === currentEmail.toLowerCase();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [filters, setFilters] = useState({ search: "", role: "ALL" });

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const [memberData, taskData] = await Promise.all([
                getProjectMembers(project.id),
                getProjectTasks(project.id),
            ]);
            setMembers(memberData);
            setTasks(taskData);
            setSelectedMemberId((current) => current || memberData[0]?.id || null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const workloadMap = useMemo(() => {
        const map = new Map();
        tasks.forEach((task) => {
            const key = task.assigneeEmail || task.assigneeName;
            if (!key) return;
            map.set(key, (map.get(key) || 0) + 1);
        });
        return map;
    }, [tasks]);

    const filteredMembers = useMemo(() => {
        const search = filters.search.trim().toLowerCase();
        return members.filter((member) => {
            if (filters.role !== "ALL" && member.role !== filters.role) return false;
            if (!search) return true;
            return [member.memberName, member.memberEmail, member.role].filter(Boolean).join(" ").toLowerCase().includes(search);
        });
    }, [filters, members]);

    const selectedMember = filteredMembers.find((member) => member.id === selectedMemberId) || filteredMembers[0] || null;
    const selectedTasks = useMemo(() => {
        if (!selectedMember) return [];
        return tasks.filter(
            (task) =>
                task.assigneeEmail?.toLowerCase() === selectedMember.memberEmail?.toLowerCase() ||
                task.assigneeName?.toLowerCase() === selectedMember.memberName?.toLowerCase()
        );
    }, [selectedMember, tasks]);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingMemberId(null);
        setActionError(null);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!isOwner || !form.memberEmail.trim()) return;

        setSaving(true);
        setActionError(null);
        try {
            const payload = {
                memberEmail: form.memberEmail.trim(),
                role: form.role,
            };
            const updated = editingMemberId
                ? await updateProjectMember(project.id, editingMemberId, payload)
                : await addProjectMember(project.id, payload);

            setMembers(updated);
            resetForm();
        } catch (err) {
            setActionError(err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (member) => {
        setActionError(null);
        setEditingMemberId(member.id);
        setForm({
            memberEmail: member.memberEmail || "",
            role: member.role || "MEMBER",
        });
    };

    const handleDelete = async () => {
        if (!confirmDeleteId || !isOwner) return;

        setSaving(true);
        setActionError(null);
        try {
            const updated = await deleteProjectMember(project.id, confirmDeleteId);
            setMembers(updated);
            setConfirmDeleteId(null);
            if (selectedMember?.id === confirmDeleteId) {
                setSelectedMemberId(updated[0]?.id || null);
            }
        } catch (err) {
            setActionError(err);
        } finally {
            setSaving(false);
        }
    };

    const isOwnerMember = (member) =>
        member.role === "OWNER" ||
        member.memberEmail?.toLowerCase() === project.ownerEmail?.toLowerCase();

    if (loading) {
        return (
            <WorkspaceLoadingState
                title={t("project.members.loadingTitle")}
                description={t("project.members.loadingDesc")}
            />
        );
    }

    if (error) {
        return (
            <WorkspaceErrorState
                title={t("project.members.errorTitle")}
                message={t("project.members.errorDesc")}
                status={error?.response?.status}
                onRetry={load}
            />
        );
    }

    return (
        <div className="ui-page">
            <section className="ui-stat-grid md:grid-cols-4">
                <CompactStat label={t("project.members.title")} value={members.length} />
                <CompactStat label={t("nav.tasks")} value={workloadMap.size} />
                <CompactStat
                    label={t("settings.permission")}
                    value={isOwner ? t("common.owner") : t("common.view")}
                />
                <CompactStat label={t("tasks.filterAll")} value={filteredMembers.length} />
            </section>

            <section
                className={
                    isOwner
                        ? "ui-section-grid ui-section-grid--3-master"
                        : "ui-section-grid ui-section-grid--master-wide"
                }
            >
                <WorkspacePanel
                    title={t("project.members.title")}
                    subtitle={`${filteredMembers.length}/${members.length}`}
                    className="ui-panel-viewport"
                >
                    <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_200px]">
                        <label className="block">
                            <span className="ui-label">
                                {t("common.search")}
                            </span>
                            <div className="ui-field mt-1">
                                <Search size={15} className="ui-text-faint shrink-0" />
                                <input
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters((current) => ({ ...current, search: e.target.value }))
                                    }
                                    className="ui-input min-w-0 flex-1"
                                    placeholder={t("project.members.searchPlaceholder")}
                                />
                            </div>
                        </label>
                        <DarkSelect
                            label={t("project.members.roleLabel")}
                            value={filters.role}
                            onChange={(value) => setFilters((current) => ({ ...current, role: value }))}
                            options={[
                                { value: "ALL", label: t("tasks.filterAll"), hint: "" },
                                ...memberRoleOptions,
                            ]}
                            menuWidth="260px"
                        />
                    </div>

                    <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
                        <div className="grid gap-2 md:grid-cols-2">
                        {filteredMembers.map((member) => (
                            <article
                                key={member.id}
                                onClick={() => setSelectedMemberId(member.id)}
                                className={[
                                    "ui-card cursor-pointer p-3",
                                    selectedMember?.id === member.id
                                        ? "border-cyan-400/20 bg-cyan-400/10"
                                        : "",
                                ].join(" ")}
                            >
                                <div className="flex min-w-0 items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-200">
                                            {getInitials(member.memberName || member.memberEmail)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="ui-text-primary truncate text-sm font-bold">
                                                {member.memberName || member.memberEmail}
                                            </h3>
                                            <p className="ui-text-muted truncate text-xs">{member.memberEmail}</p>
                                        </div>
                                    </div>
                                    <span className="ui-text-muted shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase" style={{ borderColor: "var(--color-border)" }}>
                                        {member.role}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <p className="ui-text-muted text-xs">
                                            {t("nav.tasks")}:{" "}
                                            <span className="ui-text-primary font-bold">
                                                {workloadMap.get(member.memberEmail) || 0}
                                            </span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleEdit(member);
                                            }}
                                            disabled={!isOwner || isOwnerMember(member)}
                                            className="focus-ring rounded-md border p-1.5 ui-text-muted hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setConfirmDeleteId(member.id);
                                            }}
                                            disabled={!isOwner || isOwnerMember(member)}
                                            className="focus-ring rounded-md border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                        </div>
                        {filteredMembers.length === 0 ? (
                            <div className="ui-card text-sm">
                                {t("project.members.empty")}
                            </div>
                        ) : null}
                    </div>
                </WorkspacePanel>

                <div className="contents">
                    {isOwner ? (
                    <WorkspacePanel
                        title={editingMemberId ? t("common.edit") : t("project.members.add")}
                        subtitle={t("project.members.addTitle")}
                        className="order-3"
                    >
                        <form onSubmit={handleSave} className="space-y-3">
                            <Field
                                label={t("project.members.emailLabel")}
                                value={form.memberEmail}
                                onChange={(e) =>
                                    setForm((current) => ({ ...current, memberEmail: e.target.value }))
                                }
                                disabled={!isOwner}
                                icon={Mail}
                                placeholder={t("project.members.emailPlaceholder")}
                            />
                            <DarkSelect
                                label={t("project.members.roleLabel")}
                                value={form.role}
                                onChange={(value) => setForm((current) => ({ ...current, role: value }))}
                                options={memberRoleOptions}
                                icon={UserRound}
                                disabled={!isOwner}
                                menuWidth="260px"
                            />
                            {actionError ? (
                                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                                    {actionError?.response?.data?.message ||
                                        actionError?.response?.data?.error ||
                                        actionError?.message ||
                                        t("dashboard.actionFailed")}
                                </div>
                            ) : null}
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={!isOwner || saving || !form.memberEmail.trim()}
                                    className="ui-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Plus size={16} />
                                    {editingMemberId ? t("project.members.save") : t("project.members.add")}
                                </button>
                                {editingMemberId ? (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="ui-btn-ghost"
                                    >
                                        <X size={16} />
                                        Hủy
                                    </button>
                                ) : null}
                            </div>
                            {!isOwner ? (
                                <p className="text-sm text-slate-400">{t("project.members.viewOnly")}</p>
                            ) : null}
                        </form>
                    </WorkspacePanel>
                    ) : null}

                    <WorkspacePanel
                        title={t("nav.tasks")}
                        subtitle={
                            selectedMember?.memberName ||
                            selectedMember?.memberEmail ||
                            t("admin.projects.selectProject")
                        }
                        className="order-2 ui-panel-viewport"
                        scroll
                    >
                        {selectedMember ? (
                            <div className="space-y-2">
                                <div className="ui-card">
                                    <h3 className="ui-text-primary truncate text-sm font-bold">
                                        {selectedMember.memberName || selectedMember.memberEmail}
                                    </h3>
                                    <p className="ui-text-muted mt-1 truncate text-xs">
                                        {selectedMember.memberEmail}
                                    </p>
                                    <span className="ui-text-muted mt-2 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase" style={{ borderColor: "var(--color-border)" }}>
                                        {selectedMember.role}
                                    </span>
                                </div>
                                {selectedTasks.length > 0 ? (
                                    selectedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="ui-card"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h4 className="ui-text-primary truncate text-sm font-bold">
                                                        {task.title}
                                                    </h4>
                                                    <p className="ui-text-faint mt-1 truncate text-xs">
                                                        {task.priority} · {task.status}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs font-bold text-cyan-200">
                                                    {task.dueDate
                                                        ? formatDate(task.dueDate, locale, emptyDate)
                                                        : emptyDate}
                                                </span>
                                            </div>
                                            <p className="ui-text-muted mt-2 line-clamp-2 text-sm leading-5">
                                                {task.description || t("common.none")}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="ui-card border-dashed text-sm">
                                        {t("project.room.emptyTasks")}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="ui-card text-sm">
                                Chọn member để xem task.
                            </div>
                        )}
                    </WorkspacePanel>
                </div>
            </section>

            <ConfirmDialog
                open={Boolean(confirmDeleteId)}
                title={t("project.members.deleteTitle")}
                description={t("project.members.deleteDesc", {
                    email: members.find((m) => m.id === confirmDeleteId)?.memberEmail || "",
                })}
                confirmLabel={t("common.delete")}
                danger
                onConfirm={handleDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}

function Field({ label, icon: Icon, ...props }) {
    return (
        <label className="block">
            <span className="ui-label">{label}</span>
            <div className="ui-field mt-1">
                {Icon ? <Icon size={16} className="ui-text-accent shrink-0" /> : null}
                <input
                    {...props}
                    className="ui-input min-w-0 flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>
        </label>
    );
}

function CompactStat({ label, value }) {
    return (
        <div className="ui-stat-card">
            <p className="ui-text-faint text-[9px] font-bold uppercase tracking-wider">{label}</p>
            <h3 className="ui-text-primary mt-0.5 truncate text-sm font-bold">{value}</h3>
        </div>
    );
}

export default ProjectMembers;
