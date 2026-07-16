import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
    BarChart3,
    Clock3,
    Download,
    Eye,
    FileCheck2,
    Gauge,
    GitCompare,
    History,
    MessageSquare,
    Plus,
    RefreshCw,
    Search,
    Upload,
    Users,
} from "lucide-react";
import {
    createProjectTask,
    deleteProjectTask,
    downloadProjectTaskSubmission,
    getProjectInsight,
    getProjectMembers,
    getProjectTaskSubmissions,
    getProjectPerformance,
    getProjectTasks,
    reviewProjectTaskSubmission,
    submitProjectTaskFile,
    updateProjectTask,
} from "../../services/projectService";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import DarkSelect from "../../shared/components/DarkSelect";
import useToast from "../../shared/components/toast/useToast";
import { useI18n } from "../../shared/i18n/useI18n";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import WorkspacePageShell, { WorkspacePanel } from "../components/WorkspacePageShell";
import {
    getAssigneeFilterOptions,
    getPriorityLabel,
    getRiskFilterOptions,
    getStatusLabel,
    getTaskPriorityOptions,
    getTaskStatusOptions,
} from "../../shared/i18n/optionLabels";
import { formatDate, formatDateTime } from "../components/projectHelpers";
import DropZone from "../components/DropZone";
import FilePreviewModal from "../components/FilePreviewModal";
import SubmissionComments from "../components/SubmissionComments";
import VersionCompareModal from "../components/VersionCompareModal";

const ALLOWED_FILE_TYPES = "pptx, ppt, docx, xlsx, pdf, jpg, zip, rar";
const MAX_SUBMISSION_BYTES = 50 * 1024 * 1024;

const EMPTY_DRAFT = (assigneeEmail = "") => ({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeEmail,
    dueDate: "",
    requiredFileTypes: "pdf, docx, pptx",
});

