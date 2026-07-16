import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/useI18n";
import { applyTheme, getInitialTheme, persistTheme } from "../utils/theme";
import useToast from "./toast/useToast";

function ThemeToggle({ className = "" }) {
    const { t } = useI18n();
    const toast = useToast();
    const [theme, setTheme] = useState(getInitialTheme);
    const isLight = theme === "light";

    useEffect(() => {
        applyTheme(theme);
        persistTheme(theme);
    }, [theme]);

    return (
        <button
            type="button"
            onClick={() => {
                const nextTheme = theme === "light" ? "dark" : "light";
                setTheme(nextTheme);
                toast.info(t(nextTheme === "light" ? "toast.themeLight" : "toast.themeDark"));
            }}
            className={`theme-toggle-button focus-ring inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${className}`.trim()}
            aria-label={isLight ? t("theme.toDark") : t("theme.toLight")}
            title={isLight ? t("theme.dark") : t("theme.light")}
        >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
            {isLight ? t("theme.dark") : t("theme.light")}
        </button>
    );
}

export default ThemeToggle;
