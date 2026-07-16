import api from "./api";

export const getAdminSummary = async () => {
    const response = await api.get("/admin/summary");
    return response.data;
};

export const getAdminUsers = async () => {
    const response = await api.get("/admin/users");
    return response.data;
};

export const updateAdminUser = async (id, payload) => {
    const response = await api.put(`/admin/users/${id}`, payload);
    return response.data;
};

export const getAdminProjects = async () => {
    const response = await api.get("/admin/projects");
    return response.data;
};

export const updateAdminProject = async (id, payload) => {
    const response = await api.put(`/admin/projects/${id}`, payload);
    return response.data;
};

export const getAdminProjectMembers = async (id) => {
    const response = await api.get(`/admin/projects/${id}/members`);
    return response.data;
};

export const addAdminProjectMember = async (id, payload) => {
    const response = await api.post(`/admin/projects/${id}/members`, payload);
    return response.data;
};

export const updateAdminProjectMember = async (id, memberId, payload) => {
    const response = await api.put(`/admin/projects/${id}/members/${memberId}`, payload);
    return response.data;
};

export const deleteAdminProjectMember = async (id, memberId) => {
    const response = await api.delete(`/admin/projects/${id}/members/${memberId}`);
    return response.data;
};

export const getAdminActivity = async () => {
    const response = await api.get("/admin/activity");
    return response.data;
};

export const getAdminSystem = async () => {
    const response = await api.get("/admin/system");
    return response.data;
};

export const updateAdminSystemSettings = async (payload) => {
    const response = await api.put("/admin/system/settings", payload);
    return response.data;
};

export const cleanupAdminStorage = async () => {
    const response = await api.post("/admin/system/storage/cleanup");
    return response.data;
};
