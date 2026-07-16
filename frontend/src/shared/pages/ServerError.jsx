import StatusPage from "../components/StatusPage";
import { useI18n } from "../i18n/useI18n";

function ServerError() {
    const { t } = useI18n();

    return (
        <StatusPage
            code="500"
            title={t("errors.server.title")}
            description={t("errors.server.description")}
            actionTo="/"
            actionLabel={t("errors.page.defaultAction")}
            secondaryTo="/user/dashboard"
            secondaryLabel={t("layout.dashboard")}
        />
    );
}

export default ServerError;
