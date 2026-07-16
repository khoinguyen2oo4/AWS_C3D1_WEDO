function WorkspacePageShell({ eyebrow, title, description, actions, stats = [], children }) {
    return (
        <div className="ui-page ui-stagger animate-fade-up">
            {(eyebrow || title || description || actions) && (
                <header className="ui-page-header">
                    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                            {eyebrow ? (
                                <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                                    {eyebrow}
                                </p>
                            ) : null}
                            {title ? (
                                <h1 className="ui-text-primary mt-0.5 text-base font-bold">
                                    {title}
                                </h1>
                            ) : null}
                            {description ? (
                                <p className="ui-page-desc">{description}</p>
                            ) : null}
                        </div>
                        {actions ? <div className="ui-page-actions shrink-0">{actions}</div> : null}
                    </div>
                </header>
            )}

            {stats.length > 0 ? (
                <section className="ui-stat-grid">
                    {stats.map((item, index) => (
                        <StatCard
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

function StatCard({ label, value, note, tone = "", style }) {
    return (
        <div className="ui-stat-card animate-fade-up" style={style}>
            <p className="ui-text-faint text-[9px] font-bold uppercase tracking-wider">{label}</p>
            <p className={`ui-text-primary mt-0.5 text-base font-bold tabular-nums ${tone}`}>{value}</p>
            {note ? <p className="ui-text-muted mt-0.5 truncate text-[11px]">{note}</p> : null}
        </div>
    );
}

function WorkspacePanel({ title, subtitle, children, className = "", scroll = false }) {
    return (
        <section className={`ui-panel flex flex-col ${className}`}>
            <div className="ui-panel-head">
                <div className="min-w-0">
                    {subtitle ? (
                        <p className="ui-text-faint text-[9px] font-bold uppercase tracking-wider">
                            {subtitle}
                        </p>
                    ) : null}
                    <h2 className="ui-text-primary truncate text-xs font-bold">{title}</h2>
                </div>
            </div>
            <div className={scroll ? "ui-scroll-panel min-h-0 flex-1" : "min-w-0"}>{children}</div>
        </section>
    );
}

export { WorkspacePanel, StatCard };
export default WorkspacePageShell;
