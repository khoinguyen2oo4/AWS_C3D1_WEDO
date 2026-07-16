import { X } from "lucide-react";
import { useI18n } from "../../shared/i18n/useI18n";
import { formatDateTime } from "./projectHelpers";

function VersionCompareModal({ left, right, locale, onClose, onPreview }) {
    const { t } = useI18n();

    if (!left || !right) return null;

    const fields = [
        { key: "originalName", label: "File" },
        { key: "submittedByName", label: t("common.member") },
        { key: "submittedAt", label: t("project.files.statSubmitted"), format: (v) => formatDateTime(v, locale) },
        { key: "status", label: t("tasks.filterStatus") },
        { key: "note", label: t("tasks.reviewNote") },
        { key: "size", label: "Size", format: (v) => (v ? `${Math.round(v / 1024)} KB` : "-") },
    ];

    return (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div
                className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl border p-4 shadow-2xl"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold">{t("features.versions.compare")}</h3>
                    <button type="button" onClick={onClose} className="ui-btn-ghost px-2 py-2">
                        <X size={16} />
                    </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    {[left, right].map((item, index) => (
                        <div key={item.id} className="ui-card p-3">
                            <p className="ui-text-faint text-[10px] font-bold uppercase">
                                {index === 0 ? t("features.versions.left") : t("features.versions.right")}
                            </p>
                            <p className="ui-text-primary mt-1 truncate text-sm font-semibold">
                                {item.originalName}
                            </p>
                            <button
                                type="button"
                                onClick={() => onPreview?.(item)}
                                className="focus-ring mt-2 text-xs font-semibold text-cyan-300"
                            >
                                {t("features.preview.title")}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 space-y-2">
                    {fields.map((field) => {
                        const leftValue = field.format ? field.format(left[field.key]) : left[field.key] || "-";
                        const rightValue = field.format ? field.format(right[field.key]) : right[field.key] || "-";
                        const changed = String(leftValue) !== String(rightValue);
                        return (
                            <div
                                key={field.key}
                                className={[
                                    "grid gap-2 rounded-lg border p-2 text-xs md:grid-cols-[120px_1fr_1fr]",
                                    changed ? "border-amber-400/30 bg-amber-400/5" : "",
                                ].join(" ")}
                                style={{ borderColor: changed ? undefined : "var(--color-border)" }}
                            >
                                <p className="ui-text-faint font-bold uppercase">{field.label}</p>
                                <p className="ui-text-primary break-words">{leftValue}</p>
                                <p className="ui-text-primary break-words">{rightValue}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default VersionCompareModal;
