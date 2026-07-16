/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Database, ReceiptText, ServerCog } from "lucide-react";
import { getAdminProjects, getAdminSummary } from "../../services/adminService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import { useI18n } from "../../shared/i18n/useI18n";
import { BarChart, CHART_COLORS, DonutChart, StackedBar } from "../../user/components/DashboardCharts";
import AdminPageShell, { AdminPanel } from "../components/AdminPageShell";
import { AdminErrorState, AdminLoadingState } from "../components/AdminStateView";

const BILLING_COLORS = ["#d946ef", CHART_COLORS.progress, CHART_COLORS.done, CHART_COLORS.review, CHART_COLORS.violet];

function AdminBilling({ mode = "subscriptions" }) {
    const { t } = useI18n();
    const [summary, setSummary] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const [summaryData, projectData] = await Promise.all([getAdminSummary(), getAdminProjects()]);
            setSummary(summaryData);
            setProjects(projectData);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const isPayments = mode === "payments";
    const title = isPayments ? t("admin.billing.paymentsTitle") : t("admin.billing.subscriptionsTitle");
    const Icon = isPayments ? ReceiptText : CreditCard;
    const billing = useMemo(() => {
        const monthlyTotal = projects.reduce((sum, project) => sum + Number(project.monthlyCost || 0), 0);
        return {
            monthlyTotal,
            planItems: mapCounts(projects.map((project) => project.planCode || "FREE"), BILLING_COLORS),
            billingItems: mapCounts(projects.map((project) => project.billingStatus || "TRIAL"), BILLING_COLORS),
            paidProjects: projects.filter((project) => project.billingStatus === "PAID").length,
            topProjects: projects
                .slice()
                .sort((left, right) => Number(right.monthlyCost || 0) - Number(left.monthlyCost || 0))
                .slice(0, 8),
        };
    }, [projects]);

    if (loading) {
        return (
            <AdminLoadingState
                title={t("admin.dashboard.loadingTitle")}
                description={t("admin.dashboard.loadingDesc")}
            />
        );
    }

    if (error) {
        return (
            <AdminErrorState
                title={t("admin.dashboard.errorTitle")}
                message={getApiErrorMessage(error, t("admin.dashboard.errorDesc"))}
                status={getApiErrorStatus(error)}
                onRetry={load}
            />
        );
    }

    return (
        <AdminPageShell
            eyebrow={t("admin.nav.billing")}
            title={title}
            description={t("admin.billing.overview")}
            stats={[
                { label: t("admin.dashboard.users"), value: summary.totalUsers, note: t("admin.nav.subscriptions") },
                { label: t("admin.dashboard.projects"), value: summary.totalProjects, note: t("layout.workspace") },
                { label: t("admin.nav.payments"), value: billing.paidProjects, note: t("admin.projects.billing.PAID.label"), tone: "text-emerald-200" },
                { label: t("admin.billing.monthlyRevenue"), value: formatMoney(billing.monthlyTotal), note: t("admin.billing.overview"), tone: "text-fuchsia-200" },
            ]}
        >
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
                <AdminPanel title={title} subtitle={t("admin.billing.overview")}>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="ui-card">
                            <Icon size={22} className="text-fuchsia-200" />
                            <p className="ui-text-faint mt-3 text-[10px] font-bold uppercase">
                                {t("admin.billing.monthlyRevenue")}
                            </p>
                            <p className="ui-text-primary mt-1 text-xl font-bold">
                                {formatMoney(billing.monthlyTotal)}
                            </p>
                            <p className="ui-text-muted mt-2 text-sm leading-6">{t("admin.billing.projectPlans")}</p>
                        </div>
                        <DonutChart
                            items={billing.planItems}
                            centerValue={projects.length}
                            centerLabel={t("admin.nav.subscriptions")}
                            emptyLabel={t("admin.billing.noBillingData")}
                        />
                    </div>
                </AdminPanel>

                <AdminPanel title={t("admin.system.checksTitle")} subtitle={t("admin.system.title")}>
                    <div className="space-y-3">
                        <Checklist icon={Database} text={t("admin.system.checkData")} />
                        <Checklist icon={ServerCog} text={t("admin.system.checkAuth")} />
                        <Checklist icon={CreditCard} text={t("admin.nav.payments")} />
                        <Checklist icon={ReceiptText} text={t("admin.nav.subscriptions")} />
                    </div>
                </AdminPanel>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <AdminPanel title={t("admin.billing.planDistribution")} subtitle={t("admin.nav.subscriptions")}>
                    <BarChart items={billing.planItems} emptyLabel={t("admin.billing.noBillingData")} />
                </AdminPanel>
                <AdminPanel title={t("admin.billing.billingStatus")} subtitle={t("admin.nav.payments")}>
                    <StackedBar items={billing.billingItems} emptyLabel={t("admin.billing.noBillingData")} />
                </AdminPanel>
            </section>

            <AdminPanel title={t("admin.billing.projectPlans")} subtitle={t("admin.nav.projects")} scroll>
                <div className="space-y-2">
                    {billing.topProjects.length > 0 ? (
                        billing.topProjects.map((project) => (
                            <article key={project.id} className="ui-card">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="ui-text-primary truncate text-sm font-bold">{project.projectName}</p>
                                        <p className="ui-text-faint mt-1 truncate text-xs">{project.ownerEmail}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-xs font-bold text-fuchsia-200">{project.planCode || "FREE"}</p>
                                        <p className="ui-text-faint text-[10px]">{formatMoney(project.monthlyCost || 0)}</p>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p className="ui-text-muted text-sm">{t("admin.billing.noBillingData")}</p>
                    )}
                </div>
            </AdminPanel>
        </AdminPageShell>
    );
}

function Checklist({ icon: Icon, text }) {
    return (
        <div className="ui-card flex items-start gap-3">
            <Icon size={18} className="mt-1 shrink-0 text-fuchsia-200" />
            <p className="ui-text-muted text-sm leading-6">{text}</p>
        </div>
    );
}

function mapCounts(values, colors) {
    const counts = values.reduce((result, value) => {
        const key = value || "N/A";
        result.set(key, (result.get(key) || 0) + 1);
        return result;
    }, new Map());

    return [...counts.entries()].map(([label, value], index) => ({
        label,
        value,
        color: colors[index % colors.length],
    }));
}

function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

export default AdminBilling;
