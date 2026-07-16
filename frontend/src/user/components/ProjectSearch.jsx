/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { searchProject } from "../../services/projectService";
import { useI18n } from "../../shared/i18n/useI18n";

const TYPE_LABELS = {
    TASK: "features.search.task",
    FILE: "features.search.file",
    CHAT: "features.search.chat",
    MEMBER: "features.search.member",
};

function ProjectSearch({ projectId }) {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const trimmed = query.trim();

    useEffect(() => {
        if (trimmed.length < 2) {
            setResults([]);
            return undefined;
        }

        const timer = window.setTimeout(async () => {
            setLoading(true);
            try {
                const data = await searchProject(projectId, trimmed);
                setResults(data);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => window.clearTimeout(timer);
    }, [projectId, trimmed]);

    const grouped = useMemo(() => results, [results]);

    const go = (item) => {
        navigate(`/project/${projectId}${item.path || ""}`);
        setOpen(false);
        setQuery("");
    };

    return (
        <div className="relative w-full max-w-md">
            <span className="ui-field">
                <Search size={14} className="ui-text-faint shrink-0" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => trimmed.length >= 2 && setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 150)}
                    className="ui-input min-w-0 flex-1"
                    placeholder={t("features.search.placeholder")}
                />
            </span>

            {open && trimmed.length >= 2 ? (
                <div
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-lg border p-2 shadow-xl"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                    {loading ? (
                        <p className="px-2 py-2 text-xs opacity-70">{t("common.loading")}</p>
                    ) : grouped.length > 0 ? (
                        grouped.map((item) => (
                            <button
                                key={`${item.type}-${item.id}`}
                                type="button"
                                onMouseDown={() => go(item)}
                                className="focus-ring flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-[var(--color-surface-muted)]"
                            >
                                <span className="shrink-0 rounded bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-cyan-300">
                                    {t(TYPE_LABELS[item.type] || "common.search")}
                                </span>
                                <span className="min-w-0">
                                    <p className="truncate text-sm font-semibold">{item.title}</p>
                                    {item.subtitle ? (
                                        <p className="truncate text-[11px] opacity-70">{item.subtitle}</p>
                                    ) : null}
                                </span>
                            </button>
                        ))
                    ) : (
                        <p className="px-2 py-2 text-xs opacity-70">{t("features.search.empty")}</p>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default ProjectSearch;
