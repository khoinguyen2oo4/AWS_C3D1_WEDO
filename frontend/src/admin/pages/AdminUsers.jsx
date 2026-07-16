/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, Search, ShieldCheck, UsersRound } from "lucide-react";
import { getAdminUsers, updateAdminUser } from "../../services/adminService";
import DarkSelect from "../../shared/components/DarkSelect";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";
import { useI18n } from "../../shared/i18n/useI18n";
import { BarChart, CHART_COLORS, DonutChart, StackedBar } from "../../user/components/DashboardCharts";
import { getInitials } from "../../user/components/projectHelpers";
import AdminPageShell, { AdminPanel } from "../components/AdminPageShell";
import { AdminErrorState, AdminLoadingState } from "../components/AdminStateView";

const ROLE_OPTIONS = [
    { value: "ALL", labelKey: "common.all" },
    { value: "ADMIN", label: "Admin" },
    { value: "USER", labelKey: "common.user" },
];

const EDIT_ROLE_OPTIONS = ROLE_OPTIONS.filter((item) => item.value !== "ALL");

const STATUS_OPTIONS = [
    { value: "ALL", labelKey: "common.all" },
    { value: "ACTIVE", labelKey: "admin.users.accountActive" },
    { value: "LOCKED", labelKey: "admin.users.accountLocked" },
];

const EDIT_STATUS_OPTIONS = STATUS_OPTIONS.filter((item) => item.value !== "ALL");

const USER_CHART_COLORS = [
    "#d946ef",
    CHART_COLORS.progress,
    CHART_COLORS.done,
    CHART_COLORS.review,
    CHART_COLORS.violet,
    "#38bdf8",
];

