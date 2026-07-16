import { ArrowRight, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicHero, PublicImagePanel, SectionHeading } from "../components/PublicSections";
import { LANDING_IMAGES } from "../data/landingImages";
import { useI18n } from "../../shared/i18n/useI18n";

const PLAN_KEYS = ["free", "pro", "premium"];

function Pricing() {
    const { t } = useI18n();
    const [cycle, setCycle] = useState("monthly");
    const comparison = asArray(t("public.pricing.comparison"));
    const faq = asArray(t("public.pricing.faq"));

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 text-white">
            <PublicHero
                eyebrow={t("public.pricing.eyebrow")}
                title={t("public.pricing.title")}
                subtitle={t("public.pricing.subtitle")}
                primary={{ to: "/register", label: t("public.pricing.cta"), icon: Sparkles }}
                secondary={{ to: "/contact", label: t("public.nav.contact"), icon: ArrowRight }}
            >
                <div className="flex flex-wrap items-center gap-3">
                    <BillingToggle cycle={cycle} setCycle={setCycle} t={t} />
                    <PublicImagePanel
                        src={LANDING_IMAGES.onlineWorkflow}
                        alt="Online workflow and reports"
                        label="Plan"
                        className="h-20 w-36 sm:h-24 sm:w-44"
                    />
                </div>
            </PublicHero>

            <section className="grid gap-4 lg:grid-cols-3">
                {PLAN_KEYS.map((planKey) => {
                    const featured = planKey === "pro";
                    const to = planKey === "premium" ? "/contact" : "/register";
                    const features = asArray(t(`public.pricing.plans.${planKey}.features`));
                    const price =
                        cycle === "yearly"
                            ? t(`public.pricing.plans.${planKey}.yearlyPrice`)
                            : t(`public.pricing.plans.${planKey}.price`);

                    return (
                        <article
                            key={planKey}
                            className={[
                                "glass-panel lift flex rounded-lg p-5",
                                featured ? "border-cyan-400/35 bg-cyan-400/10" : "",
                            ].join(" ")}
                        >
                            <div className="flex min-h-[340px] w-full min-w-0 flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-black text-white">
                                            {t(`public.pricing.plans.${planKey}.name`)}
                                        </h2>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                                            {t(`public.pricing.plans.${planKey}.desc`)}
                                        </p>
                                    </div>
                                    {featured ? (
                                        <span className="rounded-lg bg-cyan-400 px-2 py-1 text-[10px] font-black uppercase text-black">
                                            Pro
                                        </span>
                                    ) : null}
                                </div>
                                <div className="mt-5 flex items-end gap-2">
                                    <span className="text-3xl font-black text-white">{price}</span>
                                    {t(`public.pricing.plans.${planKey}.period`) && cycle === "monthly" ? (
                                        <span className="pb-1 text-xs text-slate-400">
                                            {t(`public.pricing.plans.${planKey}.period`)}
                                        </span>
                                    ) : null}
                                </div>

                                <ul className="mt-5 space-y-2">
                                    {features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-cyan-300" />
                                            <span className="line-clamp-2">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to={to}
                                    className={[
                                        "focus-ring mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black transition",
                                        featured
                                            ? "bg-cyan-400 text-black hover:bg-cyan-300"
                                            : "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
                                    ].join(" ")}
                                >
                                    {t(`public.pricing.plans.${planKey}.cta`)}
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </section>

            <section className="glass-panel rounded-lg p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <SectionHeading title={t("public.pricing.compareTitle")} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="text-xs uppercase text-slate-500">
                            <tr>
                                <th className="border-b border-white/10 px-3 py-3">{t("public.pricing.featureLabel")}</th>
                                {PLAN_KEYS.map((planKey) => (
                                    <th key={planKey} className="border-b border-white/10 px-3 py-3">
                                        {t(`public.pricing.plans.${planKey}.name`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.map((row) => (
                                <tr key={row.label} className="border-b border-white/5">
                                    <td className="px-3 py-3 font-bold text-white"><span className="line-clamp-2">{row.label}</span></td>
                                    <td className="px-3 py-3 text-slate-300"><span className="line-clamp-2">{row.free}</span></td>
                                    <td className="px-3 py-3 text-cyan-200"><span className="line-clamp-2">{row.pro}</span></td>
                                    <td className="px-3 py-3 text-slate-300"><span className="line-clamp-2">{row.premium}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <SectionHeading title={t("public.pricing.faqTitle")} text={t("public.pricing.subtitle")} />
                <div className="grid gap-3">
                    {faq.map((item) => (
                        <article key={item.q} className="glass-panel rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <HelpCircle size={17} className="mt-0.5 shrink-0 text-cyan-300" />
                                <div className="min-w-0">
                                    <h3 className="line-clamp-2 text-sm font-black text-white">{item.q}</h3>
                                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-400">{item.a}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

        </div>
    );
}

function BillingToggle({ cycle, setCycle, t }) {
    return (
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
            {[
                { value: "monthly", label: t("public.pricing.monthly") },
                { value: "yearly", label: t("public.pricing.yearly") },
            ].map((item) => (
                <button
                    key={item.value}
                    type="button"
                    onClick={() => setCycle(item.value)}
                    className={[
                        "focus-ring rounded-md px-3 py-2 text-sm font-black transition",
                        cycle === item.value ? "bg-cyan-400 text-black" : "text-slate-300 hover:bg-white/10",
                    ].join(" ")}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

export default Pricing;
