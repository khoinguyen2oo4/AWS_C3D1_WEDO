---
title : "Giới thiệu"
date : 2024-01-01 
weight : 1
chapter : false
pre : " <b> 5.1. </b> "
---

Thiết kế tổng thể và định hướng của dự án **WeDo Workspace**.

### 5.1.1. Overview & Project Goals (Tổng quan & Mục tiêu)
**WeDo Workspace** là một nền tảng quản lý không gian làm việc cộng tác (collaboration workspace). Dự án được sinh ra để giải quyết bài toán phân tán dữ liệu và khó khăn trong việc theo dõi tiến độ khi làm việc nhóm qua các công cụ rời rạc như Zalo, Messenger hay Google Drive. 

**Mục tiêu cốt lõi:**
* Cung cấp không gian tập trung để tạo dự án, chia task và nộp file báo cáo.
* Triển khai hệ thống hoàn toàn trên hạ tầng **AWS Cloud chuẩn doanh nghiệp**.
* Tối ưu hóa chi phí vận hành nhưng vẫn đảm bảo tính linh hoạt và khả năng mở rộng.

### 5.1.2. Containerized Architecture & Data Flow (Kiến trúc Container)
Khác với các ứng dụng nguyên khối (Monolith) chạy trên máy chủ vật lý truyền thống, WeDo áp dụng kiến trúc **Containerization** hiện đại:
* **Frontend:** Ứng dụng ReactJS/NextJS được build thành file tĩnh, lưu trữ trên **Amazon S3** và phân phối siêu tốc toàn cầu qua mạng lưới CDN của **Amazon CloudFront**.
* **Backend:** Lõi logic viết bằng Java Spring Boot được đóng gói thành Docker Container, vận hành trên **Amazon ECS (Fargate)** hoàn toàn tự động, không cần quản lý máy chủ ảo EC2.

### 5.1.3. Detailed System Design (Thiết kế hệ thống chi tiết)
Hệ thống được thiết kế theo chuẩn **Multi-AZ (Đa vùng sẵn sàng)** để đảm bảo tính High Availability (Sẵn sàng cao):
1. **Network Layer:** Phân lập rõ ràng giữa Public Subnet (chứa Load Balancer, NAT Gateway) và Private Subnet (chứa ECS Container, RDS Database).
2. **Data Layer:** Cơ sở dữ liệu quan hệ Amazon RDS được đặt sâu trong Private Subnet, ngăn chặn hoàn toàn truy cập trực tiếp từ Internet. File đính kèm tải lên được lưu trực tiếp vào một S3 Bucket bảo mật.
3. **Security Layer:** Tích hợp AWS Secrets Manager để giấu các biến môi trường nhạy cảm.

### 5.1.4. Operations & Deployment Strategy (Chiến lược triển khai & Vận hành)
* **CI/CD:** Hình ảnh Docker của Backend được tự động build và đẩy lên kho chứa **Amazon ECR**.
* **Monitoring:** Mọi log hoạt động của hệ thống, lỗi API đều được đẩy về **Amazon CloudWatch** để giám sát.
* **Scaling:** ECS Service được cấu hình để tự động mở rộng (Auto-scaling) số lượng Container khi lượng truy cập tăng đột biến.

### 5.1.5. Business Assessment & Vision (Đánh giá giá trị thực tiễn)
WeDo Workspace không chỉ là một ứng dụng đồ án thông thường. Việc triển khai thành công hệ thống này minh chứng cho khả năng áp dụng kiến trúc Cloud thực chiến vào giải quyết bài toán doanh nghiệp, phục vụ lượng lớn người dùng với chi phí vận hành cực kỳ tối ưu.

### 5.1.6. Phân công nhóm (Team Assignment)
Dự án được thực hiện bởi nhóm 5 thành viên, sử dụng chung 1 tài khoản AWS (Shared Account) để triển khai:

| Thành viên | Khu vực đảm nhiệm (Workshop Sections) | Module tương ứng |
| :--- | :--- | :--- |
| **Khôi** | Quản lý Backend Core (Spring Boot + ECS) & Triển khai hệ thống (Go-Live) | 5, 9 |
| **Anh** | Phát triển Frontend (React/Next.js) & Tích hợp giao diện Web | 6 |
| **Nam** | Thiết lập Cơ sở dữ liệu (RDS MySQL) & Hệ thống lưu trữ (S3/EFS) | 4 |
| **Việt** | Hạ tầng mạng (VPC, Subnets, IAM) & Dọn dẹp tài nguyên (Cleanup) | 3, 10 |
| **Hoà** | Định tuyến (Route 53), Bảo mật biên (WAF/CloudFront) & Giám sát (CloudWatch) | 7, 8 |

*(Ghi chú: Các Module 1, 2, 12 được cả nhóm cùng phối hợp thực hiện).*

### 5.1.7. Luồng xử lý thực tế (Production Flow)
![Kiến trúc WeDo Workspace](/images/2-Proposal/Blog_Wedo_KT.jpg)

**Chú thích các bước trên sơ đồ:**
1. **DNS Resolution**: Phân giải tên miền qua Route 53.
2. **WAF Protection**: Bảo vệ hệ thống khỏi các cuộc tấn công web độc hại.
3. **Edge Routing**: Định tuyến tại lớp viền siêu tốc độ.
4. **Serve Static Assets**: Phân phối giao diện Frontend tĩnh từ S3 qua CloudFront.
5. **API Routing**: Cân bằng tải và định tuyến API qua Application Load Balancer.
6. **Backend Processing**: Xử lý logic nghiệp vụ tại các Container ECS (Spring Boot).
7. **Database & File Storage**: Lưu trữ dữ liệu quan hệ (RDS) và file đính kèm (S3/EFS).
8. **Outbound Access**: Truy cập Internet một chiều qua NAT Gateway để tải bản cập nhật.
9. **Security & Observability**: Quản lý bảo mật (Secrets Manager) và giám sát hệ thống (CloudWatch).

**Diễn giải luồng đi của dữ liệu chi tiết (Request Flow):**
```ini
Client Browser (Người dùng)
    │
    ├──> CloudFront (CDN) ──> Amazon S3 (Trình chiếu giao diện Web tĩnh)
    │
    └──> (Gọi API / Nộp báo cáo)
         ↓ Route 53 (Phân giải tên miền)
         ↓ AWS WAF (Tường lửa lọc request độc hại)
         ↓ Application Load Balancer (Cân bằng tải)
         ↓ Amazon ECS (Fargate Containers chạy Spring Boot trong Private Subnet)
         ├─ AuthController (Xác thực JWT Token)
         ├─ Project/TaskController ──> Amazon RDS (Lưu & truy xuất DB)
         ├─ FileController ──> Amazon S3 (Upload/Download tài liệu trực tiếp)
         └─ Amazon CloudWatch (Thu thập logs hệ thống)