function AdminUsers() {
    const { t } = useI18n();
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [form, setForm] = useState({ role: "USER", accountStatus: "ACTIVE" });
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAdminUsers();
            setUsers(data);
            setSelectedUserId((current) =>
                current && data.some((user) => user.id === current) ? current : data[0]?.id ?? null
            );
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const roleOptions = useMemo(
        () => ROLE_OPTIONS.map((item) => ({ value: item.value, label: item.label || t(item.labelKey), hint: item.value })),
        [t]
    );
    const editRoleOptions = useMemo(
        () => EDIT_ROLE_OPTIONS.map((item) => ({ value: item.value, label: item.label || t(item.labelKey), hint: item.value })),
        [t]
    );
    const statusOptions = useMemo(
        () => STATUS_OPTIONS.map((item) => ({ value: item.value, label: t(item.labelKey), hint: item.value })),
        [t]
    );
    const editStatusOptions = useMemo(
        () => EDIT_STATUS_OPTIONS.map((item) => ({ value: item.value, label: t(item.labelKey), hint: item.value })),
        [t]
    );

    const filteredUsers = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return users.filter((user) => {
            const role = user.role || "USER";
            const status = user.accountStatus || "ACTIVE";
            const haystack = [user.fullName, user.email, role, status].filter(Boolean).join(" ").toLowerCase();
            const matchQuery = !keyword || haystack.includes(keyword);
            const matchRole = roleFilter === "ALL" || role === roleFilter;
            const matchStatus = statusFilter === "ALL" || status === statusFilter;
            return matchQuery && matchRole && matchStatus;
        });
    }, [query, roleFilter, statusFilter, users]);

    useEffect(() => {
        if (filteredUsers.length === 0) {
            setSelectedUserId(null);
            return;
        }
        if (selectedUserId && !filteredUsers.some((user) => user.id === selectedUserId)) {
            setSelectedUserId(filteredUsers[0].id);
        }
    }, [filteredUsers, selectedUserId]);

    const selectedUser = users.find((user) => user.id === selectedUserId) || null;

    useEffect(() => {
        if (!selectedUser) {
            setForm({ role: "USER", accountStatus: "ACTIVE" });
            return;
        }
        setForm({
            role: selectedUser.role || "USER",
            accountStatus: selectedUser.accountStatus || "ACTIVE",
        });
        setActionError(null);
        setActionMessage(null);
    }, [selectedUser]);

    const analytics = useMemo(() => {
        const roleCounts = users.reduce((result, user) => {
            const key = user.role || "USER";
            result.set(key, (result.get(key) || 0) + 1);
            return result;
        }, new Map());
        const statusCounts = users.reduce((result, user) => {
            const key = user.accountStatus || "ACTIVE";
            result.set(key, (result.get(key) || 0) + 1);
            return result;
        }, new Map());
        const workload = users
            .map((user) => ({
                label: user.fullName || user.email,
                value: (user.taskCount || 0) + (user.messageCount || 0),
            }))
            .sort((left, right) => right.value - left.value)
            .slice(0, 6)
            .map((item, index) => ({ ...item, color: USER_CHART_COLORS[index % USER_CHART_COLORS.length] }));

        return {
            adminUsers: users.filter((user) => user.role === "ADMIN").length,
            lockedUsers: users.filter((user) => user.accountStatus === "LOCKED").length,
            roleItems: [...roleCounts.entries()].map(([label, value], index) => ({
                label,
                value,
                color: USER_CHART_COLORS[index % USER_CHART_COLORS.length],
            })),
            statusItems: [...statusCounts.entries()].map(([label, value], index) => ({
                label,
                value,
                color: USER_CHART_COLORS[index % USER_CHART_COLORS.length],
            })),
            workload,
        };
    }, [users]);

    const stats = useMemo(
        () => [
            { label: t("admin.dashboard.users"), value: users.length, note: t("admin.users.systemRole") },
            { label: "Admin", value: analytics.adminUsers, note: t("admin.users.roleMix"), tone: "text-fuchsia-200" },
            { label: t("admin.users.accountLocked"), value: analytics.lockedUsers, note: t("admin.users.statusMix"), tone: "text-amber-200" },
            { label: t("tasks.filterAll"), value: filteredUsers.length, note: t("admin.users.list") },
        ],
        [analytics.adminUsers, analytics.lockedUsers, filteredUsers.length, t, users.length]
    );

    const handleSave = async (event) => {
        event.preventDefault();
        if (!selectedUser) return;

        setSaving(true);
        setActionError(null);
        setActionMessage(null);
        try {
            const updated = await updateAdminUser(selectedUser.id, form);
            setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
            setActionMessage(t("admin.users.saved"));
        } catch (err) {
            setActionError(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLoadingState
                title={t("admin.users.loadingTitle")}
                description={t("admin.users.desc")}
            />
        );
    }

    if (error) {
        return (
            <AdminErrorState
                title={t("admin.dashboard.errorTitle")}
                message={getApiErrorMessage(error, t("admin.reports.errorDesc"))}
                status={getApiErrorStatus(error)}
                onRetry={load}
            />
        );
    }

    return (
        <AdminPageShell
            eyebrow={t("layout.admin")}
            title={t("admin.users.title")}
            description={t("admin.users.desc")}
            stats={stats}
            actions={
                <button type="button" onClick={load} className="ui-btn-ghost focus-ring">
                    <RefreshCw size={15} />
                    {t("common.refresh")}
                </button>
            }
        >
            <section className="grid gap-4 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(300px,380px)]">
                <AdminPanel title={t("admin.users.list")} subtitle={`${filteredUsers.length}/${users.length}`} scroll>
                    <div className="mb-3 space-y-2">
                        <label className="block">
                            <span className="ui-label">{t("common.search")}</span>
                            <span className="ui-field mt-1">
                                <Search size={14} className="ui-text-faint shrink-0" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="ui-input min-w-0 flex-1"
                                    placeholder={t("admin.users.searchPlaceholder")}
                                />
                            </span>
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                            <DarkSelect
                                label={t("admin.users.filterRole")}
                                value={roleFilter}
                                onChange={setRoleFilter}
                                options={roleOptions}
                                menuWidth="220px"
                            />
                            <DarkSelect
                                label={t("admin.users.filterStatus")}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={statusOptions}
                                menuWidth="220px"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => setSelectedUserId(user.id)}
                                    className={[
                                        "ui-card flex w-full items-center gap-3 text-left",
                                        selectedUser?.id === user.id ? "border-fuchsia-500/35 bg-fuchsia-500/10" : "",
                                    ].join(" ")}
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-400/10 text-xs font-bold text-fuchsia-200">
                                        {getInitials(user.fullName || user.email)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="ui-text-primary block truncate text-sm font-bold">
                                            {user.fullName || user.email}
                                        </span>
                                        <span className="ui-text-faint block truncate text-xs">{user.email}</span>
                                    </span>
                                    <StatusBadge status={user.accountStatus || "ACTIVE"} />
                                </button>
                            ))
                        ) : (
                            <p className="ui-text-muted text-sm">{t("admin.users.empty")}</p>
                        )}
                    </div>
                </AdminPanel>

                <AdminPanel
                    title={selectedUser?.fullName || selectedUser?.email || t("admin.users.detail")}
                    subtitle={t("admin.users.governance")}
                >
                    {selectedUser ? (
                        <div className="space-y-4">
                            <div className="ui-card flex items-start gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-fuchsia-400/10 text-sm font-bold text-fuchsia-200">
                                    {getInitials(selectedUser.fullName || selectedUser.email)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="ui-text-primary truncate text-base font-bold">
                                        {selectedUser.fullName || selectedUser.email}
                                    </h3>
                                    <p className="ui-text-muted truncate text-sm">{selectedUser.email}</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        <Tag icon={ShieldCheck}>{selectedUser.role || "USER"}</Tag>
                                        <Tag icon={UsersRound}>{selectedUser.accountStatus || "ACTIVE"}</Tag>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <DarkSelect
                                        label={t("admin.users.roleLabel")}
                                        value={form.role}
                                        onChange={(value) => setForm((current) => ({ ...current, role: value }))}
                                        options={editRoleOptions}
                                        menuWidth="220px"
                                    />
                                    <DarkSelect
                                        label={t("admin.users.statusLabel")}
                                        value={form.accountStatus}
                                        onChange={(value) =>
                                            setForm((current) => ({ ...current, accountStatus: value }))
                                        }
                                        options={editStatusOptions}
                                        menuWidth="220px"
                                    />
                                </div>

                                <div className="grid gap-2 sm:grid-cols-3">
                                    <Metric label={t("admin.users.rooms")} value={selectedUser.memberships?.length || 0} />
                                    <Metric label={t("admin.users.taskCount")} value={selectedUser.taskCount || 0} />
                                    <Metric label={t("admin.users.messageCount")} value={selectedUser.messageCount || 0} />
                                </div>

                                {actionError ? (
                                    <Alert tone="error">
                                        {getApiErrorMessage(actionError, t("admin.users.saveFailed"))}
                                    </Alert>
                                ) : null}
                                {actionMessage ? <Alert>{actionMessage}</Alert> : null}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="ui-btn-secondary disabled:opacity-50"
                                >
                                    <Save size={15} />
                                    {saving ? t("common.saving") : t("admin.users.saveUser")}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <p className="ui-text-muted text-sm">{t("admin.users.selectUser")}</p>
                    )}
                </AdminPanel>

                <AdminPanel title={t("admin.users.workload")} subtitle={t("admin.users.memberships")} scroll>
                    {selectedUser ? (
                        <div className="space-y-3">
                            <StackedBar
                                items={[
                                    {
                                        label: t("admin.users.taskCount"),
                                        value: selectedUser.taskCount || 0,
                                        color: CHART_COLORS.progress,
                                    },
                                    {
                                        label: t("admin.users.messageCount"),
                                        value: selectedUser.messageCount || 0,
                                        color: CHART_COLORS.violet,
                                    },
                                ]}
                                emptyLabel={t("admin.users.noMemberships")}
                            />
                            <div className="space-y-2">
                                {(selectedUser.memberships || []).length > 0 ? (
                                    selectedUser.memberships.map((room) => (
                                        <article key={room.projectId} className="ui-card">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="ui-text-primary truncate text-sm font-bold">
                                                        {room.projectName}
                                                    </p>
                                                    <p className="ui-text-faint mt-1 truncate text-xs">
                                                        {room.assignedTaskCount} task · {room.messageCount} chat
                                                    </p>
                                                </div>
                                                <span className="shrink-0 rounded-md border border-fuchsia-400/20 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-fuchsia-200">
                                                    {room.role}
                                                </span>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <p className="ui-text-muted text-sm">{t("admin.users.noMemberships")}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="ui-text-muted text-sm">{t("admin.users.selectUser")}</p>
                    )}
                </AdminPanel>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <AdminPanel title={t("admin.users.roleMix")} subtitle={t("admin.users.systemRole")}>
                    <DonutChart
                        items={analytics.roleItems}
                        centerValue={users.length}
                        centerLabel={t("admin.dashboard.users")}
                        emptyLabel={t("admin.users.empty")}
                    />
                </AdminPanel>
                <AdminPanel title={t("admin.users.statusMix")} subtitle={t("admin.users.filterStatus")}>
                    <StackedBar items={analytics.statusItems} emptyLabel={t("admin.users.empty")} />
                </AdminPanel>
                <AdminPanel title={t("admin.users.topWorkload")} subtitle={t("admin.users.workload")}>
                    <BarChart items={analytics.workload} emptyLabel={t("admin.users.empty")} />
                </AdminPanel>
            </section>
        </AdminPageShell>
    );
}

function StatusBadge({ status }) {
    const locked = status === "LOCKED";
    return (
        <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                locked
                    ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
            }`}
        >
            {status}
        </span>
    );
}

function Tag({ icon: Icon, children }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-fuchsia-400/20 bg-fuchsia-400/10 px-2 py-1 text-[10px] font-bold uppercase text-fuchsia-200">
            <Icon size={12} />
            {children}
        </span>
    );
}

function Metric({ label, value }) {
    return (
        <div className="ui-card px-2 py-2">
            <p className="ui-text-faint text-[10px] font-bold uppercase">{label}</p>
            <p className="ui-text-primary mt-1 text-base font-bold tabular-nums">{value}</p>
        </div>
    );
}

function Alert({ children, tone = "success" }) {
    const cls =
        tone === "error"
            ? "border-red-500/20 bg-red-500/10 text-red-100"
            : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
    return <div className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

export default AdminUsers;
