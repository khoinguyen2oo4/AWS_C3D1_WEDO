import { mergeLocale } from "./mergeLocales";
import { authLocales } from "./auth";
import { coreLocales } from "./core";
import { publicLocales } from "./publicLocales";
import { dashboardLocales } from "./dashboardLocales";
import { projectLocales } from "./projectLocales";
import { tasksLocales } from "./tasksLocales";
import { adminLocales } from "./adminLocales";
import { errorsLocales } from "./errorsLocales";
import { featuresLocales } from "./featuresLocales";

export default mergeLocale(
    coreLocales.en,
    { auth: authLocales.en },
    publicLocales.en,
    dashboardLocales.en,
    projectLocales.en,
    tasksLocales.en,
    adminLocales.en,
    errorsLocales.en,
    featuresLocales.en
);
