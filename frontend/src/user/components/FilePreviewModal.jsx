/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { init as initPptxPreview } from "pptx-preview";
import { previewProjectTaskSubmission } from "../../services/projectService";
import { useI18n } from "../../shared/i18n/useI18n";

function getPreviewKind(fileName = "") {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "image";
    if (extension === "pdf") return "pdf";
    if (["ppt", "pptx"].includes(extension)) return "pptx";
    if (extension === "docx") return "docx";
    return "unsupported";
}

function FilePreviewModal({ projectId, taskId, submissionId, fileName, onClose, onDownload }) {
    const { t } = useI18n();
    const [state, setState] = useState({ loading: true, error: null, blob: null });
    const pptxRef = useRef(null);
    const kind = useMemo(() => getPreviewKind(fileName), [fileName]);
    const objectUrl = useMemo(() => (state.blob ? URL.createObjectURL(state.blob) : null), [state.blob]);

    useEffect(() => {
        let active = true;
        setState({ loading: true, error: null, blob: null });

        previewProjectTaskSubmission(projectId, taskId, submissionId)
            .then((response) => {
                if (!active) return;
                setState({ loading: false, error: null, blob: response.data });
            })
            .catch((error) => {
                if (!active) return;
                setState({ loading: false, error, blob: null });
            });

        return () => {
            active = false;
        };
    }, [projectId, taskId, submissionId]);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    useEffect(() => {
        if (kind !== "pptx" || !state.blob || !pptxRef.current) {
            return undefined;
        }

        const container = pptxRef.current;
        container.innerHTML = "";
        const viewer = initPptxPreview(container, {
            width: Math.min(container.clientWidth || 900, 900),
            height: 520,
        });

        state.blob.arrayBuffer().then((buffer) => viewer.preview(buffer)).catch(() => {});

        return () => {
            container.innerHTML = "";
        };
    }, [kind, state.blob]);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div
                className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border shadow-2xl"
                style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                }}
            >
                <div
                    className="flex items-center justify-between gap-3 border-b px-4 py-3"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                            {t("features.preview.title")}
                        </p>
                        <p className="truncate text-sm font-semibold">{fileName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onDownload ? (
                            <button type="button" onClick={onDownload} className="ui-btn-ghost text-xs">
                                <Download size={14} />
                                {t("features.preview.download")}
                            </button>
                        ) : null}
                        <button type="button" onClick={onClose} className="ui-btn-ghost px-2 py-2">
                            <X size={16} />
                            <span className="sr-only">{t("features.preview.close")}</span>
                        </button>
                    </div>
                </div>

                <div
                    className="min-h-[320px] flex-1 overflow-auto p-4"
                    style={{ background: "var(--color-surface-muted)" }}
                >
                    {state.loading ? (
                        <p className="text-sm opacity-70">{t("features.preview.loading")}</p>
                    ) : state.error ? (
                        <p className="text-sm text-red-300">{t("features.preview.unsupported")}</p>
                    ) : kind === "image" && objectUrl ? (
                        <img
                            src={objectUrl}
                            alt={fileName}
                            className="mx-auto max-h-[70vh] max-w-full rounded-lg object-contain"
                        />
                    ) : kind === "pdf" && objectUrl ? (
                        <iframe
                            title={fileName}
                            src={objectUrl}
                            sandbox=""
                            className="h-[70vh] w-full rounded-lg border"
                            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                        />
                    ) : kind === "docx" && objectUrl ? (
                        <iframe
                            title={fileName}
                            src={objectUrl}
                            sandbox=""
                            className="h-[70vh] w-full rounded-lg border bg-white"
                            style={{ borderColor: "var(--color-border)" }}
                        />
                    ) : kind === "pptx" ? (
                        <div ref={pptxRef} className="mx-auto min-h-[520px] w-full overflow-auto rounded-lg" />
                    ) : (
                        <p className="text-sm opacity-70">{t("features.preview.unsupported")}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FilePreviewModal;
