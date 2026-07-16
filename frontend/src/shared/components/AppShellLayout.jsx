/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useI18n } from "../i18n/useI18n";

function AppShellLayout({
    sidebar,
    children,
    topbarTitle = "",
    topbarEyebrow = "",
    topbarActions = null,
    contentClassName = "",
}) {
    const { t } = useI18n();
    const reduceMotion = useReducedMotion();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileOpen) {
            return undefined;
        }
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen]);

    return (
        <div className="ui-shell-root">
            <motion.div
                aria-hidden="true"
                className="ui-shell-motion-bg"
                animate={reduceMotion ? undefined : { backgroundPosition: ["0% 30%", "100% 70%", "0% 30%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            {mobileOpen ? (
                <button
                    type="button"
                    className="ui-shell-backdrop"
                    aria-label={t("shell.menuClose")}
                    onClick={() => setMobileOpen(false)}
                />
            ) : null}

            <aside
                id="app-shell-sidebar"
                className={[
                    "ui-shell-aside",
                    mobileOpen ? "ui-shell-aside--open" : "",
                ].join(" ")}
            >
                {sidebar}
            </aside>

            <main className="ui-shell-main">
                <div className="ui-shell-topbar">
                    <button
                        type="button"
                        className="ui-shell-menu-btn focus-ring"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-expanded={mobileOpen}
                        aria-controls="app-shell-sidebar"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        <span className="sr-only">
                            {mobileOpen ? t("shell.menuClose") : t("shell.menuOpen")}
                        </span>
                    </button>
                    <div className="min-w-0 flex-1">
                        {topbarEyebrow ? (
                            <p className="ui-text-faint truncate text-[10px] font-bold uppercase tracking-wider">
                                {topbarEyebrow}
                            </p>
                        ) : null}
                        {topbarTitle ? (
                            <p className="ui-text-primary truncate text-sm font-bold">{topbarTitle}</p>
                        ) : null}
                    </div>
                    {topbarActions ? (
                        <div className="flex shrink-0 items-center gap-2">{topbarActions}</div>
                    ) : null}
                </div>

                <div className={`ui-shell-content ${contentClassName}`.trim()}>{children}</div>
            </main>
        </div>
    );
}

export default AppShellLayout;
