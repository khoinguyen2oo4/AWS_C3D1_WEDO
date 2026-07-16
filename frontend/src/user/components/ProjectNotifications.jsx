import { Bell } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../../shared/i18n/useI18n";
import useProjectNotifications from "./useProjectNotifications";

function ProjectNotifications({ projectId }) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const items = useProjectNotifications(projectId, t);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="ui-btn-ghost relative px-2 py-2"
                aria-label={t("features.notifications.title")}
            >
                <Bell size={16} />
                {items.length > 0 ? (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan-400" />
                ) : null}
            </button>

            {open ? (
                <div
                    className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-lg border p-2 shadow-xl"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                >
                    <p className="ui-text-faint px-2 py-1 text-[10px] font-bold uppercase">
                        {t("features.notifications.title")}
                    </p>
                    {items.length > 0 ? (
                        <div className="max-h-64 space-y-1 overflow-y-auto">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-md px-2 py-2 text-xs"
                                    style={{ background: "var(--color-surface-muted)" }}
                                >
                                    {item.message}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="px-2 py-2 text-xs opacity-70">{t("features.notifications.empty")}</p>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default ProjectNotifications;
