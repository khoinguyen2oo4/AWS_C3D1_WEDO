import { Activity, CheckCircle2, Clock3, MessageSquareText, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedButton from "../../shared/components/animation/AnimatedButton";
import AnimatedCard from "../../shared/components/animation/AnimatedCard";
import AnimatedText from "../../shared/components/animation/AnimatedText";
import FloatingImage from "../../shared/components/animation/FloatingImage";

function PublicHero({ eyebrow, title, accent, subtitle, primary, secondary, children }) {
    return (
        <section className="public-hero overflow-hidden rounded-lg border border-white/10 bg-[#07111f] text-white shadow-2xl shadow-black/20">
            <div className="public-grid-bg" />
            <ProductBackdrop />
            <div className="relative z-10 max-w-3xl px-5 py-10 sm:px-7 lg:max-w-[58%] lg:px-10 lg:py-14 xl:max-w-[54%]">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">{eyebrow}</p>
                <AnimatedText
                    as="h1"
                    lines={accent ? [title, accent] : [title]}
                    accentIndexes={accent ? [1] : []}
                    accentClassName="text-cyan-200"
                    className="mt-4 max-w-2xl text-3xl font-black leading-tight md:text-4xl xl:text-5xl"
                />
                <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-7 text-slate-300">{subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                    {primary ? (
                        <AnimatedButton as={Link} to={primary.to} className="ui-btn-primary px-4 py-2.5">
                            {primary.icon ? <primary.icon size={16} /> : null}
                            {primary.label}
                        </AnimatedButton>
                    ) : null}
                    {secondary ? (
                        <AnimatedButton as={Link} to={secondary.to} className="ui-btn-ghost px-4 py-2.5 text-white">
                            {secondary.icon ? <secondary.icon size={16} /> : null}
                            {secondary.label}
                        </AnimatedButton>
                    ) : null}
                </div>
                {children ? <div className="mt-7">{children}</div> : null}
            </div>
        </section>
    );
}

function ProductBackdrop() {
    return (
        <div className="pointer-events-none absolute inset-y-6 right-5 hidden w-[38%] min-w-[300px] max-w-[430px] opacity-95 lg:block">
            <div className="public-product-screen h-full overflow-hidden rounded-lg border border-white/10 bg-slate-950/88 p-3 shadow-2xl shadow-cyan-950/30 xl:p-4">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">PROJECT ROOM</p>
                        <p className="mt-1 text-sm font-black text-white">Launch sprint</p>
                    </div>
                    <span className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-black text-emerald-200">
                        78%
                    </span>
                </div>
                <div className="grid h-[calc(100%-54px)] grid-cols-[1fr_0.8fr] gap-3">
                    <div className="space-y-2">
                        <MockTask title="Review landing pages" tone="cyan" width="82%" />
                        <MockTask title="Owner task flow" tone="amber" width="64%" />
                        <MockTask title="Member workload" tone="emerald" width="92%" />
                        <MockTask title="Submission review" tone="violet" width="52%" />
                    </div>
                    <div className="space-y-3">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                <FloatingImage as="span" intensity={2}>
                                    <Activity size={14} className="text-cyan-200" />
                                </FloatingImage>
                                <span className="truncate">Live signals</span>
                            </div>
                            <div className="mt-3 space-y-2">
                                <MetricLine label="Done" value="18" />
                                <MetricLine label="Review" value="4" />
                                <MetricLine label="Risk" value="2" />
                            </div>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-200">
                                <FloatingImage as="span" intensity={2} delay={0.2}>
                                    <MessageSquareText size={14} className="shrink-0 text-cyan-200" />
                                </FloatingImage>
                                <span className="truncate">Team chat</span>
                            </div>
                            <div className="space-y-2 text-[10px] text-slate-400">
                                <p className="rounded bg-white/5 px-2 py-1.5">Deadline reminder sent</p>
                                <p className="rounded bg-cyan-400/10 px-2 py-1.5 text-cyan-100">File approved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MockTask({ title, tone, width }) {
    const tones = {
        cyan: "bg-cyan-400",
        amber: "bg-amber-400",
        emerald: "bg-emerald-400",
        violet: "bg-violet-400",
    };
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-bold text-white">{title}</p>
                <CheckCircle2 size={14} className="shrink-0 text-slate-500" />
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div className={`public-progress h-1.5 rounded-full ${tones[tone]}`} style={{ width }} />
            </div>
        </div>
    );
}

function MetricLine({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="font-black text-white">{value}</span>
        </div>
    );
}

function SectionHeading({ eyebrow, title, text, textKey, textClassName = "" }) {
    return (
        <div className="max-w-2xl">
            {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p> : null}
            <AnimatedText
                as="h2"
                lines={[title]}
                className="mt-2 text-2xl font-black text-white md:text-3xl"
            />
            {text ? (
                <p
                    key={textKey || text}
                    className={`animate-fade-up mt-2 line-clamp-3 text-sm leading-7 text-slate-400 ${textClassName}`}
                >
                    {text}
                </p>
            ) : null}
        </div>
    );
}

function PublicCard({ icon: Icon, title, text, children, className = "" }) {
    return (
        <AnimatedCard as="article" className={`glass-panel lift min-w-0 rounded-lg p-4 ${className}`}>
            {Icon ? (
                <FloatingImage className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200">
                    <Icon size={18} />
                </FloatingImage>
            ) : null}
            <h3 className="line-clamp-2 text-base font-black text-white">{title}</h3>
            {text ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{text}</p> : null}
            {children}
        </AnimatedCard>
    );
}

function PublicImagePanel({ src, alt, label, className = "", imageClassName = "" }) {
    return (
        <AnimatedCard as="figure" className={`public-image-panel lift relative min-h-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 ${className}`}>
            <FloatingImage className="h-full w-full" intensity={3}>
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover ${imageClassName}`}
                />
            </FloatingImage>
            {label ? (
                <figcaption className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-lg border border-white/10 bg-slate-950/78 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 backdrop-blur">
                    {label}
                </figcaption>
            ) : null}
        </AnimatedCard>
    );
}

function AutomationStrip({ items }) {
    return (
        <div className="grid gap-2 md:grid-cols-3">
            {items.map((item, index) => (
                <AnimatedCard key={item.label} className="public-automation min-w-0 rounded-lg border border-white/10 bg-white/5 p-3" delay={index * 0.06}>
                    <div className="flex min-w-0 items-center gap-2">
                        <FloatingImage as="span" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200" intensity={2} delay={index * 0.2}>
                            {index === 0 ? <Clock3 size={14} /> : index === 1 ? <ShieldCheck size={14} /> : <UsersRound size={14} />}
                        </FloatingImage>
                        <p className="min-w-0 truncate text-sm font-black text-white">{item.label}</p>
                    </div>
                    {item.text ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{item.text}</p> : null}
                </AnimatedCard>
            ))}
        </div>
    );
}

export { AutomationStrip, PublicCard, PublicHero, PublicImagePanel, SectionHeading };
