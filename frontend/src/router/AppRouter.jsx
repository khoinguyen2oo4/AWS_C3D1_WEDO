import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "../public/pages/Home";
import Pricing from "../public/pages/Pricing";
import About from "../public/pages/About";
import Contact from "../public/pages/Contact";
import Login from "../auth/pages/Login";
import Register from "../auth/pages/Register";
import ForgotPassword from "../auth/pages/ForgotPassword";
import ResetPassword from "../auth/pages/ResetPassword";
import UserDashboard from "../user/pages/UserDashboard";
import WorkspaceLayout from "../user/layouts/WorkspaceLayout";
import ProjectLayout from "../user/layouts/ProjectLayout";
import ProjectRoom from "../user/pages/ProjectRoom";
import ProjectTask from "../user/pages/ProjectTask";
import ProjectPerformance from "../user/pages/ProjectPerformance";
import ProjectMembers from "../user/pages/ProjectMembers";
import ProjectChat from "../user/pages/ProjectChat";
import ProjectFiles from "../user/pages/ProjectFiles";
import ProjectInvite from "../user/pages/ProjectInvite";
import ProjectSettings from "../user/pages/ProjectSettings";
import ProjectAI from "../user/pages/ProjectAI";
import RequireAuth from "../shared/routes/RequireAuth";
import RequireRole from "../shared/routes/RequireRole";
import PublicLayout from "../shared/layouts/PublicLayout";
import NotFound from "../shared/pages/NotFound";
import Forbidden from "../shared/pages/Forbidden";
import ServerError from "../shared/pages/ServerError";
import AdminLayout from "../admin/layouts/AdminLayout";
import AdminDashboard from "../admin/pages/AdminDashboard";
import AdminProjects from "../admin/pages/AdminProjects";
import AdminUsers from "../admin/pages/AdminUsers";
import AdminReports from "../admin/pages/AdminReports";
import AdminActivity from "../admin/pages/AdminActivity";
import AdminSystem from "../admin/pages/AdminSystem";
import AdminBilling from "../admin/pages/AdminBilling";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<RequireAuth />}>
                    <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
                    <Route path="/workspace" element={<Navigate to="/workspace/dashboard" replace />} />

                    <Route element={<WorkspaceLayout />}>
                        <Route path="/user/dashboard" element={<UserDashboard />} />
                        <Route path="/workspace/dashboard" element={<UserDashboard />} />
                    </Route>

                    <Route path="/project/:id" element={<ProjectLayout />}>
                        <Route index element={<ProjectRoom />} />
                        <Route path="tasks" element={<ProjectTask />} />
                        <Route path="performance" element={<ProjectPerformance />} />
                        <Route path="members" element={<ProjectMembers />} />
                        <Route path="chat" element={<ProjectChat />} />
                        <Route path="files" element={<ProjectFiles />} />
                        <Route path="invite" element={<ProjectInvite />} />
                        <Route path="settings" element={<ProjectSettings />} />
                        <Route path="ai" element={<ProjectAI />} />
                    </Route>
                </Route>

                <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="projects" element={<AdminProjects />} />
                        <Route path="subscriptions" element={<AdminBilling mode="subscriptions" />} />
                        <Route path="payments" element={<AdminBilling mode="payments" />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="logs" element={<Navigate to="/admin/activity" replace />} />
                        <Route path="system" element={<AdminSystem />} />
                        <Route path="activity" element={<AdminActivity />} />
                    </Route>
                </Route>

                <Route path="/403" element={<Forbidden />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/500" element={<ServerError />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;
