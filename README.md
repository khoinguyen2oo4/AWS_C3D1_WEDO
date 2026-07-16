<h1 align="center">🏢 WeDo Workspace</h1>

<h3 align="center">Nền tảng Quản lý Không gian làm việc cộng tác trên AWS Cloud</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AWS_ECS-Fargate-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS ECS" />
  <img src="https://img.shields.io/badge/MySQL-RDS-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
</p>

<p align="center">
  <a href="https://khoinguyen2oo4.github.io/AWS_C3D1_WEDO/"><strong>🌐 Báo cáo Workshop cá nhân</strong></a> | 
  <a href="https://drive.google.com/file/d/19jLMrXjSZSN6gKfXB3MJ4Kub92MRf-f-/view?usp=sharing"><strong>🎥 Video Demo</strong></a> | 
  <a href="https://tinyurl.com/Wedo-c3d1"><strong>🚀 Trải nghiệm WeDo Workspace</strong></a>
</p>

---

## 📖 Tổng quan dự án (Executive Summary)

Việc quản lý dự án và làm việc nhóm thường gặp nhiều khó khăn do dữ liệu bị phân tán trên các công cụ rời rạc, khiến việc theo dõi tiến độ trở nên thủ công và dễ sai sót.

**WeDo Workspace** giải quyết bài toán này bằng cách cung cấp một không gian làm việc tập trung. Hệ thống kết hợp sức mạnh của Frontend **ReactJS** và Backend **Spring Boot**, được đóng gói hoàn toàn bằng Docker và vận hành trên hạ tầng **AWS Cloud**. Khác với các mô hình đơn giản, dự án này được thiết kế với kiến trúc **Đa vùng sẵn sàng (Multi-AZ)**, đảm bảo tính High Availability, tự động mở rộng theo tải và bảo mật tối đa từ ngoài rìa vào tận lõi cơ sở dữ liệu.

Đây là dự án Capstone trong khuôn khổ kỳ thực tập **AWS First Cloud AI Journey (FCAJ) - Workforce Bootcamp 2026**, thể hiện năng lực triển khai toàn diện từ thiết kế kiến trúc hạ tầng đến vận hành thực tế.

---

## 🏗️ Kiến trúc Hệ thống (System Architecture)

Luồng dữ liệu bắt đầu từ Client kết nối qua CloudFront (CDN/WAF) → S3 (Static Hosting). Các API Request đi qua Application Load Balancer (ALB) → Cụm Container Spring Boot chạy trên ECS Fargate trong Private Subnet → Tương tác với Database Amazon RDS (Multi-AZ) và hệ thống lưu trữ EFS/S3.

**Các quyết định thiết kế cốt lõi:**

| Thành phần | Công nghệ | Lý do thiết kế (Design Rationale) |
| :--- | :--- | :--- |
| **Frontend** | ReactJS + S3 + CloudFront | Phân phối nội dung tĩnh siêu tốc toàn cầu qua mạng biên (Edge caching), tích hợp sẵn WAF để chống tấn công web. |
| **Load Balancing** | Application Load Balancer (ALB) | Phân tải lưu lượng thông minh ở Layer 7, tiếp nhận HTTPS request và định tuyến an toàn vào các Private Subnet. |
| **Compute Core** | AWS ECS (Fargate) + Spring Boot | Serverless Container tự động quản lý tài nguyên máy chủ. Tự động mở rộng (Auto-scaling) khi lưu lượng tăng đột biến. |
| **Database** | Amazon RDS (MySQL) Multi-AZ | Đảm bảo High Availability (Sẵn sàng cao). Dữ liệu tự động đồng bộ sang một Availability Zone khác làm bản dự phòng. |
| **Storage** | Amazon EFS & S3 | Cung cấp ổ đĩa mạng dùng chung (Shared file system) cho các container để lưu trữ báo cáo đính kèm an toàn. |
| **Security** | VPC, NAT Gateway, Secrets Manager | Cách ly hoàn toàn Database và Backend khỏi Internet. Mật khẩu DB được mã hóa và tự động xoay vòng. |

---

## 🔍 Phân tích đa góc nhìn (Dual-Perspective Analysis)

Dự án được phát triển theo mô hình **T-shaped Engineer**: Kết hợp kỹ năng thực thi kỹ thuật chuyên sâu và tư duy mang lại giá trị kinh doanh.

**🛠️ Góc nhìn Kỹ sư Đám mây (Cloud Engineer Lens)**
* **Bảo mật mạng:** Thiết kế VPC chặt chẽ với Public/Private Subnets. Backend và Database tuyệt đối không có Public IP.
* **Tối ưu kết nối nội bộ:** Sử dụng VPC Endpoints (PrivateLink) để gọi các dịch vụ như Secrets Manager, CloudWatch mà không cần đi qua NAT Gateway, giúp giảm chi phí truyền tải.
* **Quản lý mật khẩu (Zero-hardcode):** Loại bỏ hoàn toàn việc lưu trữ mật khẩu trong mã nguồn Spring Boot bằng cách cấp IAM Role để ứng dụng tự động gọi Secrets Manager.

**💡 Góc nhìn Phân tích Kinh doanh (BA/SA Lens)**
* **Trải nghiệm người dùng:** Giảm thiểu độ trễ tải trang xuống mức thấp nhất nhờ mạng lưới CDN toàn cầu của CloudFront.
* **Chi phí vận hành:** Tối ưu hóa ngân sách bằng cách cấu hình ECS Fargate linh hoạt, chỉ tính phí dựa trên lượng vCPU và RAM thực tế tiêu thụ thay vì duy trì máy chủ ảo 24/7.
* **Quản trị rủi ro:** Hệ thống tự động cảnh báo (CloudWatch Alarms) khi tài nguyên CPU vượt quá ngưỡng 80%, giúp quản trị viên can thiệp trước khi hệ thống gián đoạn.

---

## 📁 Cấu trúc Kho lưu trữ (Repository Structure)

```text
AWS_C3D1_WEDO/
├── 1-Worklog/                # Nhật ký công việc và tiến độ thực tập
├── 2-Proposal/               # Đề xuất dự án & thiết kế kiến trúc hệ thống
├── 3-BlogsPosted/            # Tổng hợp bài viết công nghệ đã xuất bản
├── 4-EventParticipated/      # Các sự kiện chuyên ngành đã tham gia
├── 5-Workshop/               # Tài liệu hướng dẫn triển khai hệ thống (10 Modules)
├── 6-Self-evaluation/        # Tự đánh giá năng lực
├── 7-Feedback/               # Đóng góp ý kiến
└── README.md                 # Executive Summary (Bạn đang xem file này)

``` ---

👤 Thông tin Tác giả
Nguyễn Đình Khôi — Sinh viên Ngành Công nghệ thông tin, Đại học Công nghệ TP.HCM (HUTECH) - Lớp 22DTHA1.
Đam mê theo đuổi con đường Cloud/AI Engineer, kết hợp giữa tư duy phân tích hệ thống và kỹ năng thực chiến hạ tầng trên nền tảng điện toán đám mây.

📧 Email: khoinguyen0014@gmail.com

🏢 Thực tập: AWS First Cloud AI Journey (FCAJ) — Workforce Bootcamp

🗓️ Thời gian: 17/04/2026 – 30/07/2026

Built with ❤️ on AWS Cloud · Documented as Code