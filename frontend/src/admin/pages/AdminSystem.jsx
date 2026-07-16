/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Bell, Database, History, LockKeyhole, RefreshCw, Save, Settings2, ShieldAlert, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { cleanupAdminStorage, getAdminSummary, getAdminSystem, updateAdminSystemSettings } from "../../services/adminService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import { useI18n } from "../../shared/i18n/useI18n";
import AdminPageShell, { AdminPanel } from "../components/AdminPageShell";
import { AdminErrorState, AdminLoadingState } from "../components/AdminStateView";
import AnimatedButton from "../../shared/components/animation/AnimatedButton";
import AnimatedCard from "../../shared/components/animation/AnimatedCard";
import FloatingImage from "../../shared/components/animation/FloatingImage";
import useToast from "../../shared/components/toast/useToast";

const DEFAULT_SYSTEM_SETTINGS = {
    allowRegistration: true,
    maintenanceMode: false,
    deadlineReminders: true,
    reviewNotifications: true,
    auditRetention: "90",
};

function AdminSystem() {
    const { t } = useI18n();
    const toast = useToast();
    const [system, setSystem] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [settings, setSettings] = useState(DEFAULT_SYSTEM_SETTINGS);
    const [settingsSavedAt, setSettingsSavedAt] = useState(null);
    const [cleaningStorage, setCleaningStorage] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [systemData, summaryData] = await Promise.all([getAdminSystem(), getAdminSummary()]);
            setSystem(systemData);
            setSummary(summaryData);
            setSettings({
                allowRegistration: systemData.allowRegistration,
                maintenanceMode: systemData.maintenanceMode,
                deadlineReminders: systemData.deadlineReminders,
                reviewNotifications: systemData.reviewNotifications,
                auditRetention: String(systemData.auditRetentionDays || 90),
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const checks = useMemo(() => {
        if (!system || !summary) return [];

        return [
            {
                label: t("admin.system.checkAuth"),
                detail: system.authMode,
                statusKey: "ACTIVE",
                status: t("admin.system.statusActive"),
                icon: LockKeyhole,
            },
            {
                label: t("admin.system.checkAdmin"),
                detail: `${summary.adminUsers} admin`,
                statusKey: summary.adminUsers > 0 ? "READY" : "WARN",
                status: summary.adminUsers > 0 ? t("admin.system.statusReady") : t("admin.system.statusWarn"),
                icon: ShieldCheck,
            },
            {
                label: t("admin.system.checkLocked"),
                detail: `${summary.lockedUsers} / ${summary.totalUsers}`,
                statusKey: summary.lockedUsers > 0 ? "TRACK" : "OK",
                status: summary.lockedUsers > 0 ? t("admin.system.statusTrack") : t("admin.system.statusOk"),
                icon: Users,
            },
            {
                label: t("admin.system.checkData"),
                detail: `${system.totalProjects} · ${system.totalTasks} · ${system.totalMessages}`,
                statusKey: "CONNECTED",
                status: t("admin.system.statusConnected"),
                icon: Database,
            },
        ];
    }, [summary, system, t]);

    const settingRows = useMemo(
        () => [
            {
                key: "allowRegistration",
                label: t("admin.system.settingRegistration"),
                description: t("admin.system.settingRegistrationDesc"),
                icon: UserPlus,
            },
            {
                key: "maintenanceMode",
                label: t("admin.system.settingMaintenance"),
                description: t("admin.system.settingMaintenanceDesc"),
                icon: ShieldAlert,
            },
            {
                key: "deadlineReminders",
                label: t("admin.system.settingDeadline"),
                description: t("admin.system.settingDeadlineDesc"),
                icon: Bell,
            },
            {
                key: "reviewNotifications",
                label: t("admin.system.settingReview"),
                description: t("admin.system.settingReviewDesc"),
                icon: History,
            },
        ],
        [t]
    );

    const updateSetting = (key, value) => {
        setSettings((current) => ({ ...current, [key]: value }));
        setSettingsSavedAt(null);
    };

    const saveSettings = async () => {
        try {
            const updated = await updateAdminSystemSettings({
                allowRegistration: settings.allowRegistration,
                maintenanceMode: settings.maintenanceMode,
                deadlineReminders: settings.deadlineReminders,
                reviewNotifications: settings.reviewNotifications,
                auditRetentionDays: Number(settings.auditRetention),
            });
            setSystem(updated);
            setSettingsSavedAt(new Date().toLocaleTimeString());
            toast.success(t("toast.adminSettingsSaved"));
        } catch {
            toast.error(t("toast.adminSettingsFailed"));
        }
    };

    const cleanStorage = async () => {
        setCleaningStorage(true);
        try {
            const result = await cleanupAdminStorage();
            toast.success(t("toast.storageCleanupSuccess", {
                count: result.removedFiles,
                size: formatBytes(result.reclaimedBytes),
            }));
        } catch {
            toast.error(t("toast.storageCleanupFailed"));
        } finally {
            setCleaningStorage(false);
        }
    };

    if (loading) {
        return (
            <AdminLoadingState
                title={t("admin.system.loadingTitle")}
                description={t("admin.system.loadingDesc")}
            />
        );
    }

    if (error) {
        return (
            <AdminErrorState
                title={t("admin.system.errorTitle")}
                message={getApiErrorMessage(error, t("admin.system.errorDesc"))}
                status={getApiErrorStatus(error)}
                onRetry={load}
            />
        );
    }

    return (
        <AdminPageShell
            eyebrow={t("layout.admin")}
            title={t("admin.system.title")}
            description={t("admin.system.desc")}
            actions={
                <AnimatedButton type="button" onClick={load} className="ui-btn-ghost">
                    <RefreshCw size={15} />
                    {t("common.refresh")}
                </AnimatedButton>
            }
            stats={[
                {
                    label: t("admin.dashboard.users"),
                    value: system.totalUsers,
                    note: t("admin.system.statUsersNote", { count: summary.adminUsers }),
                },
                {
                    label: t("admin.dashboard.projects"),
                    value: system.totalProjects,
                    note: t("admin.system.statProjectsNote", { active: summary.activeProjects }),
                },
                {
                    label: t("admin.dashboard.tasks"),
                    value: system.totalTasks,
                    note: t("admin.system.statTasksNote"),
                },
                {
                    label: t("project.room.statsMembers"),
                    value: system.totalMembers,
                    note: t("admin.system.statMembersNote"),
                },
            ]}
        >
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatBox label={t("admin.system.messages")} value={system.totalMessages} />
                <StatBox label={t("admin.system.activeProjects")} value={summary.activeProjects} />
                <StatBox label={t("admin.system.lockedUsers")} value={summary.lockedUsers} />
                <StatBox label={t("admin.system.auth")} value={system.authMode} small />
            </section>

            <AdminPanel title={t("admin.system.checksTitle")} subtitle={t("admin.system.checksSubtitle")}>
                <div className="grid gap-2 sm:grid-cols-2">
                    {checks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.label} className="ui-card">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 gap-2">
                                        <Icon size={16} className="ui-text-accent mt-0.5 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold ui-text-primary">
                                                {item.label}
                                            </p>
                                            <p className="ui-text-muted mt-0.5 text-[11px] leading-snug">
                                                {item.detail}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge statusKey={item.statusKey} status={item.status} />
                                </div>
                            </article>
                        );
                    })}
                </div>
            </AdminPanel>

            <AdminPanel title={t("admin.system.settingsTitle")} subtitle={t("admin.system.settingsSubtitle")}>
                <div className="grid gap-3 lg:grid-cols-2">
                    {settingRows.map((item) => (
                        <SettingToggle
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            description={item.description}
                            checked={Boolean(settings[item.key])}
                            onChange={(value) => updateSetting(item.key, value)}
                        />
                    ))}
                </div>

                <div className="mt-4 grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <label className="block min-w-0">
                        <span className="ui-text-primary flex items-center gap-2 text-sm font-bold">
                            <Settings2 size={15} className="ui-text-accent" />
                            {t("admin.system.settingRetention")}
                        </span>
                        <span className="ui-text-muted mt-1 block text-xs">
                            {t("admin.system.settingRetentionDesc")}
                        </span>
                        <select
                            value={settings.auditRetention}
                            onChange={(event) => updateSetting("auditRetention", event.target.value)}
                            className="focus-ring mt-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm ui-text-primary outline-none md:max-w-xs"
                        >
                            <option value="30">{t("admin.system.retention30")}</option>
                            <option value="90">{t("admin.system.retention90")}</option>
                            <option value="180">{t("admin.system.retention180")}</option>
                        </select>
                    </label>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                        <AnimatedButton type="button" onClick={saveSettings} className="ui-btn-primary px-4 py-2.5">
                            <Save size={15} />
                            {t("admin.system.saveSettings")}
                        </AnimatedButton>
                        {settingsSavedAt ? (
                            <p className="ui-text-muted text-xs">
                                {t("admin.system.savedAt", { time: settingsSavedAt })}
                            </p>
                        ) : null}
                    </div>
                </div>
            </AdminPanel>

            <AdminPanel title={t("admin.system.storageTitle")} subtitle={t("admin.system.storageDesc")}>
                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Database size={18} className="ui-text-accent shrink-0" />
                        <p className="ui-text-muted text-xs leading-5">{t("admin.system.storageDesc")}</p>
                    </div>
                    <AnimatedButton
                        type="button"
                        onClick={cleanStorage}
                        disabled={cleaningStorage}
                        className="ui-btn-ghost shrink-0"
                    >
                        <Trash2 size={15} />
                        {cleaningStorage ? t("admin.system.storageCleaning") : t("admin.system.storageCleanup")}
                    </AnimatedButton>
                </div>
            </AdminPanel>
        </AdminPageShell>
    );
}

