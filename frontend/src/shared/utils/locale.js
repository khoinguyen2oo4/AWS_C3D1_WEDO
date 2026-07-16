const LOCALE_KEY = "locale";

export function getInitialLocale() {
    if (typeof window === "undefined") return "vi";
    return localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "vi";
}

export function persistLocale(locale) {
    localStorage.setItem(LOCALE_KEY, locale === "en" ? "en" : "vi");
}

export function applyLocale(locale) {
    const next = locale === "en" ? "en" : "vi";
    document.documentElement.lang = next;
}
