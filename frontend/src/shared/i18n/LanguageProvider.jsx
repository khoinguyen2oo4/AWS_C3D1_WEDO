import { useCallback, useMemo, useState } from "react";
import { applyLocale, getInitialLocale, persistLocale } from "../utils/locale";
import { LanguageContext } from "./LanguageContext";
import en from "./locales/en";
import vi from "./locales/vi";

const MESSAGES = { vi, en };

function resolve(messages, key) {
    return key.split(".").reduce((current, part) => current?.[part], messages);
}

function interpolate(template, vars) {
    if (!template || !vars) return template;
    return Object.entries(vars).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        template
    );
}

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState(() => {
        const initial = getInitialLocale();
        applyLocale(initial);
        return initial;
    });

    const setLocale = useCallback((next) => {
        const value = next === "en" ? "en" : "vi";
        setLocaleState(value);
        persistLocale(value);
        applyLocale(value);
    }, []);

    const t = useCallback(
        (key, vars) => {
            const primary = resolve(MESSAGES[locale], key);
            const fallback = resolve(MESSAGES.vi, key);
            const text = primary ?? fallback ?? key;
            return interpolate(text, vars);
        },
        [locale]
    );

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
