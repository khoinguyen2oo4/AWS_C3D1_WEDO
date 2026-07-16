/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Eye, FileArchive, RefreshCw, Search } from "lucide-react";
import { downloadProjectTaskSubmission, getProjectTasks } from "../../services/projectService";
import FilePreviewModal from "../components/FilePreviewModal";
import { useI18n } from "../../shared/i18n/useI18n";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";
import { formatDateTime } from "../components/projectHelpers";

function ProjectFiles() {
    const { t, locale } = useI18n();
    const { project } = useOutletContext();
    const [state, setState] = useState({ loading: true, error: null, tasks: [] });
    const [query, setQuery] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);
    const [previewTarget, setPreviewTarget] = useState(null);
    const emptyDate = t("common.none");

    const load = async () => {
        setState((current) => ({ ...current, loading: true, error: null }));
        try {
            const tasks = await getProjectTasks(project.id);
            setState({ loading: false, error: null, tasks });
        } catch (error) {
            setState({ loading: false, error, tasks: [] });
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const submittedTasks = useMemo(
        () => state.tasks.filter((task) => task.submissionOriginalName),
        [state.tasks]
    );

    const filteredTasks = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return submittedTasks;

        return submittedTasks.filter((task) =>
            [
                task.title,
                task.assigneeName,
                task.assigneeEmail,
                task.submissionOriginalName,
                task.submissionStatus,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(keyword)
        );
    }, [query, submittedTasks]);

    const download = async (task) => {
        setDownloadingId(task.id);
        try {
            const response = await downloadProjectTaskSubmission(project.id, task.id);
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = task.submissionOriginalName;
            link.click();
            window.URL.revokeObjectURL(url);
        } finally {
            setDownloadingId(null);
        }
    };

    if (state.loading) {
        return (
            <WorkspaceLoadingState
                title={t("project.files.loadingTitle")}
                description={t("project.files.loadingDesc")}
            />
        );
    }

    if (state.error) {
        return (
            <WorkspaceErrorState
                title={t("project.files.errorTitle")}
                message={t("project.files.errorDesc")}
                status={state.error?.response?.status}
                onRetry={load}
            />
        );
    }

    return (
        <div className="ui-page">
            <section className="ui-stat-grid md:grid-cols-3">
                <Card label={t("project.files.title")} value={submittedTasks.length} />
                <Card
                    label={t("project.files.statApproved")}
                    value={submittedTasks.filter((task) => task.submissionStatus === "APPROVED").length}
                />
                <Card
                    label={t("project.files.statPending")}
                    value={
                        submittedTasks.filter((task) => task.submissionStatus === "PENDING_REVIEW")
                            .length
                    }
                />
            </section>

            <WorkspacePanel
                title={t("project.files.title")}
                subtitle={`${filteredTasks.length}/${submittedTasks.length}`}
                className="project-files-panel"
                scroll
            >
                <div className="mb-3 flex flex-wrap gap-2">
                    <span className="ui-field min-w-[200px] flex-1">
                        <Search size={14} className="ui-text-faint shrink-0" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="ui-input min-w-0 flex-1"
                            placeholder={t("project.files.searchPlaceholder")}
                        />
                    </span>
                    <button type="button" onClick={load} className="ui-btn-ghost focus-ring">
                        <RefreshCw size={14} />
                        {t("common.refresh")}
                    </button>
                </div>

                <div className="space-y-2">
                    {filteredTasks.length > 0 ? (
                        <div className="grid gap-2 lg:grid-cols-2">
                            {filteredTasks.map((task) => (
                                <article
                                    key={task.id}
                                    className="ui-card p-3"
                                >
                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200">
                                                <FileArchive size={16} />
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="ui-text-primary truncate text-sm font-bold">
                                                    {task.submissionOriginalName}
                                                </h3>
                                                <p className="ui-text-muted mt-1 truncate text-xs">
                                                    {task.title}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-100">
                                            {getSubmissionLabel(task.submissionStatus, t)}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        <Info
                                            label={t("common.member")}
                                            value={task.submittedByName || task.submittedByEmail}
                                        />
                                        <Info
                                            label={t("project.files.statSubmitted")}
                                            value={formatDateTime(task.submittedAt, locale, emptyDate)}
                                        />
                                    </div>

                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewTarget({
                                                    taskId: task.id,
                                                    fileName: task.submissionOriginalName,
                                                })
                                            }
                                            className="ui-btn-ghost w-full"
                                        >
                                            <Eye size={15} />
                                            {t("features.preview.title")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => download(task)}
                                            disabled={downloadingId === task.id}
                                            className="ui-btn-primary w-full disabled:opacity-60"
                                        >
                                            <Download size={15} />
                                            {downloadingId === task.id
                                                ? t("common.loading")
                                                : t("project.files.download")}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="ui-card text-sm leading-6">
                            {t("project.files.empty")}
                        </div>
                    )}
                </div>
            </WorkspacePanel>
            {previewTarget ? (
                <FilePreviewModal
                    projectId={project.id}
                    taskId={previewTarget.taskId}
                    fileName={previewTarget.fileName}
                    onClose={() => setPreviewTarget(null)}
                    onDownload={() => {
                        const task = state.tasks.find((item) => item.id === previewTarget.taskId);
                        if (task) download(task);
                    }}
                />
            ) : null}
        </div>
    );
}

function Card({ label, value }) {
    return (
        <div className="ui-stat-card">
            <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
            <p className="ui-text-primary text-sm font-bold">{value}</p>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="ui-card p-2.5">
            <p className="ui-text-faint text-[10px] font-bold uppercase">{label}</p>
            <p className="ui-text-primary mt-0.5 truncate text-sm font-semibold">{value || "-"}</p>
        </div>
    );
}

function getSubmissionLabel(status, t) {
    const normalized = status || "NONE";
    const key = `status.submission.${normalized}`;
    const translated = t(key);
    return translated !== key ? translated : t("status.submission.NONE");
}

export default ProjectFiles;
