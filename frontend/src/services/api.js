import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: apiBaseUrl,
    timeout: 15000,
});

const rawApi = axios.create({
    baseURL: apiBaseUrl,
    timeout: 15000,
});

let refreshPromise = null;

const isPublicAuthRequest = (requestUrl = "") =>
    requestUrl.includes("/auth/login") ||
    requestUrl.includes("/auth/register") ||
    requestUrl.includes("/auth/refresh") ||
    requestUrl.includes("/auth/forgot-password") ||
    requestUrl.includes("/auth/reset-password");

const storeSession = (data) => {
    localStorage.setItem("token", data.token);
    if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
    }
    if (data.email) {
        localStorage.setItem("email", data.email);
    }
    if (data.fullName) {
        localStorage.setItem("fullName", data.fullName);
    }
    if (data.role) {
        localStorage.setItem("role", data.role);
    }
    if (data.accountStatus) {
        localStorage.setItem("accountStatus", data.accountStatus);
    }
};

const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    localStorage.removeItem("accountStatus");
};

const decodeTokenPayload = (token) => {
    try {
        const parts = token.split(".");
        if (parts.length < 2) {
            return null;
        }

        const payload = parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        const padded = `${payload}${"=".repeat((4 - (payload.length % 4)) % 4)}`;
        return JSON.parse(window.atob(padded));
    } catch {
        return null;
    }
};

const isAccessTokenUsable = (token, skewSeconds = 30) => {
    const payload = decodeTokenPayload(token);
    if (!payload?.exp) {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp - skewSeconds > now;
};

const refreshSession = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("Missing refresh token");
    }

    if (!refreshPromise) {
        refreshPromise = rawApi
            .post("/auth/refresh", { refreshToken })
            .then((response) => {
                storeSession(response.data);
                return response.data;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

api.interceptors.request.use(async (config) => {
    const requestUrl = config.url || "";

    if (!isPublicAuthRequest(requestUrl)) {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        let accessToken = token;
        const needsRefresh =
            !accessToken ||
            !isAccessTokenUsable(accessToken);

        if (needsRefresh && refreshToken) {
            try {
                const data = await refreshSession();
                accessToken = data?.token || localStorage.getItem("token");
            } catch (error) {
                clearSession();
                throw error;
            }
        }

        if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || "";
        const status = error.response?.status;

        if (
            (status === 401 || status === 403) &&
            !originalRequest?._retry &&
            !isPublicAuthRequest(requestUrl) &&
            localStorage.getItem("refreshToken")
        ) {
            originalRequest._retry = true;

            try {
                const data = await refreshSession();

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${data.token}`;

                return api(originalRequest);
            } catch (refreshError) {
                clearSession();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
