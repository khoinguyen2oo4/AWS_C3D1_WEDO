const CHART_COLORS = {
    todo: "#94a3b8",
    progress: "#22d3ee",
    review: "#f59e0b",
    done: "#10b981",
    danger: "#ef4444",
    violet: "#8b5cf6",
};

function DonutChart({ items, centerValue, centerLabel, emptyLabel }) {
    const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
    const radius = 43;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="flex min-w-0 flex-col items-center gap-2 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 112 112" role="img" aria-label={centerLabel} className="h-full w-full">
                    <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        fill="none"
                        stroke="var(--color-border-subtle)"
                        strokeWidth="13"
                    />
                    {total > 0
                        ? items
                              .filter((item) => Number(item.value || 0) > 0)
                              .map((item, index) => {
                                  const length = (Number(item.value) / total) * circumference;
                                  const dashOffset = -offset;
                                  offset += length;
                                  return (
                                      <circle
                                          key={item.label}
                                          cx="56"
                                          cy="56"
                                          r={radius}
                                          fill="none"
                                          stroke={item.color}
                                          strokeWidth="13"
                                          strokeLinecap="round"
                                          strokeDasharray={`${Math.max(0, length - 2)} ${circumference}`}
                                          strokeDashoffset={dashOffset}
                                          className="ui-chart-segment"
                                          style={{ animationDelay: `${index * 0.08}s` }}
                                          transform="rotate(-90 56 56)"
                                      />
                                  );
                              })
                        : null}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="ui-text-primary text-base font-bold tabular-nums">{centerValue}</p>
                    <p className="ui-text-faint max-w-16 truncate text-[9px] font-bold uppercase">
                        {centerLabel}
                    </p>
                </div>
            </div>

            <div className="w-full min-w-0 space-y-2">
                {total > 0 ? (
                    items.map((item) => (
                        <LegendRow
                            key={item.label}
                            color={item.color}
                            label={item.label}
                            value={item.value}
                            detail={`${Math.round((Number(item.value || 0) * 1000) / total) / 10}%`}
                        />
                    ))
                ) : (
                    <p className="ui-text-muted text-sm">{emptyLabel}</p>
                )}
            </div>
        </div>
    );
}

function BarChart({ items, emptyLabel, unit = "" }) {
    const max = Math.max(...items.map((item) => Number(item.value || 0)), 0);

    if (max === 0) {
        return <p className="ui-text-muted text-sm">{emptyLabel}</p>;
    }

    return (
        <div className="min-w-0">
            <div className="grid min-h-32 grid-cols-[repeat(auto-fit,minmax(52px,1fr))] items-end gap-1.5">
                {items.map((item, index) => {
                    const height = Math.max(8, Math.round((Number(item.value || 0) / max) * 100));
                    return (
                        <div key={item.label} className="flex min-w-0 flex-col items-center gap-1.5">
                            <div className="flex h-24 w-full max-w-14 items-end justify-center rounded-md border px-1.5 py-1.5" style={{ borderColor: "var(--color-border-subtle)" }}>
                                <div
                                    className="ui-chart-bar w-full rounded-md"
                                    style={{
                                        height: `${height}%`,
                                        background: item.color,
                                        animationDelay: `${index * 0.07}s`,
                                    }}
                                />
                            </div>
                            <div className="w-full min-w-0 text-center">
                                <p className="ui-text-primary truncate text-xs font-bold">{item.value}{unit}</p>
                                <p className="ui-text-faint truncate text-[10px]">{item.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StackedBar({ items, emptyLabel }) {
    const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);

    if (total === 0) {
        return <p className="ui-text-muted text-sm">{emptyLabel}</p>;
    }

    return (
        <div className="space-y-2">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                {items
                    .filter((item) => Number(item.value || 0) > 0)
                    .map((item, index) => (
                        <span
                            key={item.label}
                            className="ui-chart-stack h-full"
                            style={{
                                width: `${Math.max(3, (Number(item.value || 0) / total) * 100)}%`,
                                background: item.color,
                                animationDelay: `${index * 0.06}s`,
                            }}
                        />
                    ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => (
                    <LegendRow
                        key={item.label}
                        color={item.color}
                        label={item.label}
                        value={item.value}
                        detail={`${Math.round((Number(item.value || 0) * 1000) / total) / 10}%`}
                    />
                ))}
            </div>
        </div>
    );
}

function LegendRow({ color, label, value, detail }) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border px-2 py-1.5" style={{ borderColor: "var(--color-border-subtle)" }}>
            <div className="flex min-w-0 items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                <span className="ui-text-muted truncate text-[11px] font-semibold">{label}</span>
            </div>
            <span className="ui-text-primary shrink-0 text-[11px] font-bold tabular-nums">
                {value}
                {detail ? <span className="ui-text-faint ml-1 font-medium">{detail}</span> : null}
            </span>
        </div>
    );
}

export { BarChart, CHART_COLORS, DonutChart, StackedBar };
