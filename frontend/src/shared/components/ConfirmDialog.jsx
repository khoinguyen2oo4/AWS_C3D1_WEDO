import { useI18n } from "../i18n/useI18n";

function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    danger = true,
    onConfirm,
    onCancel,
}) {
    const { t } = useI18n();
    const resolvedConfirm = confirmLabel ?? t("common.confirm");
    const resolvedCancel = cancelLabel ?? t("common.cancel");

    if (!open) {
        return null;
    }

    return (
        <div
            role="presentation"
            onClick={onCancel}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 px-4 py-8 backdrop-blur-md"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-description"
                onClick={(event) => event.stopPropagation()}
                className="animate-fade-up ui-panel mx-3 w-full max-w-lg p-3 sm:mx-4"
            >
                <div className="ui-card p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {t("dialog.confirmEyebrow").toUpperCase()}
                    </p>
                    <h2 id="confirm-title" className="ui-text-primary mt-2 text-lg font-bold">
                        {title}
                    </h2>
                    <p id="confirm-description" className="ui-text-muted mt-2 text-sm leading-6">
                        {description}
                    </p>
                </div>

                <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="ui-btn-ghost"
                    >
                        {resolvedCancel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={[
                            "focus-ring inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-bold transition",
                            danger
                                ? "bg-red-400 text-black hover:bg-red-300"
                                : "bg-cyan-400 text-black hover:bg-cyan-300",
                        ].join(" ")}
                    >
                        {resolvedConfirm}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
