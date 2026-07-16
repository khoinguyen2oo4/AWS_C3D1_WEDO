const THEME_KEY = "theme";

export function applyTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    const root = document.documentElement;

    root.dataset.theme = nextTheme;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(nextTheme === "light" ? "theme-light" : "theme-dark");
}

export function getInitialTheme() {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

export function persistTheme(theme) {
    localStorage.setItem(THEME_KEY, theme === "light" ? "light" : "dark");
}
