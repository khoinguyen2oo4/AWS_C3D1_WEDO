import StatusPage from "../components/StatusPage";
import { useI18n } from "../i18n/useI18n";

function Forbidden() {
    const { t } = useI18n();

    return (
        <StatusPage
            code="403"
            title={t("errors.forbidden.title")}
            description={t("errors.forbidden.description")}
            actionTo="/user/dashboard"
            actionLabel={t("layout.dashboard")}
            secondaryTo="/login"
            secondaryLabel={t("errors.notFound.login")}
        />
    );
}

export default Forbidden;
