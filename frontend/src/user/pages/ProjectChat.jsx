/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCheck, Edit3, Search, Send, Trash2 } from "lucide-react";
import {
    deleteProjectMessage,
    getProjectMembers,
    getProjectMessages,
    sendProjectMessage,
    updateProjectMessage,
} from "../../services/projectService";
import ConfirmDialog from "../../shared/components/ConfirmDialog";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";
import { useI18n } from "../../shared/i18n/useI18n";
import { formatDateTime, getInitials } from "../components/projectHelpers";

function ProjectChat() {
    const { t, locale } = useI18n();
    const { project } = useOutletContext();
    const emptyDate = t("common.none");
    const currentEmail = localStorage.getItem("email") || "";
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [content, setContent] = useState("");
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [messageQuery, setMessageQuery] = useState("");
    const messageListRef = useRef(null);

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            const [messageData, memberData] = await Promise.all([
                getProjectMessages(project.id),
                getProjectMembers(project.id),
            ]);
            setMessages(messageData);
            setMembers(memberData);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const canManage = (message) => {
        const isOwner = (project.ownerEmail || "").toLowerCase() === currentEmail.toLowerCase();
        const isSender = (message.senderEmail || "").toLowerCase() === currentEmail.toLowerCase();
        return isOwner || isSender;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!content.trim()) return;

        setSaving(true);
        try {
            const saved = editingMessageId
                ? await updateProjectMessage(project.id, editingMessageId, content.trim())
                : await sendProjectMessage(project.id, content.trim());

            setMessages((current) => {
                if (editingMessageId) {
                    return current.map((message) => (message.id === saved.id ? saved : message));
                }
                return [...current, saved];
            });
            setContent("");
            setEditingMessageId(null);
        } catch (err) {
            setError(err);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (message) => {
        setEditingMessageId(message.id);
        setContent(message.content || "");
    };

    const handleDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            await deleteProjectMessage(project.id, confirmDeleteId);
            setMessages((current) => current.filter((message) => message.id !== confirmDeleteId));
            setConfirmDeleteId(null);
        } catch (err) {
            setError(err);
        }
    };

    const sortedMembers = useMemo(() => {
        return [...members].sort((left, right) =>
            (left.memberName || left.memberEmail || "").localeCompare(
                right.memberName || right.memberEmail || ""
            )
        );
    }, [members]);

    const filteredMessages = useMemo(() => {
        const keyword = messageQuery.trim().toLowerCase();
        if (!keyword) return messages;

        return messages.filter((message) =>
            [message.senderName, message.senderEmail, message.content]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword))
        );
    }, [messageQuery, messages]);

    useEffect(() => {
        if (messageQuery.trim()) return;
        const messageList = messageListRef.current;
        if (messageList) messageList.scrollTop = messageList.scrollHeight;
    }, [messageQuery, messages]);

    if (loading) {
        return (
            <WorkspaceLoadingState
                title={t("project.chat.loadingTitle")}
                description={t("project.chat.loadingDesc")}
            />
        );
    }

    if (error) {
        return (
            <WorkspaceErrorState
                title={t("project.chat.errorTitle")}
                message={t("project.chat.errorDesc")}
                status={error?.response?.status}
                onRetry={load}
            />
        );
    }

    return (
        <div className="ui-page">
            <section className="ui-stat-grid md:grid-cols-3">
                <SmallStat label={t("settings.messages")} value={messages.length} />
                <SmallStat label={t("project.room.statsMembers")} value={members.length} />
                <SmallStat label={t("common.owner")} value={project.ownerEmail} />
            </section>

            <section className="ui-section-grid ui-section-grid--master-wide">
                <WorkspacePanel
                    title={t("project.chat.title")}
                    subtitle={`${filteredMessages.length}/${messages.length}`}
                    className="chat-conversation-panel"
                >
                    <div className="chat-search">
                        <label className="ui-field">
                            <Search size={15} className="ui-text-faint shrink-0" />
                            <input
                                value={messageQuery}
                                onChange={(event) => setMessageQuery(event.target.value)}
                                className="ui-input min-w-0 flex-1"
                                placeholder={t("project.chat.searchPlaceholder")}
                            />
                        </label>
                    </div>

                    <div ref={messageListRef} className="chat-message-list">
                        {filteredMessages.length > 0 ? (
                            filteredMessages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    mine={message.senderEmail?.toLowerCase() === currentEmail.toLowerCase()}
                                    canManage={canManage(message)}
                                    locale={locale}
                                    emptyDate={emptyDate}
                                    editLabel={t("common.edit")}
                                    deleteLabel={t("common.delete")}
                                    onEdit={() => handleEdit(message)}
                                    onDelete={() => setConfirmDeleteId(message.id)}
                                />
                            ))
                        ) : (
                            <div className="ui-card border-dashed text-sm leading-6">
                                {t("project.chat.empty")}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="chat-composer">
                        {editingMessageId ? (
                            <div className="chat-editing-state">
                                <span>{t("common.edit")}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingMessageId(null);
                                        setContent("");
                                    }}
                                >
                                    {t("common.cancel")}
                                </button>
                            </div>
                        ) : null}
                        <div className="chat-composer-row">
                            <textarea
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                                rows={2}
                                className="chat-composer-input focus-ring"
                                placeholder={t("project.chat.composePlaceholder")}
                            />
                            <button
                                type="submit"
                                disabled={saving || !content.trim()}
                                className="chat-send-button focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                                title={editingMessageId ? t("common.save") : t("project.chat.send")}
                            >
                                <Send size={17} />
                            </button>
                        </div>
                    </form>
                </WorkspacePanel>

                <WorkspacePanel
                    title={t("project.chat.membersTitle")}
                    subtitle={t("project.chat.membersSubtitle")}
                    className="chat-members-panel"
                >
                    <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
                        {sortedMembers.map((member) => (
                            <div key={member.id} className="ui-card">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xs font-bold text-cyan-200">
                                        {getInitials(member.memberName || member.memberEmail)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="ui-text-primary truncate text-sm font-bold">
                                            {member.memberName || member.memberEmail}
                                        </h3>
                                        <p className="ui-text-muted truncate text-xs">
                                            {member.memberEmail}
                                        </p>
                                    </div>
                                    <span className="ui-text-muted shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase" style={{ borderColor: "var(--color-border)" }}>
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </WorkspacePanel>
            </section>

            <ConfirmDialog
                open={Boolean(confirmDeleteId)}
                title={t("project.chat.deleteTitle")}
                description={t("project.chat.deleteDesc")}
                confirmLabel={t("common.delete")}
                danger
                onConfirm={handleDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
}

function ChatMessage({
    message,
    mine,
    canManage,
    locale,
    emptyDate,
    editLabel,
    deleteLabel,
    onEdit,
    onDelete,
}) {
    return (
        <div className={`chat-message-row ${mine ? "is-mine" : ""}`}>
            {!mine ? (
                <div className="chat-avatar">
                    {getInitials(message.senderName || message.senderEmail)}
                </div>
            ) : null}
            <article className="chat-message-bubble">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="ui-text-primary truncate text-xs font-bold">
                            {message.senderName || message.senderEmail}
                        </h3>
                        <p className="ui-text-muted text-[10px]">
                            {formatDateTime(message.createdAt, locale, emptyDate)}
                        </p>
                    </div>

                    {canManage ? (
                        <div className="chat-message-actions">
                            <button type="button" onClick={onEdit} className="focus-ring" title={editLabel}>
                                <Edit3 size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={onDelete}
                                className="focus-ring text-red-400"
                                title={deleteLabel}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ) : null}
                </div>

                <p className="ui-text-primary mt-1.5 whitespace-pre-line break-words text-xs leading-5">
                    {message.content}
                </p>

                {mine ? (
                    <div className="chat-sent-status">
                        <CheckCheck size={12} />
                    </div>
                ) : null}
            </article>
        </div>
    );
}

function SmallStat({ label, value }) {
    return (
        <div className="ui-stat-card">
            <p className="ui-text-faint text-[9px] font-bold uppercase tracking-wider">{label}</p>
            <p className="ui-text-primary mt-0.5 break-all text-xs font-bold">{value}</p>
        </div>
    );
}

export default ProjectChat;
