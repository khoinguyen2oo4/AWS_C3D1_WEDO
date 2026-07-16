import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import AuthErrorBanner from "../components/AuthErrorBanner";
import AuthField from "../components/AuthField";
import AuthShell from "../components/AuthShell";
import GoogleSignIn from "../components/GoogleSignIn";
import { useI18n } from "../../shared/i18n/useI18n";
import { login } from "../../services/authService";
import {
    getApiErrorMessage,
    getApiErrorStatus,
    isApiConnectionError,
} from "../../shared/utils/apiError";

function Login() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [email, setEmail] = useState(localStorage.getItem("email") || "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const completeLogin = useCallback((data, fallbackEmail = "") => {
        localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("email", data.email || fallbackEmail);
        localStorage.setItem("role", data.role || "USER");
        if (data.accountStatus) localStorage.setItem("accountStatus", data.accountStatus);
        if (data.fullName) localStorage.setItem("fullName", data.fullName);

        navigate(
            (data.role || "USER").toUpperCase() === "ADMIN"
                ? "/admin/dashboard"
                : "/user/dashboard",
            { replace: true }
        );
    }, [navigate]);

    const handleGoogleError = useCallback((message) => {
        setError({ message });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const normalizedEmail = email.trim();
            const data = await login({ email: normalizedEmail, password });
            completeLogin(data, normalizedEmail);
        } catch (err) {
            const status = getApiErrorStatus(err);
            const connection = isApiConnectionError(err);
            const message = connection
                ? t("auth.login.serverUnavailable")
                : status === 401
                  ? t("auth.login.invalidCredentials")
                  : status === 403
                    ? t("auth.login.accountLocked")
                    : getApiErrorMessage(err, t("auth.login.errorDefault"));

            setError({
                status,
                connection,
                message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            variant="login"
            footer={
                <p className="ui-text-muted text-sm">
                    {t("auth.login.footerNoAccount")}{" "}
                    <Link to="/register">{t("auth.login.footerRegister")}</Link>
                    <span className="mx-2 opacity-40">·</span>
                    <Link to="/forgot-password">{t("auth.login.footerForgot")}</Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-3.5">
                <AuthField
                    icon={Mail}
                    label={t("auth.fields.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder={t("auth.fields.emailPlaceholder")}
                    autoComplete="email"
                    required
                />
                <AuthField
                    icon={Lock}
                    label={t("auth.login.passwordLabel")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    autoComplete="current-password"
                    required
                />

                {error ? (
                    <AuthErrorBanner
                        status={error.status}
                        message={error.message}
                        connection={error.connection}
                    />
                ) : null}

                <button type="submit" disabled={loading} className="ui-btn-primary w-full">
                    {loading ? t("auth.login.submitting") : t("auth.login.submit")}
                    <ArrowRight size={16} />
                </button>
                <GoogleSignIn onSuccess={completeLogin} onError={handleGoogleError} />
            </form>
        </AuthShell>
    );
}

export default Login;
