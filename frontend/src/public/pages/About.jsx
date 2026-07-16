import { ArrowRight, BarChart3, LockKeyhole, ServerCog, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { AutomationStrip, PublicCard, PublicHero, PublicImagePanel, SectionHeading } from "../components/PublicSections";
import { LANDING_IMAGES } from "../data/landingImages";
import { useI18n } from "../../shared/i18n/useI18n";

const PRINCIPLE_KEYS = [
    { icon: Workflow, key: "focus" },
    { icon: ServerCog, key: "clarity" },
    { icon: LockKeyhole, key: "speed" },
    { icon: BarChart3, key: "control" },
];

function About() {
    const { t } = useI18n();
    const timeline = asArray(t("public.about.timeline"));
    const automation = asArray(t("public.about.automation"));

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 text-white">
            <PublicHero
                eyebrow={t("public.about.eyebrow")}
                title={t("public.about.title")}
                subtitle={t("public.about.subtitle")}
                primary={{ to: "/register", label: t("public.about.cta"), icon: ArrowRight }}
                secondary={{ to: "/pricing", label: t("public.nav.pricing"), icon: BarChart3 }}
            >
                <div className="max-w-xl rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <p className="line-clamp-2 text-sm font-black text-white">{t("public.about.missionTitle")}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-cyan-50/80">{t("public.about.missionText")}</p>
                </div>
            </PublicHero>

            <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                <PublicImagePanel
                    src={LANDING_IMAGES.teamFlow}
                    alt="Team following one project flow"
                    label="Flow"
                    className="h-36 lg:h-40"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                    {PRINCIPLE_KEYS.map((point) => {
                        const Icon = point.icon;
                        return (
                            <PublicCard
                                key={point.key}
                                icon={Icon}
                                title={t(`public.about.principles.${point.key}.title`)}
                                text={t(`public.about.principles.${point.key}.text`)}
                            />
                        );
                    })}
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                <SectionHeading
                    eyebrow={t("public.about.eyebrow")}
                    title={t("public.about.timelineTitle")}
                />
                <div className="space-y-3">
                    {timeline.map((item, index) => (
                        <article key={item.title} className="glass-panel rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-black text-cyan-200">
                                    {index + 1}
                                </span>
                                <div className="min-w-0">
                                    <h3 className="line-clamp-2 text-sm font-black text-white">{item.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{item.text}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <SectionHeading
                    eyebrow={t("public.home.sections.automationEyebrow")}
                    title={t("public.about.missionTitle")}
                />
                <AutomationStrip items={automation} />
            </section>

            <section className="glass-panel rounded-lg p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200">
                            <ShieldCheck size={18} />
                        </span>
                        <div>
                            <h2 className="line-clamp-2 text-lg font-black text-white">{t("public.about.principles.control.title")}</h2>
                        </div>
                    </div>
                    <Link to="/contact" className="ui-btn-ghost shrink-0 px-4 py-2.5 text-white">
                        {t("public.nav.contact")}
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

export default About;
