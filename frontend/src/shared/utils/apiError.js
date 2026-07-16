export function getApiErrorMessage(error, fallback = "Đã có lỗi xảy ra. Vui lòng thử lại.") {
    const data = error?.response?.data;

    if (!data) {
        return fallback;
    }

    if (typeof data === "string") {
        return data;
    }

    if (typeof data === "object") {
        return data.message || data.error || data.detail || fallback;
    }

    return fallback;
}

export function getApiErrorStatus(error) {
    return error?.response?.status ?? null;
}

export function isApiConnectionError(error) {
    return !error?.response && (
        error?.code === "ERR_NETWORK" ||
        error?.code === "ECONNABORTED" ||
        error?.message === "Network Error"
    );
}
