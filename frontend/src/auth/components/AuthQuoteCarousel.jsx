import { useEffect, useMemo, useState } from "react";
import { Quote } from "lucide-react";
import { useI18n } from "../../shared/i18n/useI18n";
import en from "../../shared/i18n/locales/en";
import vi from "../../shared/i18n/locales/vi";

function AuthQuoteCarousel({ intervalMs = 6000 }) {
    const { locale } = useI18n();
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    const quotes = useMemo(() => {
        return (locale === "en" ? en.auth?.quotes : vi.auth?.quotes) || [];
    }, [locale]);

    useEffect(() => {
        if (quotes.length === 0) return undefined;

        let transitionTimer;
        const timer = window.setInterval(() => {
            setVisible(false);
            transitionTimer = window.setTimeout(() => {
                setIndex((current) => (current + 1) % quotes.length);
                setVisible(true);
            }, 320);
        }, intervalMs);

        return () => {
            window.clearInterval(timer);
            window.clearTimeout(transitionTimer);
        };
    }, [quotes.length, intervalMs]);

    if (quotes.length === 0) return null;

    const quote = quotes[index % quotes.length];

    return (
        <figure
            className={`auth-quote transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
        >
            <Quote size={16} className="auth-quote-icon shrink-0" aria-hidden />
            <blockquote>
                <p className="text-sm leading-relaxed md:text-base">&ldquo;{quote.text}&rdquo;</p>
                <figcaption className="mt-2 text-xs font-semibold tracking-wide opacity-80">
                    — {quote.author}
                </figcaption>
            </blockquote>
        </figure>
    );
}

export default AuthQuoteCarousel;
