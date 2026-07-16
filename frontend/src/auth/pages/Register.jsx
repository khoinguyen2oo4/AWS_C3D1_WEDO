import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";
import AuthErrorBanner from "../components/AuthErrorBanner";
import AuthField from "../components/AuthField";
import AuthShell from "../components/AuthShell";
import GoogleSignIn from "../components/GoogleSignIn";
import { useI18n } from "../../shared/i18n/useI18n";
import { register } from "../../services/authService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";

function Register() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
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
            const data = await register({ fullName, email, password });
            completeLogin(data, email);
        } catch (err) {
            setError({
                status: getApiErrorStatus(err),
                message: getApiErrorMessage(err, t("auth.register.errorDefault")),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            variant="register"
            footer={
                <p className="ui-text-muted text-sm">
                    {t("auth.register.footerHasAccount")}{" "}
                    <Link to="/login">{t("auth.register.footerLogin")}</Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-3.5">
                <AuthField
                    icon={UserRound}
                    label={t("auth.register.fullNameLabel")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    type="text"
                    placeholder={t("auth.register.fullNamePlaceholder")}
                    autoComplete="name"
                    required
                />
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
                    placeholder={t("auth.register.passwordPlaceholder")}
                    autoComplete="new-password"
                    required
                />

                {error ? <AuthErrorBanner status={error.status} message={error.message} /> : null}

                <button type="submit" disabled={loading} className="ui-btn-primary w-full bg-fuchsia-500 hover:bg-fuchsia-400">
                    {loading ? t("auth.register.submitting") : t("auth.register.submit")}
                    <ArrowRight size={16} />
                </button>
                <GoogleSignIn onSuccess={completeLogin} onError={handleGoogleError} />
            </form>
        </AuthShell>
    );
}

export default Register;
