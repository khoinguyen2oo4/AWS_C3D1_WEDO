import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import AuthErrorBanner from "../components/AuthErrorBanner";
import AuthField from "../components/AuthField";
import AuthShell from "../components/AuthShell";
import { useI18n } from "../../shared/i18n/useI18n";
import { requestPasswordReset } from "../../services/authService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";

function ForgotPassword() {
    const { t } = useI18n();
    const [email, setEmail] = useState(localStorage.getItem("email") || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await requestPasswordReset(email);
            setResult(data);
        } catch (err) {
            setError({
                status: getApiErrorStatus(err),
                message: getApiErrorMessage(err, t("auth.forgot.errorDefault")),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            variant="forgot"
            footer={
                <p className="ui-text-muted text-sm">
                    {t("auth.forgot.footerRemember")}{" "}
                    <Link to="/login">{t("auth.forgot.footerLogin")}</Link>
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

                {error ? <AuthErrorBanner status={error.status} message={error.message} /> : null}

                {result ? (
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-4">
                        <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-200">
                            <CheckCircle2 size={16} />
                            {result.message}
                        </p>
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={loading}
                    className="lift focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
                    <ArrowRight size={16} />
                </button>
            </form>
        </AuthShell>
    );
}

export default ForgotPassword;
