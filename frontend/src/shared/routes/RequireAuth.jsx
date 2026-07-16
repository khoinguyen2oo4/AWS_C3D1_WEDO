import { Navigate, Outlet } from "react-router-dom";

function RequireAuth() {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const accountStatus = (localStorage.getItem("accountStatus") || "").toUpperCase();

    if (!token && !refreshToken) {
        return <Navigate to="/login" replace />;
    }

    if (accountStatus && accountStatus !== "ACTIVE") {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}

export default RequireAuth;
