import { Link } from "react-router-dom";
import { Home, Sparkles } from "lucide-react";
import { useI18n } from "../../shared/i18n/useI18n";
import AuthHeroVisual from "./AuthHeroVisual";
import AuthQuoteCarousel from "./AuthQuoteCarousel";

function AuthShell({ variant = "login", children, footer }) {
    const { t } = useI18n();
    const prefix = `auth.${variant}`;

    const highlights = [
        { label: t(`${prefix}.h1`), value: t(`${prefix}.h1v`) },
        { label: t(`${prefix}.h2`), value: t(`${prefix}.h2v`) },
        { label: t(`${prefix}.h3`), value: t(`${prefix}.h3v`) },
    ];

    return (
        <div className="auth-page animate-fade-up w-full px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
            <div className="auth-page-bg" aria-hidden />
            <div className="auth-page-grid relative mx-auto grid w-full min-h-0 gap-4 sm:gap-6 lg:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:items-center lg:gap-8">
                <section className="auth-form-column ui-stagger order-1">
                    <div className="glass-panel auth-form-panel lift rounded-2xl border p-4 sm:p-5 lg:p-6">
                        <div>
                            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-500 dark:text-cyan-300">
                                <Sparkles size={12} className="animate-soft-glow" />
                                {t("auth.shell.brand")}
                            </p>
                            <h1 className="ui-text-primary mt-2 text-xl font-bold leading-snug sm:text-2xl">
                                {t(`${prefix}.title`)}
                            </h1>
                            <p className="ui-text-muted mt-2 text-xs leading-relaxed sm:text-sm">
                                {t(`${prefix}.subtitle`)}
                            </p>
                        </div>

                        <Link to="/" className="ui-btn-ghost focus-ring mt-3 inline-flex px-2.5 py-1.5 text-[11px]">
                            <Home size={12} />
                            {t("auth.shell.backHome")}
                        </Link>

                        <div className="mt-5">{children}</div>

                        {footer ? (
                            <div className="auth-form-footer mt-4 border-t pt-4">{footer}</div>
                        ) : null}
                    </div>

                    <div className="auth-quote-panel glass-panel mt-3 rounded-xl border p-4 lg:hidden">
                        <AuthQuoteCarousel />
                    </div>
                </section>

                <aside className="auth-hero-column ui-stagger order-2 flex flex-col gap-4">
                    <div className="hidden lg:block">
                        <AuthHeroVisual variant={variant} />
                    </div>

                    <div className="auth-hero-copy glass-panel rounded-2xl border p-4 sm:p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-500 dark:text-cyan-300">
                            {t(`${prefix}.eyebrow`)}
                        </p>
                        <h2 className="ui-text-primary mt-2 text-lg font-bold leading-snug sm:text-xl">
                            {t(`${prefix}.heroTitle`)}
                        </h2>
                        <p className="ui-text-muted mt-2 text-xs leading-relaxed sm:text-sm">
                            {t(`${prefix}.heroText`)}
                        </p>

                        <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                            {highlights.map((item) => (
                                <div key={item.label} className="auth-highlight-chip ui-card text-center">
                                    <p className="ui-text-faint text-[8px] font-bold uppercase">{item.label}</p>
                                    <p className="ui-text-primary mt-0.5 text-[10px] font-semibold sm:text-[11px]">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="auth-quote-panel glass-panel hidden rounded-xl border p-4 lg:block">
                        <AuthQuoteCarousel />
                    </div>

                    <div className="lg:hidden">
                        <AuthHeroVisual variant={variant} />
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default AuthShell;
