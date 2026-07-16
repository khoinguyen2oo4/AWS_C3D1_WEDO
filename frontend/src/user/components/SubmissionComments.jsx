/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { addSubmissionComment, getSubmissionComments } from "../../services/projectService";
import useToast from "../../shared/components/toast/useToast";
import { useI18n } from "../../shared/i18n/useI18n";
import { formatDateTime } from "./projectHelpers";

function renderMentions(content = "") {
    const parts = content.split(/(@[\w.+-]+@[\w.-]+\.\w+|@\S+)/g);
    return parts.map((part, index) => {
        if (part.startsWith("@")) {
            return (
                <span key={`${part}-${index}`} className="font-semibold text-cyan-300">
                    {part}
                </span>
            );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
    });
}

function SubmissionComments({ projectId, submissionId, members = [] }) {
    const { t, locale } = useI18n();
    const toast = useToast();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);

    const load = async () => {
        if (!submissionId) return;
        setLoading(true);
        try {
            const data = await getSubmissionComments(projectId, submissionId);
            setComments(data);
        } catch {
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, submissionId]);

    const send = async () => {
        if (!content.trim() || sending) return;
        setSending(true);
        try {
            const saved = await addSubmissionComment(projectId, submissionId, content.trim());
            setComments((current) => [...current, saved]);
            setContent("");
            toast.success(t("features.comments.sent"));
        } catch (error) {
            toast.error(error?.response?.data?.message || t("features.comments.sendFailed"));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {loading ? (
                    <p className="ui-text-muted text-xs">{t("common.loading")}</p>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <article
                            key={comment.id}
                            className="rounded-lg border px-2.5 py-2"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <p className="ui-text-faint text-[10px]">
                                {comment.authorName || comment.authorEmail} ·{" "}
                                {formatDateTime(comment.createdAt, locale)}
                            </p>
                            <p className="ui-text-primary mt-1 whitespace-pre-wrap text-xs leading-5">
                                {renderMentions(comment.content)}
                            </p>
                        </article>
                    ))
                ) : (
                    <p className="ui-text-muted text-xs">{t("features.comments.empty")}</p>
                )}
            </div>

            <div
                className="shrink-0 border-t pt-3"
                style={{ borderColor: "var(--color-border)" }}
            >
                <div className="flex items-end gap-2">
                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        rows={2}
                        className="ui-textarea focus-ring min-h-[68px] flex-1 resize-none text-sm"
                        placeholder={t("features.comments.placeholder")}
                    />
                    <button
                        type="button"
                        onClick={send}
                        disabled={sending || !content.trim()}
                        className="ui-btn-primary h-[42px] shrink-0 px-3 disabled:opacity-50"
                        title={t("features.comments.send")}
                    >
                        <Send size={15} />
                        <span className="hidden sm:inline">{t("features.comments.send")}</span>
                    </button>
                </div>
                <p className="ui-text-faint mt-1 truncate text-[10px]">
                    {t("features.comments.mentionHint")}
                    {members.length > 0
                        ? ` — ${members
                              .slice(0, 4)
                              .map((member) => `@${member.memberEmail?.split("@")[0] || member.memberName}`)
                              .join(", ")}`
                        : ""}
                </p>
            </div>
        </div>
    );
}

export default SubmissionComments;
