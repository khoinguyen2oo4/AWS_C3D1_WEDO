import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Copy } from "lucide-react";
import { getProjectSettings } from "../../services/projectService";
import { useI18n } from "../../shared/i18n/useI18n";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";
import { formatDateTime } from "../components/projectHelpers";

function ProjectInvite() {
    const { t, locale } = useI18n();
    const { project } = useOutletContext();
    const [state, setState] = useState({ loading: true, error: null, settings: null, copied: false });

    const load = async () => {
        setState((current) => ({ ...current, loading: true, error: null }));

        try {
            const settings = await getProjectSettings(project.id);
            setState({ loading: false, error: null, settings, copied: false });
        } catch (error) {
            setState((current) => ({ ...current, loading: false, error }));
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const copyCode = async () => {
        if (!state.settings?.inviteCode) return;
        await navigator.clipboard.writeText(state.settings.inviteCode);
        setState((current) => ({ ...current, copied: true }));
        window.setTimeout(() => setState((current) => ({ ...current, copied: false })), 1200);
    };

    if (state.loading) {
        return (
            <WorkspaceLoadingState
                title={t("project.invite.loadingTitle")}
                description={t("project.invite.loadingDesc")}
            />
        );
    }

    if (state.error) {
        return (
            <WorkspaceErrorState
                title={t("project.invite.errorTitle")}
                message={t("project.invite.errorDesc")}
                status={state.error?.response?.status}
                onRetry={load}
            />
        );
    }

    const settings = state.settings;

    return (
        <div className="ui-page">
            <section className="ui-panel py-2 text-center">
                <p className="text-[9px] font-bold uppercase text-cyan-400">{t("project.invite.title")}</p>
                <p className="ui-text-primary mt-1.5 font-mono text-xl font-bold tracking-widest">
                    {settings.inviteCode}
                </p>
                <button
                    type="button"
                    onClick={copyCode}
                    className="ui-btn-primary mt-2 text-xs"
                >
                    <Copy size={13} />
                    {state.copied ? t("project.invite.copied") : t("project.invite.copy")}
                </button>
                <p className="ui-text-faint mt-2 text-[11px]">{t("project.invite.desc")}</p>
            </section>

            <section className="ui-stat-grid">
                <Info label={t("common.owner")} value={settings.ownerEmail} />
                <Info label={t("settings.status")} value={settings.status} />
                <Info label={t("settings.visibility")} value={settings.visibility} />
                <Info
                    label={t("layout.updatedAt")}
                    value={formatDateTime(settings.updatedAt, locale, t("common.none"))}
                />
            </section>

            <WorkspacePanel title={t("project.invite.howTitle")} subtitle={t("project.performance.title")}>
                <ol className="ui-text-muted list-inside list-decimal space-y-2 text-sm">
                    <li>{t("project.invite.how1")}</li>
                    <li>{t("project.invite.how2")}</li>
                    <li>{t("project.invite.how3")}</li>
                </ol>
            </WorkspacePanel>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="ui-stat-card">
            <p className="text-[9px] font-bold uppercase text-slate-500">{label}</p>
            <p className="ui-text-primary mt-0.5 truncate text-xs font-semibold">{value}</p>
        </div>
    );
}

export default ProjectInvite;
