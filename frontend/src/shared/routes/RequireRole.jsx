import { Navigate, Outlet } from "react-router-dom";

function RequireRole({ allowedRoles = [] }) {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const role = (localStorage.getItem("role") || "").toUpperCase();
    const accountStatus = (localStorage.getItem("accountStatus") || "").toUpperCase();

    if (!token && !refreshToken) {
        return <Navigate to="/login" replace />;
    }

    if (accountStatus && accountStatus !== "ACTIVE") {
        return <Navigate to="/403" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.map((item) => item.toUpperCase()).includes(role)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
}

export default RequireRole;
