import { useI18n } from "../../shared/i18n/useI18n";

function AuthErrorBanner({ status, message, connection = false }) {
    const { t } = useI18n();
    const title = connection
        ? t("auth.errorBanner.connectionTitle")
        : status
          ? t("auth.errorBanner.titleWithStatus", { status })
          : t("auth.errorBanner.title");

    return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-200">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-red-800 dark:text-red-100">{message}</p>
        </div>
    );
}

export default AuthErrorBanner;
