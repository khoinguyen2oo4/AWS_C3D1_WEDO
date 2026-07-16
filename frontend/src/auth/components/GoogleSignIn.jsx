import { useEffect, useRef, useState } from "react";
import { loginWithGoogle } from "../../services/authService";
import { getApiErrorMessage } from "../../shared/utils/apiError";
import { useI18n } from "../../shared/i18n/useI18n";

const SCRIPT_ID = "google-identity-services";

function loadGoogleIdentityScript() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        const existing = document.getElementById(SCRIPT_ID);
        if (existing) {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function GoogleSignIn({ onSuccess, onError }) {
    const { locale, t } = useI18n();
    const buttonRef = useRef(null);
    const [configured] = useState(Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!configured || !buttonRef.current) return undefined;
        let active = true;

        loadGoogleIdentityScript()
            .then(() => {
                if (!active || !buttonRef.current) return;
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: async ({ credential }) => {
                        setLoading(true);
                        try {
                            onSuccess(await loginWithGoogle(credential));
                        } catch (error) {
                            onError(getApiErrorMessage(error, t("auth.google.failed")));
                        } finally {
                            setLoading(false);
                        }
                    },
                });
                window.google.accounts.id.renderButton(buttonRef.current, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    shape: "rectangular",
                    text: "continue_with",
                    locale,
                    width: Math.min(buttonRef.current.clientWidth || 320, 400),
                });
            })
            .catch(() => onError(t("auth.google.loadFailed")));

        return () => {
            active = false;
        };
    }, [configured, locale, onError, onSuccess, t]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="ui-text-faint text-[10px] font-bold uppercase">{t("auth.google.divider")}</span>
                <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>
            {configured ? (
                <div
                    ref={buttonRef}
                    className={["flex min-h-10 w-full justify-center overflow-hidden transition", loading ? "pointer-events-none opacity-60" : ""].join(" ")}
                    aria-busy={loading}
                />
            ) : (
                <button
                    type="button"
                    className="ui-btn-ghost w-full justify-center bg-[var(--color-surface)]"
                    onClick={() => onError(t("auth.google.notConfigured"))}
                >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-blue-600 shadow-sm">
                        G
                    </span>
                    {t("auth.google.continue")}
                </button>
            )}
        </div>
    );
}

export default GoogleSignIn;
