import { Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Shield } from "lucide-react";
import AppShellLayout from "../../shared/components/AppShellLayout";
import { SidebarLink, SidebarSection } from "../../shared/components/AppSidebar";
import { useI18n } from "../../shared/i18n/useI18n";

function WorkspaceLayout() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const fullName = localStorage.getItem("fullName") || "";
    const email = localStorage.getItem("email") || "";
    const role = localStorage.getItem("role") || "USER";
    const isAdmin = role === "ADMIN";

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const sidebar = (
        <>
            <div className="border-b px-4 py-4" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400/90">
                    {t("layout.workspace")}
                </p>
                <p className="ui-text-primary mt-1 truncate text-sm font-bold">
                    {fullName || email || t("layout.account")}
                </p>
                {email ? <p className="ui-text-faint truncate text-xs">{email}</p> : null}
                <span className="mt-2 inline-flex rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-200">
                    {isAdmin ? t("layout.adminPlusUser") : t("common.user")}
                </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                <SidebarSection title={t("layout.navigation")}>
                    <SidebarLink to="/user/dashboard" end>
                        <LayoutDashboard size={16} className="shrink-0 opacity-80" />
                        {t("layout.dashboard")}
                    </SidebarLink>
                    {isAdmin ? (
                        <SidebarLink to="/admin/dashboard" accent="fuchsia">
                            <Shield size={16} className="shrink-0 opacity-80" />
                            {t("layout.adminNav")}
                        </SidebarLink>
                    ) : null}
                </SidebarSection>
            </div>

            <div className="border-t p-3" style={{ borderColor: "var(--color-border)" }}>
                <button
                    type="button"
                    onClick={logout}
                    className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-300 hover:bg-red-500/15"
                >
                    <LogOut size={16} />
                    {t("layout.logout")}
                </button>
            </div>
        </>
    );

    return (
        <AppShellLayout
            sidebar={sidebar}
            topbarEyebrow={t("layout.workspace")}
            topbarTitle={t("layout.dashboard")}
        >
            <Outlet />
        </AppShellLayout>
    );
}

export default WorkspaceLayout;
