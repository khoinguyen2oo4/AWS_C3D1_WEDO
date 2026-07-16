import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useI18n } from "../../i18n/useI18n";
import ToastContext from "./ToastContext";

const DEFAULT_DURATION = 4200;
const MAX_TOASTS = 5;

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: TriangleAlert,
    info: Info,
};

const TONES = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
    error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
};

function createToastId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ToastProvider({ children }) {
    const { t } = useI18n();
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const show = useCallback(
        (input) => {
            const payload = typeof input === "string" ? { message: input } : input;
            const type = payload.type || "info";
            const toast = {
                id: createToastId(),
                type,
                title: payload.title || t(`toast.${type}`),
                message: payload.message || "",
                duration: payload.duration ?? DEFAULT_DURATION,
            };

            setToasts((current) => [toast, ...current].slice(0, MAX_TOASTS));
            return toast.id;
        },
        [t]
    );

    const value = useMemo(
        () => ({
            show,
            success: (message, options = {}) => show({ ...options, message, type: "success" }),
            error: (message, options = {}) => show({ ...options, message, type: "error" }),
            warning: (message, options = {}) => show({ ...options, message, type: "warning" }),
            info: (message, options = {}) => show({ ...options, message, type: "info" }),
            dismiss,
        }),
        [dismiss, show]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} closeLabel={t("toast.close")} />
        </ToastContext.Provider>
    );
}

function ToastViewport({ toasts, onDismiss, closeLabel }) {
    return (
        <ol
            aria-live="polite"
            aria-relevant="additions"
            className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(100%-2rem,22rem)] flex-col gap-2 sm:bottom-5 sm:right-5"
        >
            <AnimatePresence initial={false}>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} closeLabel={closeLabel} />
                ))}
            </AnimatePresence>
        </ol>
    );
}

function ToastItem({ toast, onDismiss, closeLabel }) {
    const reduceMotion = useReducedMotion();
    const Icon = ICONS[toast.type] || Info;
    const tone = TONES[toast.type] || TONES.info;

    useEffect(() => {
        if (toast.duration === Infinity) {
            return undefined;
        }
        const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
        return () => window.clearTimeout(timer);
    }, [onDismiss, toast.duration, toast.id]);

    return (
        <motion.li
            role={toast.type === "error" ? "alert" : "status"}
            layout
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl shadow-black/15"
        >
            <div className="flex items-start gap-3 p-3">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
                    <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="ui-text-primary text-sm font-bold">{toast.title}</p>
                    {toast.message ? (
                        <p className="ui-text-muted mt-0.5 line-clamp-3 text-xs leading-5">{toast.message}</p>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="focus-ring rounded-md p-1 ui-text-muted hover:bg-[var(--color-surface-muted)]"
                    aria-label={closeLabel}
                    title={closeLabel}
                >
                    <X size={15} />
                </button>
            </div>
        </motion.li>
    );
}

export default ToastProvider;
