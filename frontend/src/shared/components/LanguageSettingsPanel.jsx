import { Globe } from "lucide-react";
import DarkSelect from "./DarkSelect";
import { useI18n } from "../i18n/useI18n";
import { WorkspacePanel } from "../../user/components/WorkspacePageShell";
import useToast from "./toast/useToast";

function LanguageSettingsPanel() {
    const { locale, setLocale, t } = useI18n();
    const toast = useToast();

    const languageOptions = [
        { value: "vi", label: t("language.vietnamese"), hint: "VI" },
        { value: "en", label: t("language.english"), hint: "EN" },
    ];

    return (
        <WorkspacePanel title={t("language.title")} subtitle={t("language.subtitle")}>
            <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]">
                    <Globe size={18} className="ui-text-accent" />
                </span>
                <div className="min-w-0 flex-1">
                    <DarkSelect
                        label={t("language.title")}
                        value={locale}
                        onChange={(value) => {
                            setLocale(value);
                            toast.info(t("toast.languageChanged"));
                        }}
                        options={languageOptions}
                        menuWidth="240px"
                    />
                    <p className="ui-page-desc mt-2">
                        {t("language.hint")}
                    </p>
                    <p className="ui-text-faint mt-1 text-xs">
                        {t("language.current", {
                            lang: locale === "en" ? t("language.english") : t("language.vietnamese"),
                        })}
                    </p>
                </div>
            </div>
        </WorkspacePanel>
    );
}

export default LanguageSettingsPanel;
