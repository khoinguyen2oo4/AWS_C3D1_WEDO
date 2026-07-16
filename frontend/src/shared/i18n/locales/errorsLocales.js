export const errorsLocales = {
    vi: {
        errors: {
            notFound: {
                title: "404 — Không tìm thấy trang",
                description: "Đường dẫn bạn mở không tồn tại hoặc đã bị đổi.",
                home: "Về trang chủ",
                login: "Đăng nhập",
            },
            forbidden: {
                title: "403 — Không có quyền",
                description: "Tài khoản của bạn không được phép vào khu vực này.",
                home: "Về trang chủ",
            },
            server: {
                title: "500 — Lỗi máy chủ",
                description: "Hệ thống gặp sự cố. Thử lại sau hoặc liên hệ quản trị.",
                retry: "Thử lại",
            },
            page: { defaultAction: "Quay về trang chủ" },
            requireAuth: "Bạn cần đăng nhập để tiếp tục.",
            requireRole: "Bạn không có quyền truy cập trang này.",
        },
    },
    en: {
        errors: {
            notFound: {
                title: "404 — Page not found",
                description: "The URL does not exist or has changed.",
                home: "Back to home",
                login: "Sign in",
            },
            forbidden: {
                title: "403 — Forbidden",
                description: "Your account is not allowed to access this area.",
                home: "Back to home",
            },
            server: {
                title: "500 — Server error",
                description: "Something went wrong. Try again later or contact an admin.",
                retry: "Retry",
            },
            page: { defaultAction: "Back to home" },
            requireAuth: "Please sign in to continue.",
            requireRole: "You do not have permission to view this page.",
        },
    },
};
