import { CheckCircle2, Mail, MessageSquareText, Send, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { AutomationStrip, PublicCard, PublicHero, PublicImagePanel, SectionHeading } from "../components/PublicSections";
import { LANDING_IMAGES } from "../data/landingImages";
import { useI18n } from "../../shared/i18n/useI18n";
import useToast from "../../shared/components/toast/useToast";

const TOPIC_KEYS = ["topicProduct", "topicDeploy", "topicPartner"];

function Contact() {
    const { t } = useI18n();
    const toast = useToast();
    const [form, setForm] = useState({
        name: "",
        email: "",
        topic: "topicProduct",
        message: "",
    });

    const channels = asArray(t("public.contact.channels"));
    const automation = asArray(t("public.contact.automation"));
    const validEmail = /\S+@\S+\.\S+/.test(form.email);
    const validMessage = form.message.trim().length >= 12;
    const ready = validEmail && validMessage;
    const topicLabel = t(`public.contact.form.${form.topic}`);

    const mailTo = useMemo(() => {
        const subject = encodeURIComponent(`${t("public.contact.mailSubject")} - ${topicLabel}`);
        const body = encodeURIComponent(
            [
                `${t("public.contact.form.name")}: ${form.name}`,
                `${t("public.contact.form.email")}: ${form.email}`,
                `${t("public.contact.form.topic")}: ${topicLabel}`,
                "",
                `${t("public.contact.form.message")}:`,
                form.message,
            ].join("\n")
        );

        return `mailto:support@c3d1.app?subject=${subject}&body=${body}`;
    }, [form.email, form.message, form.name, t, topicLabel]);

    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 text-white">
            <PublicHero
                eyebrow={t("public.contact.eyebrow")}
                title={t("public.contact.title")}
                subtitle={t("public.contact.subtitle")}
                primary={{ to: "/register", label: t("public.auth.register"), icon: CheckCircle2 }}
                secondary={{ to: "/pricing", label: t("public.nav.pricing"), icon: Workflow }}
            >
                <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                    <ContactFact icon={Mail} title={t("public.contact.email")} text={t("public.footer.support")} />
                    <ContactFact icon={MessageSquareText} title={t("public.contact.location")} text={t("public.contact.locationValue")} />
                </div>
            </PublicHero>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
                <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center">
                        <SectionHeading
                            title={t("public.contact.responseTitle")}
                        />
                        <PublicImagePanel
                            src={LANDING_IMAGES.chatNetwork}
                            alt="Digital chat network"
                            label="Chat"
                            className="h-24 sm:h-28"
                        />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
                        {channels.map((item) => (
                            <PublicCard key={item.title} title={item.title} text={item.text} icon={MessageSquareText} />
                        ))}
                    </div>
                    <AutomationStrip items={automation} />
                </div>

                <form
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!ready) {
                            toast.warning(t("toast.contactMissing"));
                            return;
                        }
                        if (ready) {
                            toast.info(t("toast.contactOpening"));
                            window.location.href = mailTo;
                        }
                    }}
                    className="glass-panel min-w-0 rounded-lg p-5"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                                {t("public.contact.eyebrow")}
                            </p>
                            <h2 className="mt-2 truncate text-xl font-black text-white">{t("public.contact.form.submit")}</h2>
                        </div>
                        <span
                            className={[
                                "w-fit max-w-full rounded-lg border px-2 py-1 text-[10px] font-black uppercase leading-4",
                                ready
                                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                                    : "border-amber-400/25 bg-amber-400/10 text-amber-200",
                            ].join(" ")}
                        >
                            {ready ? t("public.contact.form.ready") : t("public.contact.form.missing")}
                        </span>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <Field
                            label={t("public.contact.form.name")}
                            value={form.name}
                            onChange={(event) => update("name", event.target.value)}
                        />
                        <Field
                            label={t("public.contact.form.email")}
                            value={form.email}
                            onChange={(event) => update("email", event.target.value)}
                            type="email"
                            required
                        />
                    </div>

                    <label className="mt-3 block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                            {t("public.contact.form.topic")}
                        </span>
                        <select
                            value={form.topic}
                            onChange={(event) => update("topic", event.target.value)}
                            className="focus-ring w-full rounded-lg border border-white/10 bg-[#081120] px-3 py-2.5 text-sm text-white outline-none"
                        >
                            {TOPIC_KEYS.map((key) => (
                                <option key={key} value={key}>
                                    {t(`public.contact.form.${key}`)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="mt-3 block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                            {t("public.contact.form.message")}
                        </span>
                        <textarea
                            value={form.message}
                            onChange={(event) => update("message", event.target.value)}
                            rows={6}
                            required
                            className="focus-ring w-full resize-none rounded-lg border border-white/10 bg-[#081120] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                            placeholder={t("public.contact.form.placeholder")}
                        />
                    </label>

                    <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-xs font-black text-white">{topicLabel}</p>
                        <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">
                            {form.message || t("public.contact.form.placeholder")}
                        </p>
                    </div>

                    <button
                        type="submit"
                        aria-disabled={!ready}
                        className="ui-btn-primary mt-4 w-full px-4 py-2.5 aria-disabled:opacity-60"
                    >
                        <Send size={16} />
                        {t("public.contact.form.submit")}
                    </button>
                </form>
            </section>
        </div>
    );
}

function ContactFact({ icon: Icon, title, text }) {
    return (
        <article className="rounded-lg border border-white/10 bg-white/5 p-4">
            <Icon size={17} className="text-cyan-300" />
            <h2 className="mt-2 truncate text-sm font-black text-white">{title}</h2>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{text}</p>
        </article>
    );
}

function Field({ label, ...props }) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                {label}
            </span>
            <input
                {...props}
                className="focus-ring w-full rounded-lg border border-white/10 bg-[#081120] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder={label}
            />
        </label>
    );
}

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

export default Contact;
