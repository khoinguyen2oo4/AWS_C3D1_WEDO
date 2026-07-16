import api from "./api";

export const createProject = async (projectName) => {
    const response = await api.post("/project/create", {
        projectName,
    });

    return response.data;
};

export const joinProject = async (inviteCode) => {
    const response = await api.post("/project/join", {
        inviteCode,
    });

    return response.data;
};

export const getDashboardProjects = async () => {
    const response = await api.get("/project/dashboard");
    return response.data;
};

export const getProjectById = async (id) => {
    const response = await api.get(`/project/${id}`);
    return response.data;
};

export const getProjectMembers = async (id) => {
    const response = await api.get(`/project/${id}/members`);
    return response.data;
};

export const getProjectTasks = async (id) => {
    const response = await api.get(`/project/${id}/tasks`);
    return response.data;
};

export const getProjectActivity = async (id) => {
    const response = await api.get(`/project/${id}/activity`);
    return response.data;
};

export const createProjectTask = async (id, payload) => {
    const response = await api.post(`/project/${id}/tasks`, payload);
    return response.data;
};

export const updateProjectTask = async (id, taskId, payload) => {
    const response = await api.put(`/project/${id}/tasks/${taskId}`, payload);
    return response.data;
};

export const deleteProjectTask = async (id, taskId) => {
    const response = await api.delete(`/project/${id}/tasks/${taskId}`);
    return response.data;
};

export const submitProjectTaskFile = async (id, taskId, file, note = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("note", note);

    // Không set Content-Type thủ công — axios tự gắn boundary cho multipart
    const response = await api.post(`/project/${id}/tasks/${taskId}/submission`, formData);

    return response.data;
};

export const reviewProjectTaskSubmission = async (id, taskId, payload) => {
    const response = await api.put(`/project/${id}/tasks/${taskId}/submission/review`, payload);
    return response.data;
};

export const downloadProjectTaskSubmission = async (id, taskId) => {
    const response = await api.get(`/project/${id}/tasks/${taskId}/submission/download`, {
        responseType: "blob",
    });

    return response;
};

export const getProjectTaskSubmissions = async (id, taskId) => {
    const response = await api.get(`/project/${id}/tasks/${taskId}/submissions`);
    return response.data;
};

export const getProjectMessages = async (id) => {
    const response = await api.get(`/project/${id}/messages`);
    return response.data;
};

export const sendProjectMessage = async (id, content) => {
    const response = await api.post(`/project/${id}/messages`, { content });
    return response.data;
};

export const updateProjectMessage = async (id, messageId, content) => {
    const response = await api.put(`/project/${id}/messages/${messageId}`, { content });
    return response.data;
};

export const deleteProjectMessage = async (id, messageId) => {
    const response = await api.delete(`/project/${id}/messages/${messageId}`);
    return response.data;
};

export const getProjectAnnouncements = async (id) => {
    const response = await api.get(`/project/${id}/announcements`);
    return response.data;
};

export const createProjectAnnouncement = async (id, payload) => {
    const response = await api.post(`/project/${id}/announcements`, payload);
    return response.data;
};

export const deleteProjectAnnouncement = async (id, announcementId) => {
    const response = await api.delete(`/project/${id}/announcements/${announcementId}`);
    return response.data;
};

export const getProjectPerformance = async (id) => {
    const response = await api.get(`/project/${id}/performance`);
    return response.data;
};

export const getProjectSettings = async (id) => {
    const response = await api.get(`/project/${id}/settings`);
    return response.data;
};

export const updateProjectSettings = async (id, payload) => {
    const response = await api.put(`/project/${id}/settings`, payload);
    return response.data;
};

export const addProjectMember = async (id, payload) => {
    const response = await api.post(`/project/${id}/members`, payload);
    return response.data;
};

export const updateProjectMember = async (id, memberId, payload) => {
    const response = await api.put(`/project/${id}/members/${memberId}`, payload);
    return response.data;
};

export const deleteProjectMember = async (id, memberId) => {
    const response = await api.delete(`/project/${id}/members/${memberId}`);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/project/${id}`);
    return response.data;
};

export const getProjectInsight = async (id) => {
    const response = await api.get(`/project/${id}/ai`);
    return response.data;
};

export const askProjectAi = async (id, question) => {
    const response = await api.post(`/project/${id}/ai/chat`, { question });
    return response.data;
};

export const previewProjectTaskSubmission = async (id, taskId, submissionId = null) => {
    const url = submissionId
        ? `/project/${id}/tasks/${taskId}/submissions/${submissionId}/preview`
        : `/project/${id}/tasks/${taskId}/submission/preview`;
    const response = await api.get(url, { responseType: "blob" });
    return response;
};

export const getSubmissionComments = async (projectId, submissionId) => {
    const response = await api.get(`/project/${projectId}/submissions/${submissionId}/comments`);
    return response.data;
};

export const addSubmissionComment = async (projectId, submissionId, content) => {
    const response = await api.post(`/project/${projectId}/submissions/${submissionId}/comments`, {
        content,
    });
    return response.data;
};

export const searchProject = async (projectId, query) => {
    const response = await api.get(`/project/${projectId}/search`, { params: { q: query } });
    return response.data;
};

export const exportWeeklyReport = async (projectId, format = "excel") => {
    const response = await api.get(`/project/${projectId}/report/weekly`, {
        params: { format },
        responseType: "blob",
    });
    return response;
};

export const getProjectNotificationStreamUrl = (projectId) => {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
    return `${base}/project/${projectId}/notifications/stream`;
};
