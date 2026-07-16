import { ArrowRight, LogIn, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, NavLink, Outlet } from "react-router-dom";
import AnimatedButton from "../components/animation/AnimatedButton";
import { useI18n } from "../i18n/useI18n";

function PublicLayout() {
    const { t } = useI18n();
    const reduceMotion = useReducedMotion();

    const links = [
        { to: "/", labelKey: "public.nav.home" },
        { to: "/pricing", labelKey: "public.nav.pricing" },
        { to: "/about", labelKey: "public.nav.about" },
        { to: "/contact", labelKey: "public.nav.contact" },
    ];

    return (
        <div className="relative flex min-h-[100dvh] w-full max-w-[100vw] flex-col overflow-x-clip bg-[#020617] text-white">
            <motion.div
                aria-hidden="true"
                className="public-motion-bg"
                animate={reduceMotion ? undefined : { backgroundPosition: ["0% 0%", "100% 45%", "0% 0%"] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/88 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
                    <Link to="/" className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-sm font-black text-black shadow-lg shadow-cyan-500/20">
                            C
                        </span>
                        <div className="min-w-0">
                            <p className="text-lg font-black leading-none">WeDo</p>
                            <p className="hidden truncate text-[11px] font-black tracking-[0.2em] text-slate-500 sm:block">
                                {t("public.brand.tagline")}
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {links.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                className={({ isActive }) =>
                                    [
                                        "rounded-lg px-3 py-2 text-sm font-bold transition",
                                        isActive
                                            ? "bg-white/10 text-white"
                                            : "text-slate-300 hover:bg-white/5 hover:text-white",
                                    ].join(" ")
                                }
                            >
                                {t(item.labelKey)}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex shrink-0 items-center gap-2">
                        <AnimatedButton
                            as={Link}
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-slate-200 hover:bg-white/10"
                        >
                            <LogIn size={16} />
                            <span className="hidden sm:inline">{t("public.auth.login")}</span>
                        </AnimatedButton>
                        <AnimatedButton
                            as={Link}
                            to="/register"
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-black text-black hover:bg-cyan-300"
                        >
                            <Sparkles size={16} />
                            <span className="hidden sm:inline">{t("public.auth.register")}</span>
                        </AnimatedButton>
                    </div>
                </div>

                <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden">
                    {links.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) =>
                                [
                                    "shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                                ].join(" ")
                            }
                        >
                            {t(item.labelKey)}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
                <Outlet />
            </main>

            <footer className="relative z-10 mt-auto border-t border-white/10 bg-[#020617]/80">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 text-sm text-slate-400 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-10">
                    <div>
                        <p className="font-bold text-slate-200">WeDo</p>
                        <p className="mt-1">{t("public.footer.tagline")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <AnimatedButton as={Link} to="/pricing" className="ui-btn-ghost px-3 py-2 text-white">
                            {t("public.nav.pricing")}
                        </AnimatedButton>
                        <AnimatedButton as={Link} to="/contact" className="ui-btn-ghost px-3 py-2 text-white">
                            {t("public.nav.contact")}
                            <ArrowRight size={14} />
                        </AnimatedButton>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PublicLayout;
