import { ArrowRight, Home, Lock, ServerCrash } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/useI18n";

function StatusPage({
    code,
    title,
    description,
    actionLabel,
    actionTo = "/",
    secondaryLabel = null,
    secondaryTo = null,
}) {
    const { t } = useI18n();
    const resolvedActionLabel = actionLabel ?? t("errors.page.defaultAction");
    const Icon = code === "403" ? Lock : code === "500" ? ServerCrash : Home;

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <div className="ui-panel w-full max-w-lg text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                    <Icon size={22} />
                </div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-cyan-300">{code}</p>
                <h1 className="ui-text-primary mt-2 text-2xl font-bold">{title}</h1>
                <p className="ui-text-muted mx-auto mt-3 max-w-md text-sm leading-6">
                    {description}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Link
                        to={actionTo}
                        className="ui-btn-primary"
                    >
                        {resolvedActionLabel}
                        <ArrowRight size={16} />
                    </Link>
                    {secondaryLabel && secondaryTo ? (
                        <Link
                            to={secondaryTo}
                            className="ui-btn-ghost"
                        >
                            {secondaryLabel}
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default StatusPage;