function ProjectTask() {
    const { t, locale } = useI18n();
    const toast = useToast();
    const { project, canManageTasks: canManageTasksFromContext } = useOutletContext();
    const taskStatusOptions = useMemo(() => getTaskStatusOptions(t), [t]);
    const taskPriorityOptions = useMemo(() => getTaskPriorityOptions(t), [t]);
    const riskFilterOptions = useMemo(() => getRiskFilterOptions(t), [t]);
    const filterAllOption = useMemo(
        () => ({ value: "ALL", label: t("tasks.filterAll"), hint: "" }),
        [t]
    );
    const emptyDateLabel = t("common.none");
    const currentUserEmail = localStorage.getItem("email")?.trim() || "";
    const [viewState, setViewState] = useState({
        loading: true,
        error: null,
        tasks: [],
        members: [],
        performance: null,
        insight: null,
    });
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [draftMode, setDraftMode] = useState("create");
    const [draftTaskId, setDraftTaskId] = useState(null);
    const [draft, setDraft] = useState(() => EMPTY_DRAFT(currentUserEmail));
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        status: "ALL",
        priority: "ALL",
        assignee: "ALL",
        risk: "ALL",
    });
    const [submissionDraft, setSubmissionDraft] = useState({ file: null, note: "" });
    const [reviewNote, setReviewNote] = useState("");
    const [submissionHistory, setSubmissionHistory] = useState([]);
    const [submissionHistoryLoading, setSubmissionHistoryLoading] = useState(false);
    const [submissionBusy, setSubmissionBusy] = useState(false);
    const [submissionPanelTab, setSubmissionPanelTab] = useState("comments");
    const [previewTarget, setPreviewTarget] = useState(null);
    const [compareVersions, setCompareVersions] = useState(null);
    const [dragTaskId, setDragTaskId] = useState(null);
    const [transferring, setTransferring] = useState(false);

    const load = async () => {
        setViewState((current) => ({ ...current, loading: true, error: null }));
        setActionError(null);
        setActionMessage(null);

        try {
            const [tasksResult, membersResult, performanceResult, insightResult] = await Promise.allSettled([
                getProjectTasks(project.id),
                getProjectMembers(project.id),
                getProjectPerformance(project.id),
                getProjectInsight(project.id),
            ]);

            const coreError =
                tasksResult.status === "rejected"
                    ? tasksResult.reason
                    : membersResult.status === "rejected"
                        ? membersResult.reason
                        : null;

            if (coreError) {
                setViewState({
                    loading: false,
                    error: coreError,
                    tasks: [],
                    members: [],
                    performance: null,
                    insight: null,
                });
                return;
            }

            setViewState({
                loading: false,
                error: null,
                tasks: tasksResult.value,
                members: membersResult.value,
                performance: performanceResult.status === "fulfilled" ? performanceResult.value : null,
                insight: insightResult.status === "fulfilled" ? insightResult.value : null,
            });
        } catch (error) {
            setViewState((current) => ({ ...current, loading: false, error }));
        }
    };

    const refreshAnalytics = async () => {
        try {
            const [performanceResult, insightResult] = await Promise.allSettled([
                getProjectPerformance(project.id),
                getProjectInsight(project.id),
            ]);

            setViewState((current) => ({
                ...current,
                performance:
                    performanceResult.status === "fulfilled" ? performanceResult.value : current.performance,
                insight: insightResult.status === "fulfilled" ? insightResult.value : current.insight,
            }));
        } catch {
            // Giữ lại dữ liệu cũ nếu analytics vừa bị gián đoạn.
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const assigneeOptions = useMemo(
        () => buildAssigneeOptions(viewState.members, currentUserEmail, project.ownerEmail, t),
        [currentUserEmail, project.ownerEmail, t, viewState.members]
    );

    const assigneeFilterOptions = useMemo(
        () => buildAssigneeFilterOptions(viewState.members, currentUserEmail, project.ownerEmail, t),
        [currentUserEmail, project.ownerEmail, t, viewState.members]
    );

    const defaultAssigneeEmail = useMemo(() => {
        return (
            assigneeOptions[0]?.value ||
            currentUserEmail ||
            project.ownerEmail ||
            viewState.members[0]?.memberEmail ||
            ""
        );
    }, [assigneeOptions, currentUserEmail, project.ownerEmail, viewState.members]);

    const enrichedTasks = useMemo(() => {
        return sortTasks(
            viewState.tasks.map((task) => {
                const progress = getTaskProgress(task.status);
                const risk = getRiskAnalysis(task, currentUserEmail, defaultAssigneeEmail, t);
                const dueDate = parseLocalDate(task.dueDate);
                const daysUntilDue = dueDate ? diffInDays(dueDate, startOfDay(new Date())) : null;
                const isOverdue = Boolean(dueDate) && progress < 100 && daysUntilDue < 0;
                const isDueSoon = Boolean(dueDate) && progress < 100 && daysUntilDue >= 0 && daysUntilDue <= 1;

                return {
                    ...task,
                    progress,
                    risk,
                    dueDateDate: dueDate,
                    daysUntilDue,
                    isOverdue,
                    isDueSoon,
                    assigneeLabel: resolveAssigneeLabel(
                        task.assigneeEmail,
                        viewState.members,
                        currentUserEmail,
                        t
                    ),
                };
            })
        );
    }, [currentUserEmail, defaultAssigneeEmail, t, viewState.members, viewState.tasks]);

    const filteredTasks = useMemo(
        () =>
            enrichedTasks.filter((task) => {
                const search = filters.search.trim().toLowerCase();
                const matchesSearch =
                    search.length === 0 ||
                    [task.title, task.description, task.assigneeLabel, task.status, task.priority]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(search));
                const matchesStatus = filters.status === "ALL" || task.status === filters.status;
                const matchesPriority = filters.priority === "ALL" || task.priority === filters.priority;
                const matchesAssignee =
                    filters.assignee === "ALL"
                        ? true
                        : filters.assignee === "UNASSIGNED"
                            ? !task.assigneeEmail
                            : normalizeEmail(task.assigneeEmail) === normalizeEmail(filters.assignee);
                const matchesRisk =
                    filters.risk === "ALL" || task.risk.band === filters.risk;

                return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesRisk;
            }),
        [enrichedTasks, filters]
    );

    const selectedTask = useMemo(
        () => enrichedTasks.find((task) => task.id === selectedTaskId) || null,
        [enrichedTasks, selectedTaskId]
    );

    const draftRisk = useMemo(() => {
        return getRiskAnalysis(
            {
                title: draft.title,
                description: draft.description,
                status: draft.status,
                priority: draft.priority,
                assigneeEmail: draft.assigneeEmail || defaultAssigneeEmail,
                dueDate: draft.dueDate || null,
            },
            currentUserEmail,
            defaultAssigneeEmail,
            t
        );
    }, [currentUserEmail, defaultAssigneeEmail, draft, t]);

    const summary = useMemo(() => {
        const total = enrichedTasks.length;
        const done = enrichedTasks.filter((task) => task.status === "DONE").length;
        const open = total - done;
        const dueSoon = enrichedTasks.filter((task) => task.isDueSoon).length;
        const overdue = enrichedTasks.filter((task) => task.isOverdue).length;
        const highRisk = enrichedTasks.filter((task) => task.risk.band === "HIGH").length;
        const completion = viewState.performance?.completionRate ?? (total === 0 ? 0 : Math.round((done * 1000) / total) / 10);

        return { total, done, open, dueSoon, overdue, highRisk, completion };
    }, [enrichedTasks, viewState.performance]);

    useEffect(() => {
        if (viewState.loading || viewState.error) {
            return;
        }

        if (enrichedTasks.length === 0) {
            if (selectedTaskId !== null) {
                setSelectedTaskId(null);
            }
            return;
        }

        const hasSelection = enrichedTasks.some((task) => task.id === selectedTaskId);
        if (!hasSelection) {
            setSelectedTaskId(enrichedTasks[0].id);
        }
    }, [enrichedTasks, selectedTaskId, viewState.error, viewState.loading]);

    useEffect(() => {
        setReviewNote(selectedTask?.reviewNote || "");
        setSubmissionHistory([]);

        if (!selectedTask?.id) {
            return;
        }

        if (!selectedTask.submissionOriginalName) {
            return;
        }

        let cancelled = false;
        setSubmissionHistoryLoading(true);
        getProjectTaskSubmissions(project.id, selectedTask.id)
            .then((items) => {
                if (!cancelled) {
                    setSubmissionHistory(items);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSubmissionHistory([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setSubmissionHistoryLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id, selectedTask?.id, selectedTask?.reviewNote]);

    if (viewState.loading) {
        return (
            <WorkspaceLoadingState
                title={t("tasks.loadingTitle")}
                description={t("tasks.loadingDesc")}
            />
        );
    }

    if (viewState.error) {
        return (
            <WorkspaceErrorState
                title={t("tasks.errorTitle")}
                message={t("tasks.errorDesc")}
                status={viewState.error?.response?.status}
                onRetry={load}
            />
        );
    }

    const isOwner =
        typeof canManageTasksFromContext === "boolean"
            ? canManageTasksFromContext
            : normalizeEmail(project.ownerEmail) === normalizeEmail(currentUserEmail);
    const canEditTask = () => isOwner;
    const canDeleteTask = isOwner;
    const canSubmitTask = (task) =>
        isOwner || normalizeEmail(task.assigneeEmail) === normalizeEmail(currentUserEmail);
    const canReviewTask = (task) =>
        isOwner && task?.submissionOriginalName && task?.submissionStatus === "PENDING_REVIEW";

    const openEditDraft = (task) => {
        setDraftMode("edit");
        setDraftTaskId(task.id);
        setDraft(taskToDraft(task, defaultAssigneeEmail));
        setActionError(null);
        setActionMessage(null);
    };

    const saveDraft = async (event) => {
        event.preventDefault();
        if (!isOwner || !draft.title.trim()) return;

        setSaving(true);
        setActionError(null);
        setActionMessage(null);

        try {
            const payload = {
                title: draft.title.trim(),
                description: draft.description.trim(),
                status: draft.status,
                priority: draft.priority,
                assigneeEmail: draft.assigneeEmail || defaultAssigneeEmail,
                dueDate: draft.dueDate || null,
                requiredFileTypes: draft.requiredFileTypes.trim() || "pdf, docx, pptx",
            };

            const saved =
                draftMode === "create"
                    ? await createProjectTask(project.id, payload)
                    : await updateProjectTask(project.id, draftTaskId, payload);

            setViewState((current) => ({
                ...current,
                tasks:
                    draftMode === "create"
                        ? [...current.tasks, saved]
                        : current.tasks.map((task) => (task.id === saved.id ? saved : task)),
            }));
            setDraftMode("edit");
            setDraftTaskId(saved.id);
            setSelectedTaskId(saved.id);
            await refreshAnalytics();
            setActionMessage(t("tasks.msgSaved"));
            toast.success(t("tasks.msgSaved"));
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    t("tasks.msgSaveFailed");
            setActionError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const submitFile = async () => {
        if (!selectedTask || !submissionDraft.file) return;

        if (submissionDraft.file.size > MAX_SUBMISSION_BYTES) {
            setActionError(t("tasks.msgFileTooBig"));
            setActionMessage(null);
            toast.warning(t("tasks.msgFileTooBig"));
            return;
        }

        setSubmissionBusy(true);
        setActionError(null);
        setActionMessage(null);

        try {
            const updated = await submitProjectTaskFile(
                project.id,
                selectedTask.id,
                submissionDraft.file,
                submissionDraft.note
            );
            setViewState((current) => ({
                ...current,
                tasks: current.tasks.map((task) => (task.id === updated.id ? updated : task)),
            }));
            setSubmissionDraft({ file: null, note: "" });
            await refreshAnalytics();
            void getProjectTaskSubmissions(project.id, selectedTask.id)
                .then(setSubmissionHistory)
                .catch(() => setSubmissionHistory([]));
            setActionMessage(t("tasks.msgSubmitted"));
            toast.success(t("tasks.msgSubmitted"));
        } catch (error) {
            const status = error?.response?.status;
            const message =
                error?.response?.data?.message ||
                    (status === 413
                        ? t("tasks.msgFileTooBig")
                        : error?.code === "ERR_NETWORK"
                          ? t("tasks.msgNetwork")
                          : error?.response?.data?.error ||
                            error?.message ||
                            t("tasks.msgSubmitFailed"));
            setActionError(message);
            toast.error(message);
        } finally {
            setSubmissionBusy(false);
        }
    };

    const reviewSubmission = async (status) => {
        if (!selectedTask) return;

        setSubmissionBusy(true);
        setActionError(null);
        setActionMessage(null);

        try {
            const updated = await reviewProjectTaskSubmission(project.id, selectedTask.id, {
                status,
                reviewNote,
            });
            setViewState((current) => ({
                ...current,
                tasks: current.tasks.map((task) => (task.id === updated.id ? updated : task)),
            }));
            await refreshAnalytics();
            void getProjectTaskSubmissions(project.id, selectedTask.id)
                .then(setSubmissionHistory)
                .catch(() => setSubmissionHistory([]));
            setReviewNote("");
            const message = status === "APPROVED" ? t("tasks.msgApproved") : t("tasks.msgRejected");
            setActionMessage(message);
            toast.success(message);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    t("tasks.msgReviewFailed");
            setActionError(message);
            toast.error(message);
        } finally {
            setSubmissionBusy(false);
        }
    };

    const transferTaskToMember = async (taskId, assigneeEmail) => {
        if (!isOwner || !taskId || !assigneeEmail) return;
        setTransferring(true);
        setActionError(null);
        try {
            const updated = await updateProjectTask(project.id, taskId, { assigneeEmail });
            setViewState((current) => ({
                ...current,
                tasks: current.tasks.map((task) => (task.id === updated.id ? updated : task)),
            }));
            const member = viewState.members.find(
                (item) => normalizeEmail(item.memberEmail) === normalizeEmail(assigneeEmail)
            );
            const message = t("features.dragTask.transferred", {
                name: member?.memberName || assigneeEmail,
            });
            setActionMessage(message);
            toast.success(message);
            await refreshAnalytics();
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                t("features.dragTask.transferFailed");
            setActionError(message);
            toast.error(message);
        } finally {
            setTransferring(false);
            setDragTaskId(null);
        }
    };

    const downloadSubmission = async (task) => {
        if (!task?.submissionOriginalName) return;

        setSubmissionBusy(true);
        try {
            const response = await downloadProjectTaskSubmission(project.id, task.id);
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = task.submissionOriginalName;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                    error?.message ||
                    t("tasks.msgDownloadFailed");
            setActionError(message);
            toast.error(message);
        } finally {
            setSubmissionBusy(false);
        }
    };

    const stats = [
        {
            label: t("tasks.statTotal"),
            value: summary.total,
            note: t("tasks.statTotalNote"),
            tone: "text-white",
        },
        {
            label: t("tasks.statOpen"),
            value: summary.open,
            note: t("tasks.statOpenNote"),
            tone: "text-cyan-200",
        },
        {
            label: t("tasks.statDone"),
            value: summary.done,
            note: t("tasks.statDoneNote"),
            tone: "text-emerald-200",
        },
        {
            label: t("tasks.statProgress"),
            value: `${summary.completion.toFixed?.(1) ?? summary.completion}%`,
            note: t("tasks.statProgressNote"),
            tone: "text-cyan-100",
        },
        {
            label: t("tasks.statOverdue"),
            value: summary.overdue,
            note: t("tasks.statOverdueNote"),
            tone: "text-red-200",
        },
        {
            label: t("tasks.statRisk"),
            value: summary.highRisk,
            note: t("tasks.statRiskNote"),
            tone: "text-red-100",
        },
    ];

    const displayStats = stats.slice(0, 4);

    return (
        <>
            <WorkspacePageShell
                eyebrow={isOwner ? t("tasks.eyebrowOwner") : t("tasks.eyebrowMember")}
                title={t("tasks.title")}
                description={isOwner ? t("tasks.descOwner") : t("tasks.descMember")}
                actions={
                    <>
                        {isOwner ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setDraftMode("create");
                                    setDraftTaskId(null);
                                    setDraft(EMPTY_DRAFT(defaultAssigneeEmail));
                                    setSelectedTaskId(null);
                                    setActionError(null);
                                    setActionMessage(null);
                                }}
                                className="ui-btn-primary"
                            >
                                <Plus size={15} />
                                {t("tasks.create")}
                            </button>
                        ) : null}
                        <button type="button" onClick={load} className="ui-btn-ghost focus-ring">
                            <RefreshCw size={15} />
                            {t("common.refresh")}
                        </button>
                        {isOwner ? (
                            <Link
                                to={`/project/${project.id}/performance`}
                                className="ui-btn-ghost focus-ring"
                            >
                                <BarChart3 size={15} />
                                {t("nav.performance")}
                            </Link>
                        ) : null}
                    </>
                }
                stats={displayStats}
            >
                {(actionError || actionMessage) && (
                    <div
                        className={`rounded-lg border px-3 py-2 text-sm ${
                            actionError
                                ? "border-red-500/20 bg-red-500/10 text-red-100"
                                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                        }`}
                    >
                        {actionError || actionMessage}
                    </div>
                )}

                {viewState.performance ? (
                    <div className="grid gap-2 md:grid-cols-4">
                        <SlaCard
                            label={t("features.sla.overdue")}
                            value={viewState.performance.overdueTasks ?? summary.overdue}
                            tone="text-red-200 border-red-500/20 bg-red-500/10"
                        />
                        <SlaCard
                            label={t("features.sla.dueSoon")}
                            value={viewState.performance.dueSoonTasks ?? summary.dueSoon}
                            tone="text-amber-200 border-amber-400/20 bg-amber-400/10"
                        />
                        <SlaCard
                            label={t("features.sla.onTimeRate")}
                            value={`${viewState.performance.onTimeRate ?? 0}%`}
                            tone="text-emerald-200 border-emerald-400/20 bg-emerald-400/10"
                        />
                        <SlaCard
                            label={t("tasks.statRisk")}
                            value={summary.highRisk}
                            tone="text-cyan-200 border-cyan-400/20 bg-cyan-400/10"
                        />
                    </div>
                ) : null}

                {viewState.performance?.workloadAlerts?.length > 0 ? (
                    <div className="space-y-2">
                        {viewState.performance.workloadAlerts.map((alert) => (
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
                    </div>
                ) : null}

                {isOwner ? (
                    <div className="ui-card p-3">
                        <p className="ui-text-faint text-[10px] font-bold uppercase">
                            {t("features.dragTask.hint")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {viewState.members.map((member) => (
                                <button
                                    key={member.id || member.memberEmail}
                                    type="button"
                                    disabled={transferring}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        const taskId = Number(event.dataTransfer.getData("taskId") || dragTaskId);
                                        if (taskId) {
                                            transferTaskToMember(taskId, member.memberEmail);
                                        }
                                    }}
                                    className={[
                                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                                        dragTaskId
                                            ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100"
                                            : "border-[var(--color-border)] bg-[var(--color-surface-muted)]",
                                    ].join(" ")}
                                >
                                    {member.memberName || member.memberEmail}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="ui-panel">
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(180px,1.6fr)_repeat(4,minmax(130px,1fr))]">
                        <FilterField label={t("common.search")}>
                            <span className="ui-field">
                                <Search size={14} className="text-slate-500" />
                                <input
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters((f) => ({ ...f, search: e.target.value }))
                                    }
                                    className="ui-input min-w-0 flex-1"
                                    placeholder={t("tasks.searchPlaceholder")}
                                />
                            </span>
                        </FilterField>
                        <DarkSelect
                            label={t("tasks.filterStatus")}
                            value={filters.status}
                            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                            options={[filterAllOption, ...taskStatusOptions]}
                        />
                        <DarkSelect
                            label={t("tasks.fieldPriority")}
                            value={filters.priority}
                            onChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
                            options={[filterAllOption, ...taskPriorityOptions]}
                        />
                        <DarkSelect
                            label={t("tasks.filterAssignee")}
                            value={filters.assignee}
                            onChange={(v) => setFilters((f) => ({ ...f, assignee: v }))}
                            options={assigneeFilterOptions}
                        />
                        <DarkSelect
                            label={t("tasks.filterRisk")}
                            value={filters.risk}
                            onChange={(v) => setFilters((f) => ({ ...f, risk: v }))}
                            options={riskFilterOptions}
                        />
                    </div>
                </div>

                <div
                    className={
                        isOwner
                            ? "task-columns-grid ui-section-grid ui-section-grid--3-master items-stretch"
                            : "task-columns-grid ui-section-grid ui-section-grid--master-wide items-stretch"
                    }
                >
                    <WorkspacePanel
                        title={t("tasks.listTitle")}
                        subtitle={t("tasks.listSubtitle", { count: filteredTasks.length })}
                        scroll
                        className="task-column-panel ui-panel-viewport"
                    >
                        <div className="space-y-2">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        selected={task.id === selectedTaskId}
                                        assigneeLabel={task.assigneeLabel}
                                        onSelect={() => setSelectedTaskId(task.id)}
                                        onEdit={() => openEditDraft(task)}
                                        canEdit={canEditTask()}
                                        canDelete={canDeleteTask}
                                        onDelete={() => setDeleteTarget(task)}
                                        draggable={isOwner}
                                        onDragStart={(event) => {
                                            event.dataTransfer.setData("taskId", String(task.id));
                                            setDragTaskId(task.id);
                                        }}
                                        onDragEnd={() => setDragTaskId(null)}
                                        t={t}
                                        locale={locale}
                                        emptyDateLabel={emptyDateLabel}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">{t("tasks.emptyList")}</p>
                            )}
                        </div>
                    </WorkspacePanel>

                    <div className="min-h-0 min-w-0">
                        {selectedTask ? (
                            <WorkspacePanel
                                title={t("tasks.detailTitle")}
                                subtitle={selectedTask.title}
                                className="task-column-panel"
                                scroll
                            >
                                <div className="space-y-3">
                                    <p className="ui-text-muted text-sm leading-5">
                                        {selectedTask.description || t("common.none")}
                                    </p>
                                    <div className="grid gap-2">
                                        <DetailRow
                                            icon={Users}
                                            label={t("tasks.fieldAssignee")}
                                            value={selectedTask.assigneeLabel}
                                        />
                                        <DetailRow
                                            icon={Clock3}
                                            label={t("tasks.fieldDue")}
                                            value={
                                                selectedTask.dueDate
                                                    ? formatDate(
                                                          selectedTask.dueDate,
                                                          locale,
                                                          emptyDateLabel
                                                      )
                                                    : emptyDateLabel
                                            }
                                        />
                                        <DetailRow
                                            icon={FileCheck2}
                                            label={t("tasks.fieldFileTypes")}
                                            value={selectedTask.requiredFileTypes || ALLOWED_FILE_TYPES}
                                        />
                                        <DetailRow
                                            icon={Gauge}
                                            label={t("tasks.submissionTitle")}
                                            value={getSubmissionLabel(selectedTask.submissionStatus, t)}
                                        />
                                    </div>

                                    {selectedTask.submissionOriginalName ? (
                                        <div className="ui-card">
                                            <p className="ui-text-primary truncate text-sm font-semibold">
                                                {selectedTask.submissionOriginalName}
                                            </p>
                                            {selectedTask.submissionNote ? (
                                                <p className="ui-text-muted mt-1 line-clamp-2 text-xs">
                                                    {selectedTask.submissionNote}
                                                </p>
                                            ) : null}
                                            <div className="mt-2 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewTarget({
                                                            taskId: selectedTask.id,
                                                            submissionId: null,
                                                            fileName: selectedTask.submissionOriginalName,
                                                        })
                                                    }
                                                    className="focus-ring inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                                                >
                                                    <Eye size={14} />
                                                    {t("features.preview.title")}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => downloadSubmission(selectedTask)}
                                                    disabled={submissionBusy}
                                                    className="focus-ring inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                                                >
                                                    <Download size={14} />
                                                    {t("tasks.downloadFile")}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {selectedTask.reviewNote ? (
                                        <div className="ui-card border-cyan-500/20 bg-cyan-500/5">
                                            <p className="ui-text-faint text-[10px] font-bold uppercase">
                                                {t("tasks.reviewNote")}
                                            </p>
                                            <p className="ui-text-primary mt-1 text-sm leading-5">
                                                {selectedTask.reviewNote}
                                            </p>
                                        </div>
                                    ) : null}

                                    {canSubmitTask(selectedTask) ? (
                                        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                                            <p className="text-xs font-semibold text-cyan-200">
                                                {t("tasks.submitFile")} (
                                                {selectedTask.requiredFileTypes || ALLOWED_FILE_TYPES})
                                            </p>
                                            <DropZone
                                                className="mt-2"
                                                accept={buildAcceptTypes(selectedTask.requiredFileTypes)}
                                                disabled={submissionBusy}
                                                file={submissionDraft.file}
                                                onFileChange={(file) =>
                                                    setSubmissionDraft((s) => ({
                                                        ...s,
                                                        file,
                                                    }))
                                                }
                                            />
                                            <textarea
                                                value={submissionDraft.note}
                                                onChange={(e) =>
                                                    setSubmissionDraft((s) => ({
                                                        ...s,
                                                        note: e.target.value,
                                                    }))
                                                }
                                                rows={2}
                                                placeholder={t("tasks.reviewNotePlaceholder")}
                                                className="ui-textarea focus-ring mt-2 resize-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={submitFile}
                                                disabled={submissionBusy || !submissionDraft.file}
                                                className="ui-btn-primary mt-2 w-full disabled:opacity-50"
                                            >
                                                <Upload size={15} />
                                                {submissionBusy
                                                    ? t("tasks.submittingFile")
                                                    : t("tasks.submitFile")}
                                            </button>
                                        </div>
                                    ) : null}

                                    {canReviewTask(selectedTask) ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={reviewNote}
                                                onChange={(event) => setReviewNote(event.target.value)}
                                                rows={2}
                                                className="ui-textarea focus-ring resize-none"
                                                placeholder={t("tasks.reviewNotePlaceholder")}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => reviewSubmission("APPROVED")}
                                                disabled={submissionBusy}
                                                className="focus-ring flex-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-500/30"
                                            >
                                                {t("tasks.reviewApprove")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => reviewSubmission("REJECTED")}
                                                disabled={submissionBusy}
                                                className="focus-ring flex-1 rounded-lg bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200 hover:bg-red-500/25"
                                            >
                                                {t("tasks.reviewReject")}
                                            </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {isOwner ? (
                                        <button
                                            type="button"
                                            onClick={() => openEditDraft(selectedTask)}
                                            className="ui-btn-ghost w-full"
                                        >
                                            {t("common.edit")}
                                        </button>
                                    ) : null}
                                </div>
                            </WorkspacePanel>
                        ) : (
                            <WorkspacePanel
                                title={t("tasks.detailTitle")}
                                subtitle={t("tasks.detailNew")}
                                className="task-column-panel"
                                scroll
                            >
                                <p className="text-sm text-slate-500">
                                    {isOwner ? t("tasks.descOwner") : t("tasks.descMember")}
                                </p>
                            </WorkspacePanel>
                        )}
                    </div>

                    {isOwner ? (
                        <div className="min-h-0 min-w-0">
                            {draftMode === "create" || draftTaskId ? (
                                <WorkspacePanel
                                    title={
                                        draftMode === "create"
                                            ? t("tasks.detailNew")
                                            : t("common.edit")
                                    }
                                    subtitle={t("tasks.eyebrowOwner")}
                                    className="task-column-panel"
                                    scroll
                                >
                                    <form onSubmit={saveDraft} className="space-y-3">
                                        <input
                                            value={draft.title}
                                            onChange={(e) =>
                                                setDraft((d) => ({ ...d, title: e.target.value }))
                                            }
                                            className="ui-input focus-ring"
                                            placeholder={`${t("tasks.fieldTitle")} *`}
                                            required
                                        />
                                        <textarea
                                            value={draft.description}
                                            onChange={(e) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    description: e.target.value,
                                                }))
                                            }
                                            rows={2}
                                            className="ui-textarea focus-ring resize-none"
                                            placeholder={t("tasks.fieldDescription")}
                                        />
                                        <div className="grid gap-2">
                                            <DarkSelect
                                                label={t("tasks.fieldStatus")}
                                                value={draft.status}
                                                onChange={(v) =>
                                                    setDraft((d) => ({ ...d, status: v }))
                                                }
                                                options={taskStatusOptions}
                                            />
                                            <DarkSelect
                                                label={t("tasks.fieldPriority")}
                                                value={draft.priority}
                                                onChange={(v) =>
                                                    setDraft((d) => ({ ...d, priority: v }))
                                                }
                                                options={taskPriorityOptions}
                                            />
                                        </div>
                                        <DarkSelect
                                            label={t("tasks.fieldAssignee")}
                                            value={draft.assigneeEmail}
                                            onChange={(v) =>
                                                setDraft((d) => ({ ...d, assigneeEmail: v }))
                                            }
                                            options={assigneeOptions}
                                        />
                                        <label className="block">
                                            <span className="ui-label">{t("tasks.fieldDue")}</span>
                                            <input
                                                type="date"
                                                value={draft.dueDate}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        dueDate: e.target.value,
                                                    }))
                                                }
                                                className="ui-input focus-ring mt-1"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="ui-label">{t("tasks.fieldFileTypes")}</span>
                                            <input
                                                value={draft.requiredFileTypes}
                                                onChange={(e) =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        requiredFileTypes: e.target.value,
                                                    }))
                                                }
                                                className="ui-input focus-ring mt-1"
                                                placeholder={ALLOWED_FILE_TYPES}
                                            />
                                        </label>
                                        <p className="text-[10px] text-slate-500">
                                            {t("tasks.riskLevel")}: {draftRisk.label} ({draftRisk.score})
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="ui-btn-primary w-full disabled:opacity-60"
                                        >
                                            {saving ? t("tasks.savingTask") : t("tasks.saveTask")}
                                        </button>
                                    </form>
                                </WorkspacePanel>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {selectedTask &&
                (selectedTask.submissionOriginalName || submissionHistory.length > 0) ? (
                    <WorkspacePanel
                        title={t("tasks.submissionWorkspace")}
                        subtitle={selectedTask.title}
                    >
                        <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
                            <div
                                className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <div
                                    className="flex rounded-lg p-1"
                                    style={{ background: "var(--color-surface-muted)" }}
                                >
                                    <SubmissionTabButton
                                        active={submissionPanelTab === "comments"}
                                        icon={MessageSquare}
                                        label={t("features.comments.title")}
                                        onClick={() => setSubmissionPanelTab("comments")}
                                    />
                                    <SubmissionTabButton
                                        active={submissionPanelTab === "history"}
                                        icon={History}
                                        label={t("tasks.submissionHistory")}
                                        count={submissionHistory.length}
                                        onClick={() => setSubmissionPanelTab("history")}
                                    />
                                </div>

                                {submissionPanelTab === "history" &&
                                submissionHistory.length >= 2 ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCompareVersions({
                                                left: submissionHistory[1],
                                                right: submissionHistory[0],
                                            })
                                        }
                                        className="ui-btn-ghost px-2 py-1 text-[10px]"
                                    >
                                        <GitCompare size={12} />
                                        {t("features.versions.compare")}
                                    </button>
                                ) : null}
                            </div>

                            <div className="h-[240px] min-h-0 p-3">
                                {submissionPanelTab === "comments" ? (
                                    selectedTask.submissionOriginalName &&
                                    submissionHistory[0]?.id ? (
                                        <SubmissionComments
                                            projectId={project.id}
                                            submissionId={submissionHistory[0].id}
                                            members={viewState.members}
                                        />
                                    ) : (
                                        <p className="ui-text-muted text-xs">
                                            {t("features.comments.empty")}
                                        </p>
                                    )
                                ) : (
                                    <div className="grid h-full min-h-0 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                                        {submissionHistoryLoading ? (
                                            <p className="ui-text-muted text-xs">
                                                {t("common.loading")}
                                            </p>
                                        ) : submissionHistory.length > 0 ? (
                                            submissionHistory.map((item, index) => (
                                                <SubmissionHistoryItem
                                                    key={item.id}
                                                    item={item}
                                                    versionNumber={submissionHistory.length - index}
                                                    locale={locale}
                                                    t={t}
                                                    emptyDateLabel={emptyDateLabel}
                                                    onPreview={() =>
                                                        setPreviewTarget({
                                                            taskId: selectedTask.id,
                                                            submissionId: item.id,
                                                            fileName: item.originalName,
                                                        })
                                                    }
                                                />
                                            ))
                                        ) : (
                                            <p className="ui-text-muted text-xs">
                                                {t("tasks.noSubmission")}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </WorkspacePanel>
                ) : null}
            </WorkspacePageShell>

            {previewTarget ? (
                <FilePreviewModal
                    projectId={project.id}
                    taskId={previewTarget.taskId}
                    submissionId={previewTarget.submissionId}
                    fileName={previewTarget.fileName}
                    onClose={() => setPreviewTarget(null)}
                    onDownload={() => {
                        const task = viewState.tasks.find((item) => item.id === previewTarget.taskId);
                        if (task) downloadSubmission(task);
                    }}
                />
            ) : null}

            {compareVersions ? (
                <VersionCompareModal
                    left={compareVersions.left}
                    right={compareVersions.right}
                    locale={locale}
                    onClose={() => setCompareVersions(null)}
                    onPreview={(item) =>
                        setPreviewTarget({
                            taskId: selectedTask?.id,
                            submissionId: item.id,
                            fileName: item.originalName,
                        })
                    }
                />
            ) : null}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title={`${t("tasks.deleteTaskTitle")}: ${deleteTarget?.title || ""}`}
                description={t("tasks.deleteTaskDesc")}
                confirmLabel={saving ? t("settings.deleting") : t("tasks.deleteTask")}
                danger
                onCancel={() => {
                    if (saving) return;
                    setDeleteTarget(null);
                }}
                onConfirm={async () => {
                    if (!deleteTarget || saving) {
                        return;
                    }

                    setSaving(true);
                    setActionError(null);

                    try {
                        await deleteProjectTask(project.id, deleteTarget.id);
                        setViewState((current) => ({
                            ...current,
                            tasks: current.tasks.filter((task) => task.id !== deleteTarget.id),
                        }));
                        await refreshAnalytics();
                        setActionMessage(t("tasks.msgDeleted"));
                        toast.success(t("tasks.msgDeleted"));
                        setDeleteTarget(null);
                        if (draftTaskId === deleteTarget.id) {
                            setDraftMode("create");
                            setDraftTaskId(null);
                            setDraft(EMPTY_DRAFT(defaultAssigneeEmail));
                        }
                        if (selectedTaskId === deleteTarget.id) {
                            setSelectedTaskId(null);
                        }
                    } catch (error) {
                        const message =
                            error?.response?.data?.message ||
                                error?.response?.data?.error ||
                                error?.message ||
                                t("tasks.msgSaveFailed");
                        setActionError(message);
                        toast.error(message);
                    } finally {
                        setSaving(false);
                    }
                }}
            />
        </>
    );
}

