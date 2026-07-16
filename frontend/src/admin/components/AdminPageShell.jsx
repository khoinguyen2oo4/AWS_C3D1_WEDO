import AnimatedCard from "../../shared/components/animation/AnimatedCard";
import AnimatedText from "../../shared/components/animation/AnimatedText";

function AdminPageShell({ eyebrow, title, description, actions, stats = [], children }) {
    const hasHeader = Boolean(eyebrow || title || description || actions);

    return (
        <div className="ui-page ui-stagger animate-fade-up">
            {hasHeader ? (
                <header className="ui-page-header border-fuchsia-500/10">
                    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                            {eyebrow ? (
                                <p className="ui-text-accent text-[10px] font-bold uppercase tracking-wider">
                                    {eyebrow}
                                </p>
                            ) : null}
                            {title ? (
                                <AnimatedText
                                    as="h1"
                                    lines={[title]}
                                    className="ui-text-primary mt-1 text-lg font-bold md:text-xl"
                                />
                            ) : null}
                            {description ? (
                                <p className="ui-page-desc">{description}</p>
                            ) : null}
                        </div>
                        {actions ? <div className="ui-page-actions shrink-0">{actions}</div> : null}
                    </div>
                </header>
            ) : null}

            {stats.length > 0 ? (
                <section className="ui-stat-grid">
                    {stats.map((item, index) => (
                        <AdminStatCard
                            key={item.label}
                            style={{ animationDelay: `${0.08 + index * 0.06}s` }}
                            label={item.label}
                            value={item.value}
                            note={item.note}
                            tone={item.tone}
                        />
                    ))}
                </section>
            ) : null}

            {children}
        </div>
    );
}

function AdminStatCard({ label, value, note, tone = "", style }) {
    return (
        <AnimatedCard className="ui-stat-card animate-fade-up" style={style}>
            <p className="ui-text-faint text-[10px] font-bold uppercase tracking-wider">{label}</p>
            <p className={`ui-text-primary mt-0.5 text-lg font-bold tabular-nums ${tone}`}>{value}</p>
            {note ? <p className="ui-text-muted mt-0.5 truncate text-xs">{note}</p> : null}
        </AnimatedCard>
    );
}

function AdminPanel({ title, subtitle, children, className = "", scroll = false }) {
    return (
        <AnimatedCard as="section" className={`ui-panel flex flex-col ${className}`}>
            <div className="ui-panel-head">
                <div className="min-w-0">
                    {subtitle ? (
                        <p className="ui-text-faint text-[10px] font-bold uppercase tracking-wider">
                            {subtitle}
                        </p>
                    ) : null}
                    <h2 className="ui-text-primary truncate text-sm font-bold">{title}</h2>
                </div>
            </div>
            <div className={scroll ? "ui-scroll-panel min-h-0 flex-1" : "min-w-0"}>{children}</div>
        </AnimatedCard>
    );
}

export { AdminPanel, AdminStatCard };
export default AdminPageShell;
