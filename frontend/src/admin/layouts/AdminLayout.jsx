import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowLeft,
    BarChart3,
    CreditCard,
    Database,
    FolderKanban,
    LayoutDashboard,
    LogOut,
    ReceiptText,
    UsersRound,
} from "lucide-react";
import AppShellLayout from "../../shared/components/AppShellLayout";
import { SidebarLink, SidebarSection } from "../../shared/components/AppSidebar";
import AnimatedButton from "../../shared/components/animation/AnimatedButton";
import { useI18n } from "../../shared/i18n/useI18n";

const NAV_GROUPS = [
    {
        titleKey: "admin.nav.ops",
        items: [
            { to: "/admin/dashboard", labelKey: "admin.nav.dashboard", icon: LayoutDashboard },
            { to: "/admin/projects", labelKey: "admin.nav.projects", icon: FolderKanban },
            { to: "/admin/users", labelKey: "admin.nav.users", icon: UsersRound },
        ],
    },
    {
        titleKey: "admin.nav.billing",
        items: [
            { to: "/admin/subscriptions", labelKey: "admin.nav.subscriptions", icon: CreditCard },
            { to: "/admin/payments", labelKey: "admin.nav.payments", icon: ReceiptText },
        ],
    },
    {
        titleKey: "admin.nav.monitor",
        items: [
            { to: "/admin/reports", labelKey: "admin.nav.reports", icon: BarChart3 },
            { to: "/admin/activity", labelKey: "admin.nav.activity", icon: Activity },
            { to: "/admin/system", labelKey: "admin.nav.system", icon: Database },
        ],
    },
];

function AdminLayout() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const location = useLocation();
    const email = localStorage.getItem("email") || "Admin";

    const currentLabel = useMemo(() => {
        for (const group of NAV_GROUPS) {
            const hit = group.items.find((item) => location.pathname.startsWith(item.to));
            if (hit) return t(hit.labelKey);
        }
        return t("admin.nav.dashboard");
    }, [location.pathname, t]);

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const sidebar = (
        <>
            <div className="border-b px-4 py-4" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-500 dark:text-fuchsia-400">
                    {t("layout.admin")}
                </p>
                <p className="ui-text-primary mt-1 truncate text-sm font-bold">{t("admin.layout.title")}</p>
                <p className="ui-text-faint truncate text-xs">{email}</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                <AnimatedButton
                    type="button"
                    onClick={() => navigate("/user/dashboard")}
                    className="ui-btn-ghost focus-ring mb-3 w-full text-xs"
                >
                    <ArrowLeft size={14} />
                    {t("layout.backWorkspace")}
                </AnimatedButton>

                {NAV_GROUPS.map((group) => (
                    <div key={group.titleKey} className="mb-4">
                        <SidebarSection title={t(group.titleKey)}>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <SidebarLink key={item.to} to={item.to} accent="fuchsia">
                                        <Icon size={16} className="shrink-0 opacity-80" />
                                        {t(item.labelKey)}
                                    </SidebarLink>
                                );
                            })}
                        </SidebarSection>
                    </div>
                ))}
            </div>

            <div className="border-t p-3" style={{ borderColor: "var(--color-border)" }}>
                <AnimatedButton
                    type="button"
                    onClick={logout}
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-300 hover:bg-red-500/15"
                >
                    <LogOut size={16} />
                    {t("layout.logout")}
                </AnimatedButton>
            </div>
        </>
    );

    return (
        <AppShellLayout
            sidebar={sidebar}
            topbarEyebrow={t("layout.admin")}
            topbarTitle={currentLabel}
            contentClassName="ui-shell-content--wide"
        >
            <header className="ui-page-header mb-4 hidden border-fuchsia-500/10 lg:flex">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-500 dark:text-fuchsia-400">
                        {t("layout.admin")}
                    </p>
                    <h1 className="ui-text-primary text-lg font-bold">{currentLabel}</h1>
                </div>
            </header>
            <Outlet />
        </AppShellLayout>
    );
}

export default AdminLayout;
