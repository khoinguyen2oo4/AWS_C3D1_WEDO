/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AlertTriangle, ArrowRight, Bot, Brain, CalendarClock, SendHorizonal, Sparkles } from "lucide-react";
import {
    askProjectAi,
    getProjectActivity,
    getProjectInsight,
    getProjectMembers,
    getProjectPerformance,
    getProjectTasks,
} from "../../services/projectService";
import { useI18n } from "../../shared/i18n/useI18n";
import { WorkspaceErrorState, WorkspaceLoadingState } from "../components/WorkspaceStateView";
import { WorkspacePanel } from "../components/WorkspacePageShell";

function ProjectAI() {
    const { t } = useI18n();
    const { project, currentProjectRole } = useOutletContext();
    const [state, setState] = useState({
        loading: true,
        error: null,
        insight: null,
        performance: null,
        tasks: [],
        members: [],
        activity: [],
    });
    const [chatState, setChatState] = useState({
        input: "",
        loading: false,
        error: null,
        messages: [],
    });

    const load = async () => {
        setState({ loading: true, error: null, insight: null, performance: null, tasks: [], members: [], activity: [] });

        try {
            const [insight, performance, tasks, members, activity] = await Promise.all([
                getProjectInsight(project.id),
                getProjectPerformance(project.id),
                getProjectTasks(project.id),
                getProjectMembers(project.id),
                getProjectActivity(project.id),
            ]);
            setState({ loading: false, error: null, insight, performance, tasks, members, activity });
        } catch (error) {
            setState({ loading: false, error, insight: null, performance: null, tasks: [], members: [], activity: [] });
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project.id]);

    const askAi = async (event) => {
        event.preventDefault();
        const question = chatState.input.trim();
        if (!question) {
            return;
        }

        setChatState((previous) => ({
            ...previous,
            loading: true,
            error: null,
            messages: [...previous.messages, { role: "user", content: question }],
        }));

        try {
            const response = await askProjectAi(project.id, question);
            setChatState((previous) => ({
                ...previous,
                input: "",
                loading: false,
                messages: [...previous.messages, { role: "assistant", content: response?.answer || t("common.none") }],
            }));
        } catch (error) {
            const message = error?.response?.status === 401 || error?.response?.status === 403
                ? t("project.ai.chatAuthError")
                : t("project.ai.chatError");

            setChatState((previous) => ({
                ...previous,
                loading: false,
                error: message,
                messages: [...previous.messages, { role: "assistant", content: message }],
            }));
        }
    };

    const analysis = useMemo(() => {
        const tasks = state.tasks || [];
        const openTasks = tasks.filter((task) => task.status !== "DONE");
        const overdue = openTasks.filter((task) => {
            const due = parseLocalDate(task.dueDate);
            return due && due < startOfDay(new Date());
        }).length;
        const dueSoon = openTasks.filter((task) => {
            const due = parseLocalDate(task.dueDate);
            if (!due) return false;
            const days = Math.round((due.getTime() - startOfDay(new Date()).getTime()) / 86400000);
            return days >= 0 && days <= 3;
        }).length;
        const pendingReview = tasks.filter(
            (task) => task.status === "REVIEW" || task.submissionStatus === "PENDING_REVIEW"
        ).length;
        const unassigned = tasks.filter((task) => !task.assigneeName && !task.assigneeEmail).length;
        const workload = new Map();
        tasks.forEach((task) => {
            const label = task.assigneeName || task.assigneeEmail || t("common.notSet");
            workload.set(label, (workload.get(label) || 0) + 1);
        });

        return {
            overdue,
            dueSoon,
            pendingReview,
            unassigned,
            openTasks: openTasks.length,
            assignees: [...workload.entries()].sort((left, right) => right[1] - left[1]).slice(0, 4),
        };
    }, [state.tasks, t]);

    if (state.loading) {
        return (
            <WorkspaceLoadingState
                title={t("project.ai.loadingTitle")}
                description={t("project.ai.loadingDesc")}
            />
        );
    }

    if (state.error) {
        return (
            <WorkspaceErrorState
                title={t("project.ai.errorTitle")}
                message={t("project.ai.errorDesc")}
                status={state.error?.response?.status}
                onRetry={load}
            />
        );
    }

    const insight = state.insight;
    const performance = state.performance;
    const roleLabel = currentProjectRole === "OWNER"
        ? t("project.ai.roleOwner")
        : currentProjectRole === "CO_OWNER" || currentProjectRole === "MANAGER"
            ? t("project.ai.roleAdmin")
            : t("project.ai.roleMember");

    return (
        <div className="ui-page ui-stagger">
            <section className="ui-stat-grid">
                <Mini label={t("project.ai.overview")} value={insight?.health || performance?.health || "—"} />
                <Mini label={t("project.ai.summary")} value={insight?.focus || performance?.focus || "—"} />
                <Mini
                    label={t("project.performance.completion")}
                    value={`${performance?.completionRate?.toFixed?.(1) ?? performance?.completionRate ?? 0}%`}
                />
                <Mini label={t("project.room.statsMembers")} value={performance?.memberCount ?? state.members.length} />
            </section>

            {insight?.nextAction || performance?.nextAction ? (
                <section className="ui-panel border-cyan-500/10 py-2">
                    <p className="text-[9px] font-bold uppercase text-cyan-400">{t("project.ai.nextAction")}</p>
                    <p className="ui-text-primary mt-0.5 text-xs font-semibold">
                        {insight?.nextAction || performance?.nextAction}
                    </p>
                    <p className="ui-text-faint mt-0.5 text-[11px]">{roleLabel}</p>
                </section>
            ) : null}

            <section className="ui-section-grid ui-section-grid--master-wide">
                <WorkspacePanel title={t("project.ai.detailedAnalysis")} subtitle={t("project.ai.overview")}>
                    <div className="space-y-2">
                        <div className="ui-card">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                                {t("project.ai.summary")}
                            </p>
                            <p className="ui-text-primary mt-2 text-sm leading-6">{insight?.summary || t("common.none")}</p>
                        </div>
                        <div className="ui-card">
                            <p className="ui-text-faint text-[10px] font-bold uppercase tracking-wider">
                                {t("project.ai.context")}
                            </p>
                            <p className="ui-text-muted mt-2 text-sm leading-6">{insight?.context || t("common.none")}</p>
                        </div>
                    </div>
                </WorkspacePanel>

                <WorkspacePanel title={t("project.ai.riskSignals")} subtitle={t("project.ai.growthTips")}>
                    <div className="space-y-2">
                        {[
                            { label: t("project.ai.openTasks"), value: analysis.openTasks },
                            { label: t("project.ai.overdue"), value: analysis.overdue },
                            { label: t("project.ai.dueSoon"), value: analysis.dueSoon },
                            { label: t("project.ai.pendingReview"), value: analysis.pendingReview },
                            { label: t("project.ai.unassigned"), value: analysis.unassigned },
                        ].map((item) => (
                            <div key={item.label} className="ui-card flex items-center justify-between gap-3">
                                <span className="ui-text-primary text-sm">{item.label}</span>
                                <span className="text-sm font-semibold text-cyan-300">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </WorkspacePanel>
            </section>

            <section className="ui-section-grid ui-section-grid--2">
                <WorkspacePanel title={t("project.ai.workload")} subtitle={t("project.room.statsMembers")}>
                    <div className="space-y-2">
                        {analysis.assignees.length > 0 ? (
                            analysis.assignees.map(([name, count]) => (
                                <div key={name} className="ui-card flex items-center justify-between gap-3">
                                    <span className="ui-text-primary text-sm">{name}</span>
                                    <span className="text-sm font-semibold text-cyan-300">{count} task</span>
                                </div>
                            ))
                        ) : (
                            <p className="ui-text-muted text-sm">{t("project.room.emptyTasks")}</p>
                        )}
                    </div>
                </WorkspacePanel>

                <WorkspacePanel title={t("project.ai.recommendations")} subtitle={t("project.ai.nextAction")}>
                    <div className="space-y-2">
                        {(insight?.recommendations || performance?.signals || []).map((item) => (
                            <div key={item} className="ui-card text-sm leading-6">
                                {item}
                            </div>
                        ))}
                        {(!insight?.recommendations?.length && !performance?.signals?.length) ? (
                            <p className="ui-text-muted text-sm">{t("project.ai.noActivity")}</p>
                        ) : null}
                    </div>
                </WorkspacePanel>
            </section>

            <section className="ui-section-grid ui-section-grid--master-wide">
                <WorkspacePanel title={t("project.ai.recentActivity")} subtitle={t("project.performance.activityLog")}>
                    <div className="space-y-2">
                        {state.activity.length > 0 ? (
                            state.activity.slice(0, 5).map((item) => (
                                <div key={item.id} className="ui-card">
                                    <p className="ui-text-primary text-sm font-semibold">{item.title}</p>
                                    <p className="ui-text-muted mt-1 text-xs">{item.detail || item.actorName || item.actorEmail}</p>
                                </div>
                            ))
                        ) : (
                            <p className="ui-text-muted text-sm">{t("project.ai.noActivity")}</p>
                        )}
                    </div>
                </WorkspacePanel>

                <WorkspacePanel title={t("project.ai.riskSignals")} subtitle={t("project.ai.growthTips")}>
                    <div className="space-y-2">
                        <InsightTile icon={Brain} title={t("project.ai.summary")} text={insight?.summary || t("common.none")} />
                        <InsightTile icon={CalendarClock} title={t("project.ai.dueSoon")} text={`${analysis.dueSoon} ${t("project.ai.dueSoon")}`} />
                        <InsightTile icon={AlertTriangle} title={t("project.ai.overdue")} text={`${analysis.overdue} ${t("project.ai.overdue")}`} />
                    </div>
                </WorkspacePanel>
            </section>

            <section>
                <WorkspacePanel title={t("project.ai.chatTitle")} subtitle={t("project.ai.chatSubtitle")}>
                    <div className="space-y-3">
                        <div className="ui-card text-sm leading-6">
                            {t("project.ai.chatHelper")}
                        </div>
                        
                        {/* Owner-specific quick actions */}
                        {currentProjectRole === "OWNER" || currentProjectRole === "CO_OWNER" || currentProjectRole === "MANAGER" ? (
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: t("project.ai.quickAnalyze"), prompt: "Phân tích chi tiết tình trạng dự án hiện tại và đề xuất hành động cho owner" },
                                    { label: t("project.ai.quickWorkload"), prompt: "Phân tích workload của các thành viên và gợi ý phân công lại" },
                                    { label: t("project.ai.quickRisks"), prompt: "Xác định các rủi ro chính và ưu tiên xử lý" },
                                    { label: t("project.ai.quickAssign"), prompt: "Gợi ý phân công task cho các thành viên dựa trên workload hiện tại" },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        type="button"
                                        onClick={() => setChatState((previous) => ({ ...previous, input: action.prompt }))}
                                        className="ui-btn-ghost text-xs"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        
                        <div className="space-y-2 rounded-lg border border-cyan-400/20 bg-slate-950/40 p-2">
                            {chatState.messages.length > 0 ? (
                                chatState.messages.map((message, index) => (
                                    <div key={`${message.role}-${index}`} className={`rounded-xl px-3 py-2 text-sm ${message.role === "assistant" ? "bg-cyan-400/10 text-slate-100" : "bg-slate-800 text-slate-100"}`}>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                                            {message.role === "assistant" ? t("project.ai.title") : t("project.room.statsMembers")}
                                        </p>
                                        <p className="mt-1 leading-6 whitespace-pre-line">{message.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="ui-text-muted text-sm">{t("project.ai.chatEmpty")}</p>
                            )}
                        </div>
                        <form onSubmit={askAi} className="flex flex-col gap-2 sm:flex-row">
                            <textarea
                                className="ui-input min-h-[72px] flex-1 resize-none text-xs"
                                placeholder={t("project.ai.chatPlaceholder")}
                                value={chatState.input}
                                onChange={(event) => setChatState((previous) => ({ ...previous, input: event.target.value }))}
                            />
                            <button type="submit" className="ui-btn-primary flex items-center justify-center gap-2 self-end sm:self-auto" disabled={chatState.loading}>
                                <SendHorizonal size={16} />
                                {t("project.ai.chatSend")}
                            </button>
                        </form>
                        {chatState.error ? <p className="ui-text-muted text-sm">{t("project.ai.chatError")}</p> : null}
                    </div>
                </WorkspacePanel>
            </section>

            <div className="flex flex-wrap justify-between gap-3">
                <Link to="performance" className="ui-btn-primary">
                    <Sparkles size={16} />
                    {t("nav.performance")}
                </Link>
                <Link to={`/project/${project.id}/tasks`} className="ui-btn-ghost">
                    <Bot size={16} />
                    {t("project.room.tasksLink")}
                    <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}

function Mini({ label, value }) {
    return (
        <div className="ui-stat-card">
            <p className="ui-text-faint text-[9px] font-bold uppercase tracking-wider">{label}</p>
            <h3 className="ui-text-primary mt-0.5 truncate text-sm font-bold">{value}</h3>
        </div>
    );
}

function InsightTile({ icon: Icon, title, text }) {
    return (
        <div className="ui-card flex gap-2">
            <div className="mt-0.5 rounded-md bg-cyan-400/10 p-1.5 text-cyan-300">
                <Icon size={14} />
            </div>
            <div>
                <p className="ui-text-primary text-xs font-semibold">{title}</p>
                <p className="ui-text-muted mt-0.5 text-xs">{text}</p>
            </div>
        </div>
    );
}

function parseLocalDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

export default ProjectAI;
