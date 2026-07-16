import StatusPage from "../components/StatusPage";
import { useI18n } from "../i18n/useI18n";

function NotFound() {
    const { t } = useI18n();

    return (
        <StatusPage
            code="404"
            title={t("errors.notFound.title")}
            description={t("errors.notFound.description")}
            actionTo="/"
            actionLabel={t("errors.notFound.home")}
            secondaryTo="/login"
            secondaryLabel={t("errors.notFound.login")}
        />
    );
}

export default NotFound;
