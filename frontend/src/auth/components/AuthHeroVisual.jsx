import { CheckCircle2, MessageSquare, FolderKanban } from "lucide-react";
import { useI18n } from "../../shared/i18n/useI18n";

function AuthHeroVisual({ variant = "login" }) {
    const { t } = useI18n();
    const accent = variant === "register" ? "fuchsia" : "cyan";

    return (
        <div className="auth-hero-visual relative mx-auto w-full max-w-[260px] sm:max-w-xs">
            <div className="auth-orb auth-orb-a animate-float-slow" aria-hidden />
            <div className="auth-orb auth-orb-b animate-float-slow-reverse" aria-hidden />

            <div className="auth-hero-frame animate-drift relative overflow-hidden rounded-2xl border p-3 sm:p-4">
                <svg
                    viewBox="0 0 400 320"
                    className="w-full"
                    role="img"
                    aria-label={t("auth.hero.ariaLabel")}
                >
                    <defs>
                        <linearGradient id="authGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
                        </linearGradient>
                        <linearGradient id="authGradB" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.25" />
                        </linearGradient>
                    </defs>
                    <rect width="400" height="320" fill="url(#authGradB)" rx="24" />
                    <rect x="48" y="72" width="200" height="128" rx="16" fill="rgba(15,23,42,0.55)" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" />
                    <rect x="220" y="140" width="132" height="88" rx="14" fill="rgba(15,23,42,0.65)" stroke="rgba(217,70,239,0.3)" strokeWidth="1.5" />
                </svg>

                <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniChip icon={FolderKanban} label={t("public.home.features.project.title")} accent={accent} />
                    <MiniChip icon={CheckSquare} label={t("public.home.features.task.title")} accent={accent} />
                    <MiniChip icon={MessageSquare} label={t("public.home.features.chat.title")} accent={accent} />
                </div>
            </div>
        </div>
    );
}

function CheckSquare(props) {
    return <CheckCircle2 {...props} />;
}

function MiniChip({ icon: Icon, label, accent }) {
    const tone =
        accent === "fuchsia"
            ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200"
            : "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200";

    return (
        <div
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[10px] font-bold uppercase tracking-wide ${tone}`}
        >
            <Icon size={12} />
            <span className="truncate">{label}</span>
        </div>
    );
}

export default AuthHeroVisual;
