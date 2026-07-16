export const AUTH_QUOTES = [
    {
        text: "Một phòng dự án, một nhịp làm việc — task, file và chat không còn rời rạc.",
        author: "C3D1 Workspace",
    },
    {
        text: "Owner giao việc rõ ràng; Member nộp bài đúng hạn — mọi người biết mình đang ở đâu.",
        author: "Triết lý phòng làm việc",
    },
    {
        text: "Deadline không phải áp lực nếu cả team nhìn cùng một bảng tiến độ.",
        author: "Dashboard thông minh",
    },
    {
        text: "Từ mã mời đến phòng dự án chỉ vài giây — bắt đầu hợp tác thật nhanh.",
        author: "Onboarding mượt",
    },
];

export const AUTH_COPY = {
    login: {
        eyebrow: "C3D1 Workspace",
        title: "Chào mừng bạn trở lại",
        subtitle:
            "Đăng nhập để mở phòng dự án, tiếp tục task đang dở và trò chuyện cùng team — mọi thứ vẫn ở đúng chỗ bạn để lại.",
        heroTitle: "Project, task và chat trong một phòng",
        heroText:
            "C3D1 gom công việc, file nộp và trao đổi vào cùng một workspace — bạn biết ai đang làm gì, deadline nào sắp tới.",
        highlights: [
            { label: "Phòng dự án", value: "1 mã — cả team" },
            { label: "Task & file", value: "Giao · Nộp · Duyệt" },
            { label: "Chat", value: "Theo từng phòng" },
        ],
        asideTitle: "Tiếp tục hành trình",
        asideText: "Sau khi xác thực, bạn vào thẳng dashboard và các phòng đã tham gia.",
    },
    register: {
        eyebrow: "Bắt đầu miễn phí",
        title: "Tạo tài khoản mới",
        subtitle:
            "Một lần đăng ký — bạn có workspace riêng: tạo phòng Owner hoặc tham gia bằng mã mời từ đồng đội.",
        heroTitle: "Khởi đầu phòng làm việc của bạn",
        heroText:
            "Dù bạn là người dẫn dắt dự án hay thành viên mới, C3D1 giúp mọi người cùng nhìn tiến độ và deadline.",
        highlights: [
            { label: "Owner", value: "Tạo phòng & giao việc" },
            { label: "Member", value: "Vào bằng mã mời" },
            { label: "Bảo mật", value: "JWT & phân quyền" },
        ],
        asideTitle: "Một tài khoản, nhiều phòng",
        asideText: "Đăng ký xong là vào workspace — không cần thao tác kỹ thuật thêm.",
    },
    forgot: {
        eyebrow: "Khôi phục tài khoản",
        title: "Quên mật khẩu?",
        subtitle:
            "Nhập email đã đăng ký — hệ thống tạo mã đặt lại thật từ backend để bạn đổi mật khẩu an toàn.",
        heroTitle: "Đừng lo, chúng mình giúp",
        heroText:
            "Quy trình khôi phục minh bạch: token có hạn, đổi mật khẩu một lần — rồi đăng nhập lại bình thường.",
        highlights: [
            { label: "Token thật", value: "Từ backend" },
            { label: "Nhanh", value: "Copy & reset" },
            { label: "An toàn", value: "Hết hạn tự động" },
        ],
        asideTitle: "Luồng recovery",
        asideText: "Không dùng dữ liệu giả — mọi bước đều qua API thật.",
    },
    reset: {
        eyebrow: "Mật khẩu mới",
        title: "Đặt lại mật khẩu",
        subtitle:
            "Dán token từ bước quên mật khẩu, chọn mật khẩu mới — xong là đăng nhập lại ngay.",
        heroTitle: "Cánh cửa mới cho tài khoản",
        heroText:
            "Mật khẩu mới được lưu vào hệ thống — phiên cũ không còn hiệu lực, bạn kiểm soát quyền truy cập trở lại.",
        highlights: [
            { label: "Token", value: "Kiểm tra hạn" },
            { label: "Xác nhận", value: "Nhập 2 lần" },
            { label: "Xong", value: "Về đăng nhập" },
        ],
        asideTitle: "Reset thật",
        asideText: "Backend validate token rồi cập nhật password trong database.",
    },
};
