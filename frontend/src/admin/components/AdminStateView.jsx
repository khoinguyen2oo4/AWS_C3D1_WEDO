import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import { useI18n } from "../../shared/i18n/useI18n";

function AdminLoadingState({ title, description }) {
    const { t } = useI18n();
    const resolvedTitle = title ?? t("state.loadingTitle");
    const resolvedDescription = description ?? t("state.loadingDesc");

    return (
        <div className="animate-fade-up glass-panel lift rounded-[28px] p-6">
            <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300">
                    <LoaderCircle size={18} className="animate-spin" />
                </span>
                <div>
                    <p className="text-xs font-black tracking-[0.2em] text-fuchsia-200">
                        {resolvedTitle.toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{resolvedDescription}</p>
                </div>
            </div>
        </div>
    );
}

function AdminErrorState({ title, message, status, onRetry }) {
    const { t } = useI18n();
    const resolvedTitle = title ?? t("state.errorTitle");
    const resolvedMessage = message ?? t("state.loadingDesc");
    const statusLabel = status
        ? t("state.errorWithStatus", { status })
        : t("state.errorConnection");

    return (
        <div className="animate-fade-up glass-panel lift rounded-[28px] p-6">
            <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-300">
                    <AlertTriangle size={18} />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-black tracking-[0.2em] text-red-200">
                        {statusLabel.toUpperCase()}
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white">{resolvedTitle}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{resolvedMessage}</p>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
                {onRetry ? (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="lift focus-ring inline-flex items-center gap-2 rounded-2xl bg-fuchsia-400 px-5 py-3 text-sm font-black text-black hover:bg-fuchsia-300"
                    >
                        <RefreshCw size={16} />
                        {t("common.retry")}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export { AdminErrorState, AdminLoadingState };