function formatBytes(value = 0) {
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function StatBox({ label, value, small = false }) {
    return (
        <AnimatedCard className="ui-stat-card">
            <p className="ui-text-faint text-[10px] font-bold uppercase">{label}</p>
            <p
                className={`mt-1 font-bold ui-text-primary ${small ? "truncate text-xs" : "text-xl tabular-nums"}`}
            >
                {value}
            </p>
        </AnimatedCard>
    );
}

function SettingToggle({ icon: Icon, label, description, checked, onChange }) {
    return (
        <AnimatedCard as="article" className="ui-card">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                    <FloatingImage className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-200" intensity={2}>
                        <Icon size={17} />
                    </FloatingImage>
                    <div className="min-w-0">
                        <h3 className="ui-text-primary text-sm font-bold">{label}</h3>
                        <p className="ui-text-muted mt-1 line-clamp-2 text-xs leading-5">{description}</p>
                    </div>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-label={label}
                    aria-checked={checked}
                    onClick={() => onChange(!checked)}
                    className={[
                        "focus-ring relative h-6 w-11 shrink-0 rounded-full border transition",
                        checked
                            ? "border-fuchsia-400/40 bg-fuchsia-500/80"
                            : "border-[var(--color-border)] bg-[var(--color-surface-muted)]",
                    ].join(" ")}
                >
                    <span
                        className={[
                            "absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition",
                            checked ? "left-[21px]" : "left-[2px]",
                        ].join(" ")}
                    />
                </button>
            </div>
        </AnimatedCard>
    );
}

function StatusBadge({ statusKey, status }) {
    const tone =
        statusKey === "ACTIVE" || statusKey === "READY" || statusKey === "CONNECTED" || statusKey === "OK"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
            : statusKey === "TRACK" || statusKey === "WARN"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
              : "border-[var(--color-border)] bg-[var(--color-surface-muted)] ui-text-muted";

    return (
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${tone}`}>
            {status}
        </span>
    );
}

export default AdminSystem;