function SubmissionTabButton({ active, icon: Icon, label, count, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold transition",
                active
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-200"
                    : "ui-text-muted hover:bg-black/5 dark:hover:bg-white/5",
            ].join(" ")}
        >
            <Icon size={13} />
            <span>{label}</span>
            {typeof count === "number" ? (
                <span className="rounded bg-black/10 px-1.5 py-0.5 text-[9px] dark:bg-white/10">
                    {count}
                </span>
            ) : null}
        </button>
    );
}

function FilterField({ label, children }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-500">{label}</span>
            {children}
        </label>
    );
}

function SlaCard({ label, value, tone }) {
    return (
        <div className={`rounded-md border px-2.5 py-1.5 ${tone}`}>
            <p className="text-[9px] font-bold uppercase opacity-80">{label}</p>
            <p className="mt-0.5 text-sm font-bold">{value}</p>
        </div>
    );
}

function TaskCard({
    task,
    selected,
    onSelect,
    assigneeLabel,
    onEdit,
    canEdit,
    canDelete,
    onDelete,
    draggable = false,
    onDragStart,
    onDragEnd,
    t,
    locale,
    emptyDateLabel,
}) {
    const statusMeta = getStatusMeta(task.status, t);
    const priorityMeta = getPriorityMeta(task.priority, t);

    return (
        <article
            onClick={onSelect}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={[
                "cursor-pointer rounded-lg border p-3 transition",
                task.isOverdue ? "border-red-500/30 bg-red-500/5" : "",
                selected
                    ? "border-cyan-400/30 bg-cyan-400/10"
                    : "border-[var(--color-border)] bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface)]",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${statusMeta.tone}`}>
                            {statusMeta.label}
                        </span>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${priorityMeta.tone}`}>
                            {priorityMeta.label}
                        </span>
                    </div>
                    <h3 className="ui-text-primary mt-2 truncate text-sm font-bold">{task.title}</h3>
                    <p className="ui-text-muted mt-1 line-clamp-2 break-words text-xs leading-5">
                        {task.description || t("common.none")}
                    </p>
                </div>

                <div className="shrink-0 text-right">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-bold ${task.risk.tone}`}>
                        {task.risk.score}
                    </span>
                    <p className="ui-text-faint mt-1 text-[10px] font-bold uppercase">
                        {task.risk.label}
                    </p>
                </div>
            </div>

            <div className="ui-text-faint mt-2 flex flex-wrap gap-1.5 text-[10px]">
                <span>{assigneeLabel}</span>
                <span>·</span>
                <span className={task.isOverdue ? "font-bold text-red-300" : task.isDueSoon ? "text-amber-200" : ""}>
                    {task.dueDate
                        ? formatDate(task.dueDate, locale, emptyDateLabel)
                        : emptyDateLabel}
                    {task.isOverdue ? ` · ${t("features.sla.overdue")}` : task.isDueSoon ? ` · ${t("features.sla.dueSoon")}` : ""}
                </span>
                <span>·</span>
                <span>{getSubmissionLabel(task.submissionStatus, t)}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="ui-text-faint text-xs">
                    {formatDateTime(task.updatedAt, locale, emptyDateLabel)}
                </p>
                <div className="flex flex-wrap gap-2">
                    {canEdit ? (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onEdit();
                            }}
                            className="ui-btn-ghost px-2 py-1.5 text-xs"
                        >
                            {t("common.edit")}
                        </button>
                    ) : null}
                    {canDelete ? (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete();
                            }}
                            className="focus-ring rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/15"
                        >
                            {t("common.delete")}
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function SubmissionHistoryItem({ item, versionNumber, locale, t, emptyDateLabel, onPreview }) {
    return (
        <article className="rounded-lg border px-2.5 py-2" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="ui-text-faint text-[10px] font-bold uppercase">
                        {t("features.versions.version", { n: versionNumber })}
                    </p>
                    <p className="ui-text-primary truncate text-xs font-semibold">
                        {item.originalName || t("tasks.submissionTitle")}
                    </p>
                    <p className="ui-text-faint mt-0.5 text-[10px]">
                        {item.submittedByName || item.submittedByEmail} ·{" "}
                        {formatDateTime(item.submittedAt, locale, emptyDateLabel)}
                    </p>
                </div>
                <span className="shrink-0 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-200">
                    {getSubmissionLabel(item.status, t)}
                </span>
            </div>
            {item.note ? <p className="ui-text-muted mt-1 line-clamp-2 text-xs">{item.note}</p> : null}
            {item.reviewNote ? (
                <p className="mt-1 line-clamp-2 text-xs text-amber-200">{item.reviewNote}</p>
            ) : null}
            {onPreview ? (
                <button
                    type="button"
                    onClick={onPreview}
                    className="focus-ring mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300"
                >
                    <Eye size={12} />
                    {t("features.preview.title")}
                </button>
            ) : null}
        </article>
    );
}

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="ui-card p-2.5">
            <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                    <Icon size={15} />
                </span>
                <div className="min-w-0">
                    <p className="ui-text-faint text-[10px] font-bold uppercase">{label}</p>
                    <p className="ui-text-primary mt-0.5 truncate text-sm font-semibold">{value}</p>
                </div>
            </div>
        </div>
    );
}

function getSubmissionLabel(status, t) {
    const normalized = status || "NONE";
    const key = `status.submission.${normalized}`;
    const translated = t(key);
    return translated !== key ? translated : t("status.submission.NONE");
}

function buildAcceptTypes(fileTypes) {
    const source = fileTypes || ALLOWED_FILE_TYPES;
    return source
        .split(",")
        .map((item) => item.trim().replace(/^\./, ""))
        .filter(Boolean)
        .map((item) => `.${item}`)
        .join(",");
}

function taskToDraft(task, defaultAssigneeEmail) {
    return {
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        assigneeEmail: task.assigneeEmail || defaultAssigneeEmail,
        dueDate: task.dueDate || "",
        requiredFileTypes: task.requiredFileTypes || "pdf, docx, pptx",
    };
}

function buildAssigneeOptions(members, currentUserEmail, ownerEmail, t) {
    const seen = new Set();
    const options = [];
    const fallbackEmail = currentUserEmail || ownerEmail || "";
    const pushOption = (email, label, hint) => {
        if (!email) return;
        const key = normalizeEmail(email);
        if (seen.has(key)) return;
        seen.add(key);
        options.push({ value: email, label, hint });
    };

    const currentMember = members.find(
        (member) => normalizeEmail(member.memberEmail) === normalizeEmail(fallbackEmail)
    );

    pushOption(
        fallbackEmail,
        currentMember?.memberName || t("workspaceRole.user"),
        fallbackEmail ? t("tasks.fieldAssignee") : t("common.selectPlaceholder")
    );

    members.forEach((member) => {
        pushOption(member.memberEmail, member.memberName || member.memberEmail, member.role || "Member");
    });

    return options;
}

function buildAssigneeFilterOptions(members, currentUserEmail, ownerEmail, t) {
    const options = getAssigneeFilterOptions(t, members);

    buildAssigneeOptions(members, currentUserEmail, ownerEmail, t).forEach((option) => {
        if (!options.some((item) => normalizeEmail(item.value) === normalizeEmail(option.value))) {
            options.push(option);
        }
    });

    return options;
}

function resolveAssigneeLabel(email, members, currentUserEmail, t) {
    if (!email) {
        return t("tasks.unassigned");
    }

    const member = members.find((item) => normalizeEmail(item.memberEmail) === normalizeEmail(email));
    if (member) {
        return member.memberName || member.memberEmail;
    }

    if (normalizeEmail(email) === normalizeEmail(currentUserEmail)) {
        return t("workspaceRole.user");
    }

    return email;
}

function getTaskProgress(status) {
    switch ((status || "TODO").toUpperCase()) {
        case "DONE":
            return 100;
        case "REVIEW":
            return 78;
        case "IN_PROGRESS":
            return 45;
        default:
            return 0;
    }
}

function getStatusMeta(status, t) {
    const label = getStatusLabel(status, t);
    switch ((status || "TODO").toUpperCase()) {
        case "DONE":
            return {
                label,
                tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
            };
        case "REVIEW":
            return {
                label,
                tone: "border-amber-400/20 bg-amber-400/10 text-amber-200",
            };
        case "IN_PROGRESS":
            return {
                label,
                tone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
            };
        default:
            return {
                label,
                tone: "border-white/10 bg-white/5 text-slate-200",
            };
    }
}

function getPriorityMeta(priority, t) {
    const label = getPriorityLabel(priority, t);
    switch ((priority || "MEDIUM").toUpperCase()) {
        case "HIGH":
            return {
                label,
                tone: "border-red-500/20 bg-red-500/10 text-red-200",
            };
        case "LOW":
            return {
                label,
                tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
            };
        default:
            return {
                label,
                tone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
            };
    }
}

function getRiskAnalysis(task, currentUserEmail, defaultAssigneeEmail, t) {
    const reasons = [];
    let score = 0;
    const status = (task.status || "TODO").toUpperCase();
    const priority = (task.priority || "MEDIUM").toUpperCase();
    const assigneeEmail = task.assigneeEmail || defaultAssigneeEmail || currentUserEmail || "";
    const dueDate = parseLocalDate(task.dueDate);
    const now = startOfDay(new Date());
    const progress = getTaskProgress(status);

    if (!assigneeEmail) {
        score += 25;
        reasons.push(t("tasks.riskReason.noAssignee"));
    }

    if (!task.description || task.description.trim().length < 24) {
        score += 12;
        reasons.push(t("tasks.riskReason.shortDescription"));
    }

    if (priority === "HIGH") {
        score += 20;
        reasons.push(t("tasks.riskReason.highPriority"));
    } else if (priority === "MEDIUM") {
        score += 8;
    }

    if (status === "TODO") {
        score += 10;
        reasons.push(t("tasks.riskReason.statusTodo"));
    } else if (status === "IN_PROGRESS") {
        score += 6;
        reasons.push(t("tasks.riskReason.statusInProgress"));
    } else if (status === "REVIEW") {
        score += 14;
        reasons.push(t("tasks.riskReason.statusReview"));
    }

    if (dueDate) {
        const days = diffInDays(dueDate, now);
        if (days < 0) {
            score += 35;
            reasons.push(t("tasks.riskReason.overdueDays", { days: Math.abs(days) }));
        } else if (days === 0) {
            score += 18;
            reasons.push(t("tasks.riskReason.dueToday"));
        } else if (days <= 2) {
            score += 22;
            reasons.push(t("tasks.riskReason.dueInDays", { days }));
        } else if (days <= 5) {
            score += 12;
            reasons.push(t("tasks.riskReason.deadlineSoon"));
        }
    } else {
        score += 15;
        reasons.push(t("tasks.riskReason.noDeadline"));
    }

    if (progress < 35 && priority === "HIGH") {
        score += 8;
        reasons.push(t("tasks.riskReason.lowProgressHighPriority"));
    }

    if (status === "DONE") {
        score = Math.max(0, score - 55);
        reasons.push(t("tasks.riskReason.completed"));
    }

    score = Math.max(0, Math.min(100, score));
    const band = score >= 75 ? "HIGH" : score >= 45 ? "MEDIUM" : score >= 20 ? "LOW" : "STABLE";

    return {
        score,
        band,
        label:
            band === "HIGH"
                ? t("tasks.riskHigh")
                : band === "MEDIUM"
                    ? t("tasks.riskMedium")
                    : band === "LOW"
                        ? t("tasks.riskLow")
                        : t("tasks.riskStable"),
        tone:
            band === "HIGH"
                ? "text-red-200 border-red-500/20 bg-red-500/10"
                : band === "MEDIUM"
                    ? "text-amber-200 border-amber-400/20 bg-amber-400/10"
                    : band === "LOW"
                        ? "text-cyan-200 border-cyan-400/20 bg-cyan-400/10"
                        : "text-emerald-200 border-emerald-400/20 bg-emerald-400/10",
        reasons: reasons.slice(0, 4),
    };
}

function sortTasks(tasks) {
    return [...tasks].sort((left, right) => {
        if (right.risk.score !== left.risk.score) {
            return right.risk.score - left.risk.score;
        }

        if (left.isOverdue !== right.isOverdue) {
            return left.isOverdue ? -1 : 1;
        }

        const leftDue = left.dueDateDate ? left.dueDateDate.getTime() : Number.POSITIVE_INFINITY;
        const rightDue = right.dueDateDate ? right.dueDateDate.getTime() : Number.POSITIVE_INFINITY;
        if (leftDue !== rightDue) {
            return leftDue - rightDue;
        }

        const leftUpdated = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
        const rightUpdated = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
        return rightUpdated - leftUpdated;
    });
}

function parseLocalDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

function diffInDays(left, right) {
    const leftDay = startOfDay(left);
    const rightDay = startOfDay(right);
    return Math.round((leftDay.getTime() - rightDay.getTime()) / 86400000);
}

function normalizeEmail(value) {
    return (value || "").trim().toLowerCase();
}

export default ProjectTask;
