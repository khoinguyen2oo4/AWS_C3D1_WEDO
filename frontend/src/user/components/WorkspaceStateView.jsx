import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import { useI18n } from "../../shared/i18n/useI18n";

function WorkspaceLoadingState({ title, description }) {
    const { t } = useI18n();
    const resolvedTitle = title ?? t("state.loadingTitle");
    const resolvedDescription = description ?? t("state.loadingDesc");

    return (
        <div className="animate-fade-up glass-panel lift rounded-lg p-4">
            <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                    <LoaderCircle size={16} className="animate-spin" />
                </span>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                        {resolvedTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-300">{resolvedDescription}</p>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-3 w-2/3 rounded-full bg-white/5" />
                <div className="h-3 w-full rounded-full bg-white/5" />
                <div className="h-3 w-5/6 rounded-full bg-white/5" />
            </div>
        </div>
    );
}

function WorkspaceErrorState({ title, message, status, onRetry }) {
    const { t } = useI18n();
    const resolvedTitle = title ?? t("state.errorTitle");
    const resolvedMessage = message ?? t("state.loadingDesc");
    const statusLabel = status
        ? t("state.errorWithStatus", { status })
        : t("state.errorConnection");

    return (
        <div className="animate-fade-up glass-panel lift rounded-lg p-4">
            <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">
                    <AlertTriangle size={16} />
                </span>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-200">
                        {statusLabel}
                    </p>
                    <h2 className="mt-1 text-base font-bold text-white">{resolvedTitle}</h2>
                    <p className="mt-1.5 text-xs leading-5 text-slate-300">{resolvedMessage}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {onRetry ? (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="lift focus-ring inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-black hover:bg-cyan-300"
                    >
                        <RefreshCw size={14} />
                        {t("common.retry")}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export { WorkspaceErrorState, WorkspaceLoadingState };
