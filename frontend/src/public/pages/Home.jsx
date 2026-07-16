import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    FolderKanban,
    LogIn,
    MessageSquareText,
    Sparkles,
    UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AutomationStrip, PublicCard, PublicHero, PublicImagePanel, SectionHeading } from "../components/PublicSections";
import { LANDING_IMAGES } from "../data/landingImages";
import { useI18n } from "../../shared/i18n/useI18n";

const FEATURE_KEYS = [
    { icon: FolderKanban, key: "project" },
    { icon: CheckCircle2, key: "task" },
    { icon: MessageSquareText, key: "chat" },
    { icon: BarChart3, key: "report" },
];

function Home() {
    const { t } = useI18n();
    const [featureHintIndex, setFeatureHintIndex] = useState(0);
    const steps = asArray(t("public.home.steps"));
    const stats = asArray(t("public.home.stats"));
    const automation = asArray(t("public.home.automation"));
    const useCases = asArray(t("public.home.useCases"));
    const featureHints = asArray(t("public.home.sections.featureHints"));
    const featureHintCount = featureHints.length;
    const featureHintText =
        featureHintCount > 0
            ? featureHints[featureHintIndex % featureHintCount]
            : t("public.home.sections.featuresText");

    useEffect(() => {
        if (featureHintCount < 2) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setFeatureHintIndex((current) => (current + 1) % featureHintCount);
        }, 3000);

        return () => window.clearInterval(timer);
    }, [featureHintCount]);

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 text-white">
            <PublicHero
                eyebrow={t("public.home.eyebrow")}
                title={t("public.home.title")}
                accent={t("public.home.titleAccent")}
                subtitle={t("public.home.subtitle")}
                primary={{ to: "/register", label: t("public.home.ctaStart"), icon: Sparkles }}
                secondary={{ to: "/login", label: t("public.home.ctaLogin"), icon: LogIn }}
            >
                <div className="grid max-w-xl gap-2 sm:grid-cols-3">
                    {stats.map((item) => (
                        <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <p className="text-lg font-black text-white">{item.value}</p>
                            <p className="line-clamp-2 text-[11px] leading-4 text-slate-400">{item.label}</p>
                        </div>
                    ))}
                </div>
            </PublicHero>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
                <div className="space-y-4">
                    <SectionHeading
                        eyebrow={t("public.home.sections.featuresEyebrow")}
                        title={t("public.home.sections.featuresTitle")}
                        text={featureHintText}
                        textKey={featureHintText}
                        textClassName="min-h-7"
                    />
                    <PublicImagePanel
                        src={LANDING_IMAGES.businessReview}
                        alt="Team reviewing project charts"
                        label="Review"
                        className="h-28 max-w-sm lg:h-32"
                    />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {FEATURE_KEYS.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <PublicCard
                                key={feature.key}
                                icon={Icon}
                                title={t(`public.home.features.${feature.key}.title`)}
                                text={t(`public.home.features.${feature.key}.text`)}
                            />
                        );
                    })}
                </div>
            </section>

            <section className="glass-panel rounded-lg p-5">
                <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
                    <SectionHeading
                        eyebrow={t("public.home.flowTitle")}
                        title={t("public.home.flowSubtitle")}
                    />
                    <div className="grid gap-2 md:grid-cols-4">
                        {steps.map((step, index) => (
                            <div key={step} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                                <span className="text-xs font-black text-cyan-300">{String(index + 1).padStart(2, "0")}</span>
                                <p className="mt-1 line-clamp-2 min-h-10 text-sm font-black text-white">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <SectionHeading
                    eyebrow={t("public.home.sections.automationEyebrow")}
                    title={t("public.home.sections.automationTitle")}
                />
                <AutomationStrip items={automation} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                    <SectionHeading
                        eyebrow={t("public.home.sections.useCasesEyebrow")}
                        title={t("public.home.sections.useCasesTitle")}
                    />
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {useCases.map((item) => (
                            <PublicCard key={item.title} title={item.title} text={item.text} />
                        ))}
                    </div>
                </div>
                <div className="glass-panel rounded-lg p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                        {t("public.home.flowTitle")}
                    </p>
                    <div className="mt-4 space-y-3">
                        <EntryLink
                            to="/login"
                            icon={LogIn}
                            title={t("public.home.entryLogin")}
                            text={t("public.home.entryLoginDesc")}
                        />
                        <EntryLink
                            to="/register"
                            icon={UserPlus}
                            title={t("public.home.entryRegister")}
                            text={t("public.home.entryRegisterDesc")}
                            active
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function EntryLink({ to, icon: Icon, title, text, active = false }) {
    return (
        <Link
            to={to}
            className={[
                "focus-ring flex items-center justify-between rounded-lg border px-3 py-3 text-left transition",
                active
                    ? "border-cyan-400/25 bg-cyan-400/10 hover:bg-cyan-400/15"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
            ].join(" ")}
        >
            <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-cyan-200">
                    <Icon size={16} />
                </span>
                <span className="min-w-0">
                    <strong className="block truncate text-sm font-black text-white">{title}</strong>
                    <span className="block truncate text-xs text-slate-400">{text}</span>
                </span>
            </span>
            <ArrowRight size={15} className="shrink-0 text-slate-500" />
        </Link>
    );
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

export default Home;
