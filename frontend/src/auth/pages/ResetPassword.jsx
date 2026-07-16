import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, KeyRound } from "lucide-react";
import AuthErrorBanner from "../components/AuthErrorBanner";
import AuthField from "../components/AuthField";
import AuthShell from "../components/AuthShell";
import { useI18n } from "../../shared/i18n/useI18n";
import { resetPassword } from "../../services/authService";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";

function ResetPassword() {
    const { t } = useI18n();
    const [searchParams] = useSearchParams();
    const initialToken = useMemo(() => searchParams.get("token") || "", [searchParams]);
    const [resetToken, setResetToken] = useState(initialToken);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            setError({
                status: null,
                message: t("auth.reset.mismatch"),
            });
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const data = await resetPassword({
                resetToken,
                newPassword,
            });
            setSuccess(data);
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError({
                status: getApiErrorStatus(err),
                message: getApiErrorMessage(err, t("auth.reset.errorDefault")),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            variant="reset"
            footer={
                <p className="ui-text-muted text-sm">
                    <Link to="/login">{t("auth.reset.footerLogin")}</Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-3.5">
                {!initialToken ? (
                    <AuthField
                        icon={KeyRound}
                        label={t("auth.reset.tokenLabel")}
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder={t("auth.reset.tokenPlaceholder")}
                        autoComplete="off"
                        required
                    />
                ) : null}
                <AuthField
                    icon={Lock}
                    label={t("auth.reset.newPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    placeholder={t("auth.reset.newPasswordPlaceholder")}
                    autoComplete="new-password"
                    required
                />
                <AuthField
                    icon={Lock}
                    label={t("auth.reset.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder={t("auth.reset.confirmPlaceholder")}
                    autoComplete="new-password"
                    required
                />

                {error ? <AuthErrorBanner status={error.status} message={error.message} /> : null}

                {success ? (
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-200">
                            {t("auth.reset.successTitle")}
                        </p>
                        <p className="ui-text-muted mt-2 text-sm leading-relaxed">
                            {success.message || t("auth.reset.successBody")}
                        </p>
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={loading}
                    className="lift focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? t("auth.reset.submitting") : t("auth.reset.submit")}
                    <ArrowRight size={16} />
                </button>
            </form>
        </AuthShell>
    );
}

export default ResetPassword;
