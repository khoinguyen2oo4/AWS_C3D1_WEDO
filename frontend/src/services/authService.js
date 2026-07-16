import api from "./api";

export const register = async ({ fullName, email, password }) => {
    const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
    });

    return response.data;
};

export const login = async ({ email, password }) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};

export const loginWithGoogle = async (credential) => {
    const response = await api.post("/auth/google", { credential });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const requestPasswordReset = async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
};

export const resetPassword = async ({ resetToken, newPassword }) => {
    const response = await api.post("/auth/reset-password", {
        resetToken,
        newPassword,
    });
    return response.data;
};

export const updateProfile = async (payload) => {
    const response = await api.put("/auth/me", payload);
    return response.data;
};

export const changePassword = async (payload) => {
    const response = await api.put("/auth/me/password", payload);
    return response.data;
};
