import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Copy, MonitorCog, Trash2, Save } from "lucide-react";
import { deleteProject, getProjectSettings, updateProjectSettings } from "../../services/projectService";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import DarkSelect from "../../shared/components/DarkSelect";
import LanguageSettingsPanel from "../../shared/components/LanguageSettingsPanel";
import ThemeToggle from "../../shared/components/ThemeToggle";
import useToast from "../../shared/components/toast/useToast";
import { useI18n } from "../../shared/i18n/useI18n";
import { getApiErrorMessage } from "../../shared/utils/apiError";
import {
    getProjectStatusOptions,
    getProjectVisibilityOptions,
} from "../../shared/i18n/optionLabels";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";
import { formatDateTime } from "../components/projectHelpers";

function ProjectSettings() {
    const navigate = useNavigate();
    const { project, reloadProject, canEditSettings } = useOutletContext();
    const { locale, t } = useI18n();
    const toast = useToast();
    const currentEmail = localStorage.getItem("email") || "";
    const isOwner = (project.ownerEmail || "").toLowerCase() === currentEmail.toLowerCase();

    const projectStatusOptions = useMemo(() => getProjectStatusOptions(t), [t]);
    const projectVisibilityOptions = useMemo(() => getProjectVisibilityOptions(t), [t]);

    const [state, setState] = useState({
        loading: true,
        error: null,
        settings: null,
        saving: false,
        deleting: false,
        confirmDelete: false,
    });

    const [form, setForm] = useState({
        projectName: "",
        projectDescription: "",
        status: "ACTIVE",
        visibility: "PRIVATE",
        logoUrl: "",
    });

    const load = async () => {
        setState((current) => ({ ...current, loading: true, error: null }));

        try {
            const settings = await getProjectSettings(project.id);
            setState((current) => ({ ...current, loading: false, error: null, settings }));
            setForm({
                projectName: settings.projectName || "",
                projectDescription: settings.projectDescription || "",
                status: settings.status || "ACTIVE",
                visibility: settings.visibility || "PRIVATE",
                logoUrl: settings.logoUrl || "",
            });
        } catch (error) {
            setState((current) => ({ ...current, loading: false, error }));
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const canEdit = useMemo(
        () => (typeof canEditSettings === "boolean" ? canEditSettings : isOwner),
        [canEditSettings, isOwner]
    );

    const handleSave = async (event) => {
        event.preventDefault();
        if (!canEdit) return;

        setState((current) => ({ ...current, saving: true }));
        try {
            const settings = await updateProjectSettings(project.id, form);
            setState((current) => ({ ...current, saving: false, settings }));
            await reloadProject?.();
            toast.success(t("toast.projectSettingsSaved"));
        } catch (error) {
            setState((current) => ({ ...current, saving: false, error }));
            toast.error(getApiErrorMessage(error, t("toast.projectSettingsFailed")));
        }
    };

    const handleDelete = async () => {
        if (!canEdit) return;

        setState((current) => ({ ...current, deleting: true }));
        try {
            await deleteProject(project.id);
            toast.success(t("toast.projectDeleted"));
            navigate("/user/dashboard");
        } catch (error) {
            setState((current) => ({ ...current, deleting: false, error }));
            toast.error(getApiErrorMessage(error, t("toast.projectDeleteFailed")));
        }
    };

    const copyInviteCode = async () => {
        if (!state.settings?.inviteCode) return;
        try {
            await navigator.clipboard.writeText(state.settings.inviteCode);
            toast.success(t("toast.inviteCopied"));
        } catch {
            toast.error(t("toast.inviteCopyFailed"));
        }
    };

    if (state.loading) {
        return (
            <WorkspaceLoadingState
                title={t("settings.loadingTitle")}
                description={t("settings.loadingDesc")}
            />
        );
    }

    if (state.error) {
        return (
            <WorkspaceErrorState
                title={t("settings.errorTitle")}
                message={t("settings.errorDesc")}
                status={state.error?.response?.status}
                onRetry={load}
            />
        );
    }

    const settings = state.settings;
    const emptyLabel = t("common.none");

    return (
        <div className="ui-page">
            <section className="ui-section-grid ui-section-grid--2">
                <LanguageSettingsPanel />
                <WorkspacePanel title={t("theme.title")} subtitle={t("theme.subtitle")}>
                    <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]">
                            <MonitorCog size={18} className="ui-text-accent" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <ThemeToggle className="w-full sm:w-auto" />
                            <p className="ui-page-desc mt-2">
                                {t("theme.hint")}
                            </p>
                        </div>
                    </div>
                </WorkspacePanel>
            </section>

            <section className="ui-stat-grid md:grid-cols-4">
                <Info
                    label={t("settings.permission")}
                    value={canEdit ? t("common.owner") : t("common.view")}
                />
                <Info label={t("settings.members")} value={settings.memberCount} />
                <Info label={t("settings.tasksCount")} value={settings.taskCount} />
                <Info label={t("settings.messages")} value={settings.messageCount} />
            </section>

            <section className="ui-section-grid ui-section-grid--master-wide">
                <WorkspacePanel title={t("settings.configTitle")} subtitle={t("settings.configSubtitle")}>
                    <form onSubmit={handleSave} className="space-y-3">
                        <Field
                            label={t("settings.projectName")}
                            value={form.projectName}
                            onChange={(e) =>
                                setForm((current) => ({ ...current, projectName: e.target.value }))
                            }
                            disabled={!canEdit}
                        />
                        <Field
                            label="Logo URL"
                            value={form.logoUrl}
                            onChange={(e) =>
                                setForm((current) => ({ ...current, logoUrl: e.target.value }))
                            }
                            disabled={!canEdit}
                        />
                        <label className="block">
                            <span className="ui-label mb-2">{t("settings.description")}</span>
                            <textarea
                                value={form.projectDescription}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        projectDescription: e.target.value,
                                    }))
                                }
                                rows={4}
                                disabled={!canEdit}
                                className="ui-textarea focus-ring disabled:cursor-not-allowed disabled:opacity-60"
                                placeholder={t("settings.descriptionPlaceholder")}
                            />
                        </label>
                        <div className="grid gap-3 md:grid-cols-2">
                            <DarkSelect
                                label={t("settings.status")}
                                value={form.status}
                                onChange={(value) => setForm((current) => ({ ...current, status: value }))}
                                options={projectStatusOptions}
                                disabled={!canEdit}
                            />
                            <DarkSelect
                                label={t("settings.visibility")}
                                value={form.visibility}
                                onChange={(value) =>
                                    setForm((current) => ({ ...current, visibility: value }))
                                }
                                options={projectVisibilityOptions}
                                disabled={!canEdit}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={!canEdit || state.saving}
                                className="ui-btn-primary disabled:cursor-not-allowed"
                            >
                                <Save size={16} />
                                {state.saving ? t("common.saving") : t("common.save")}
                            </button>
                            <button
                                type="button"
                                onClick={copyInviteCode}
                                className="ui-btn-ghost focus-ring"
                            >
                                <Copy size={16} />
                                {t("common.copyInvite")}
                            </button>
                        </div>
                    </form>
                </WorkspacePanel>

                <WorkspacePanel title={t("settings.infoTitle")} subtitle={t("settings.infoSubtitle")}>
                    <div className="space-y-3">
                        <Info label={t("settings.inviteCode")} value={settings.inviteCode} />
                        <Info label={t("common.owner")} value={settings.ownerEmail} />
                        <Info label={t("settings.plan")} value={settings.planCode || "FREE"} />
                        <Info label={t("settings.billing")} value={settings.billingStatus || "TRIAL"} />
                        <Info label={t("settings.cost")} value={formatMoney(settings.monthlyCost, locale)} />
                        <Info
                            label={t("settings.ownerExpiry")}
                            value={settings.ownerAccessExpiresAt || t("common.notSet")}
                        />
                        <Info
                            label={t("settings.updated")}
                            value={formatDateTime(settings.updatedAt, locale, emptyLabel)}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setState((current) => ({ ...current, confirmDelete: true }))}
                        disabled={!isOwner}
                            className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-300 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Trash2 size={16} />
                        {t("settings.deleteProject")}
                    </button>
                </WorkspacePanel>
            </section>

            <ConfirmDialog
                open={state.confirmDelete}
                title={t("settings.deleteTitle")}
                description={t("settings.deleteDesc")}
                confirmLabel={state.deleting ? t("settings.deleting") : t("settings.deleteProject")}
                cancelLabel={t("common.cancel")}
                danger
                onConfirm={handleDelete}
                onCancel={() => setState((current) => ({ ...current, confirmDelete: false }))}
            />
        </div>
    );
}

function Field({ label, ...props }) {
    return (
        <label className="block">
            <span className="ui-label mb-2">{label}</span>
            <input {...props} className="ui-textarea focus-ring disabled:cursor-not-allowed disabled:opacity-60" />
        </label>
    );
}

function Info({ label, value }) {
    return (
        <div className="ui-card p-2.5">
            <p className="ui-text-faint text-xs font-bold uppercase tracking-wide">{label}</p>
            <p className="ui-text-primary mt-1 break-all text-sm font-semibold">{value}</p>
        </div>
    );
}

function formatMoney(value, locale) {
    const number = Number(value || 0);
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(number);
}

export default ProjectSettings;
