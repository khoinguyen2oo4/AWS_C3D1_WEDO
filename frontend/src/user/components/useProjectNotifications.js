import { useEffect, useState } from "react";
import { getProjectNotificationStreamUrl } from "../../services/projectService";

function parseNotificationPayload(raw) {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export default function useProjectNotifications(projectId, t) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!projectId) return undefined;

        const controller = new AbortController();
        const token = localStorage.getItem("token");
        if (!token) return undefined;

        const handleNotification = (raw) => {
            const payload = parseNotificationPayload(raw);
            if (!payload?.type) return;

            const data = payload.data || {};
            let message = payload.type;

            if (payload.type === "TASK_TRANSFERRED") {
                message = t("features.notifications.taskTransferred", {
                    title: data.taskTitle || "",
                });
            } else if (payload.type === "SUBMISSION_REVIEWED") {
                message = t("features.notifications.submissionReviewed", {
                    title: data.taskTitle || "",
                    status: data.status || "",
                });
            } else if (payload.type === "COMMENT_ADDED") {
                message = t("features.notifications.commentAdded");
            } else if (payload.type === "DEADLINE_REMINDER") {
                message = `Deadline: ${data.taskTitle || ""} - ${data.dueDate || ""}`;
            }

            setItems((current) => [
                {
                    id: `${payload.type}-${payload.timestamp || Date.now()}`,
                    type: payload.type,
                    message,
                    data,
                    at: payload.timestamp || new Date().toISOString(),
                },
                ...current,
            ].slice(0, 20));
        };

        const connect = async () => {
            try {
                const response = await fetch(getProjectNotificationStreamUrl(projectId), {
                    headers: {
                        Accept: "text/event-stream",
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });
                if (!response.ok || !response.body) return;

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (!controller.signal.aborted) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true }).replaceAll("\r\n", "\n");

                    let boundary = buffer.indexOf("\n\n");
                    while (boundary >= 0) {
                        const block = buffer.slice(0, boundary);
                        buffer = buffer.slice(boundary + 2);
                        const eventName = block.split("\n")
                            .find((line) => line.startsWith("event:"))
                            ?.slice(6)
                            .trim();
                        const data = block.split("\n")
                            .filter((line) => line.startsWith("data:"))
                            .map((line) => line.slice(5).trimStart())
                            .join("\n");
                        if (eventName === "notification") handleNotification(data);
                        boundary = buffer.indexOf("\n\n");
                    }
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.warn("Project notification stream disconnected");
                }
            }
        };

        void connect();
        return () => controller.abort();
    }, [projectId, t]);

    return items;
}
