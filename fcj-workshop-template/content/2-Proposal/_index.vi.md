---
title: "Bản đề xuất"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# WeDo Workspace
## Giải pháp AWS Cloud chuẩn doanh nghiệp tối ưu hóa quản lý dự án và không gian làm việc cộng tác

### 1. Tóm tắt điều hành  
**WeDo Workspace** là một nền tảng quản lý dự án và làm việc cộng tác (collaboration workspace) được thiết kế nhằm tối ưu hóa quy trình giao việc, theo dõi tiến độ và lưu trữ tài liệu cho các nhóm làm việc và sinh viên. Hệ thống cung cấp một không gian làm việc tập trung, cho phép người dùng khởi tạo dự án, phân công công việc trực quan, nộp file báo cáo và trao đổi thông tin dễ dàng, giải quyết triệt để tình trạng phân tán và thất lạc dữ liệu trên các công cụ chat truyền thống.

Khác biệt với các ứng dụng thông thường, WeDo được xây dựng dựa trên kiến trúc điện toán đám mây hiện đại của AWS (sử dụng Amazon ECS, cơ sở dữ liệu RDS và lưu trữ S3). Nền tảng áp dụng mô hình phân lập mạng lưới bảo mật và Đa vùng sẵn sàng (Multi-AZ), kết hợp với hệ thống phân quyền chặt chẽ. Điều này không chỉ đảm bảo ứng dụng luôn vận hành ổn định, linh hoạt mở rộng theo số lượng người dùng mà còn bảo mật tuyệt đối dữ liệu của các dự án, mang lại trải nghiệm chuyên nghiệp tiệm cận với các phần mềm quản lý của doanh nghiệp.

### 2. Tuyên bố vấn đề  
*Vấn đề hiện tại*  
Các nhóm sinh viên và dự án nhỏ hiện nay thường phân tán quy trình làm việc qua quá nhiều công cụ rời rạc (Zalo/Messenger để giao việc, Google Drive để nộp file). Điều này dẫn đến việc khó quản lý tiến độ, dễ thất lạc tài liệu báo cáo và không có một hệ thống tập trung để theo dõi công việc thời gian thực. Hơn nữa, các nền tảng quản lý dự án trên thị trường (như Jira, Asana) thường có quá nhiều tính năng phức tạp hoặc đòi hỏi chi phí cao, không phù hợp cho nhu cầu sử dụng của các nhóm quy mô nhỏ.

*Giải pháp*  
Nền tảng WeDo Workspace sử dụng kiến trúc đa vùng (Multi-AZ) trên AWS để cung cấp một không gian làm việc tập trung. Hệ thống sử dụng Amazon ECS để vận hành các container xử lý nghiệp vụ (Backend Spring Boot), Application Load Balancer để cân bằng tải và Amazon RDS để quản lý cơ sở dữ liệu quan hệ. Toàn bộ file báo cáo, tài liệu đính kèm của người dùng được lưu trữ an toàn trên Amazon S3. AWS CloudFront và AWS WAF cung cấp giao diện web tốc độ cao và bảo mật ở lớp viền. Tương tự như Trello hay Basecamp, người dùng có thể tạo dự án, quản lý công việc và nộp file trực tiếp, nhưng nền tảng này được tinh chỉnh tinh gọn hơn, phục vụ chính xác cho nhu cầu làm việc nhóm nội bộ và quản lý đồ án học tập.

*Lợi ích và hoàn vốn đầu tư (ROI)*  
Giải pháp tạo ra một không gian làm việc số tập trung, giúp các thành viên loại bỏ hoàn toàn việc báo cáo tiến độ thủ công hay tìm kiếm tài liệu thất lạc, từ đó đơn giản hóa khâu quản lý và tăng hiệu suất làm việc nhóm. Quan trọng hơn, nền tảng cung cấp một môi trường thực tiễn để sinh viên áp dụng kiến thức triển khai hạ tầng Cloud (AWS) chuẩn doanh nghiệp. Chi phí vận hành hàng tháng được tối ưu hóa ở mức cực thấp nhờ tận dụng AWS Free Tier và kiến trúc container linh hoạt. Do các thiết bị máy tính cá nhân đã có sẵn, dự án không phát sinh chi phí phần cứng. Thời gian "hoàn vốn" được tính ngay trong 1-2 tháng đầu sử dụng nhờ tiết kiệm đáng kể thời gian trao đổi lộn xộn, đồng thời mang lại giá trị vô hình to lớn là điểm số đồ án xuất sắc và kinh nghiệm thực chiến đắt giá cho sự nghiệp kỹ sư sau này.

### 3. Kiến trúc giải pháp  
Nền tảng WeDo Workspace áp dụng kiến trúc Containerization trên AWS với mô hình Đa vùng sẵn sàng (Multi-AZ) để quản lý quy trình làm việc và tài liệu dự án. Giao diện web tĩnh được lưu trữ trên S3 và phân phối siêu tốc qua CloudFront, bảo vệ bởi WAF. Các luồng xử lý API động được điều hướng qua Application Load Balancer (ALB) đến các container Backend (Spring Boot) chạy trên Amazon ECS đặt trong Private Subnet. Dữ liệu hệ thống được lưu trữ an toàn và đồng bộ thông qua Amazon RDS (Cơ sở dữ liệu) và Amazon EFS, trong khi tài liệu nộp của người dùng được đẩy trực tiếp lên S3.

![Wedo_Workspace](images/2-Proposal/Blog_Wedo.jpg)

*Dịch vụ AWS sử dụng*  
- *Amazon Route 53 & AWS WAF*: Phân giải tên miền (DNS) và bảo vệ hệ thống khỏi các cuộc tấn công web độc hại (DDoS, XSS, SQLi).

- *Amazon CloudFront*: Mạng phân phối nội dung (CDN) giúp định tuyến và tải giao diện tĩnh nhanh chóng.

- *Amazon S3*: Đóng vai trò kép: lưu trữ mã nguồn giao diện tĩnh (Frontend) và lưu trữ các file báo cáo, tài liệu đính kèm của người dùng.

- *Application Load Balancer (ALB)*: Tiếp nhận và phân phối đều luồng traffic API đến các container backend, đảm bảo không bị quá tải.

- *Amazon ECS (Elastic Container Service)*: Môi trường vận hành các container chứa logic nghiệp vụ (Backend) với khả năng tự động mở rộng.

- *Amazon RDS & Amazon EFS*: RDS quản lý dữ liệu quan hệ (thông tin user, project, task), trong khi EFS cung cấp hệ thống file dùng chung cho các container.

- *AWS Secrets Manager & CloudWatch*: Quản lý bảo mật các thông tin nhạy cảm (chuỗi kết nối, mật khẩu) và giám sát log, hiệu suất toàn hệ thống.

*Thiết kế thành phần*  
- *Phân phối Giao diện & Bảo mật viền (Frontend & Edge Security)*: Route 53 phân giải DNS, WAF lọc request, và CloudFront phân phối web app từ S3 đến trình duyệt người dùng.

- *Điều hướng & Cân bằng tải (Routing & Load Balancing)*: Internet Gateway cho phép luồng dữ liệu hợp lệ đi vào VPC, sau đó ALB sẽ định tuyến luồng API này vào các Subnet nội bộ.

- *Xử lý Nghiệp vụ (Backend Processing)*: Amazon ECS vận hành các container xử lý dữ liệu. Các container này được đặt sâu trong Private Subnet trải rộng trên 2 Vùng sẵn sàng (AZ-1, AZ-2) để đảm bảo High Availability (tính sẵn sàng cao).

- *Lưu trữ & Truy xuất (Data Storage)*: Cơ sở dữ liệu RDS và hệ thống file EFS được cô lập hoàn toàn trong mạng nội bộ, chỉ cho phép ECS truy cập. File đính kèm tải lên từ web sẽ được lưu thẳng vào S3 bucket dành riêng cho Upload.

- *Bảo mật & Giám sát nội bộ (Security & Observability)*: Thông qua VPC Endpoints, hệ thống kết nối an toàn với Secrets Manager để lấy thông tin xác thực và đẩy dữ liệu đo lường về CloudWatch mà không cần đi vòng ra Internet. NAT Gateway hỗ trợ ECS tải các bản cập nhật hoặc gọi API bên thứ ba khi cần thiết.

### 4. Triển khai kỹ thuật  
*Các giai đoạn triển khai*  
Dự án WeDo Workspace được chia thành 4 giai đoạn chính để đảm bảo tiến độ:
- *Giai Đoạn 1*: Phân tích & Thiết kế kiến trúc (2 tuần) — Chốt requirement, thiết kế sơ đồ Multi-AZ AWS, mô hình hóa Database (ERD) và UI/UX.

- *Giai Đoạn 2*: Setup Hạ tầng & CI/CD (2 tuần) — Khởi tạo VPC, cấu hình các service lõi (ALB, RDS, S3, ECS Cluster), thiết lập pipeline tự động.

- *Giai Đoạn 3*: Phát triển Core Features (6-8 tuần) — Xây dựng RESTful API bằng Spring Boot, thiết kế giao diện, tích hợp API upload/download file trực tiếp qua S3.

- *Giai Đoạn 4*: Kiểm thử & Đóng gói (2-3 tuần) — Sửa lỗi (đặc biệt các vấn đề về CORS và phân quyền), deploy bản chính thức lên ECS, UAT và viết báo cáo.

*Yêu cầu kỹ thuật*  
- *Hệ thống Ứng dụng (Frontend & Backend)*: Frontend yêu cầu xây dựng giao diện quản lý dự án (Kanban board) linh hoạt, gọi API qua Axios. Backend phát triển bằng Java Spring Boot, tích hợp thư viện AWS SDK để xử lý luồng upload/download file. Backend bắt buộc phải được đóng gói (Containerized) bằng Docker để đảm bảo tính đồng nhất giữa môi trường dev và production.

- *Hạ tầng Đám mây (AWS Cloud)*: Yêu cầu kiến thức thực tế và kỹ năng cấu hình mạng lưới (Amazon VPC, Internet Gateway, NAT Gateway). Vận hành container an toàn trên Amazon ECS (Elastic Container Service) nằm trong mạng nội bộ (Private Subnet). Định tuyến và cân bằng tải lượng truy cập thông qua Application Load Balancer (ALB). Quản lý cơ sở dữ liệu quan hệ với Amazon RDS (MySQL/PostgreSQL) và lưu trữ tệp tin tĩnh/file đính kèm linh hoạt với Amazon S3. Sử dụng AWS CloudFront làm CDN và AWS WAF để bảo vệ lớp viền hệ thống.

### 5. Lộ trình & Mốc triển khai  
| Giai Đoạn | Tuần | Nội Dung Chính | Kết Quả Mong Đợi |
| :--- | :--- | :--- | :--- |
| **Thiết Kế** | Tuần 1–2 | Vẽ sơ đồ AWS, ERD, thiết kế giao diện | Tài liệu kiến trúc & Wireframe |
| **Setup AWS** | Tuần 3–4 | Tạo VPC, RDS, S3, config CloudFront & WAF | Hạ tầng Cloud sẵn sàng |
| **Backend API** | Tuần 5–7 | Code Spring Boot, CRUD Project/Task, Auth JWT | API endpoints hoạt động ổn định |
| **Frontend & Tích hợp** | Tuần 8–10 | Code UI, ghép API, xử lý luồng nộp file lên S3 | Web app hoàn chỉnh tính năng |
| **Testing & Debug** | Tuần 11–12 | Fix lỗi CORS, kiểm tra tải Load Balancer | Hệ thống chạy mượt, 0 bug critical |
| **Deploy & Báo cáo** | Tuần 13 | Đẩy Docker image lên ECS, Live web, Báo cáo | Ứng dụng Live, sẵn sàng bảo vệ |

### 6. Ước Tính Ngân Sách Vận Hành (Hàng Tháng)

| Dịch Vụ AWS | Mục Đích | Chi Phí Ước Tính / Tháng |
| :--- | :--- | :--- |
| **Amazon ECS (Fargate)** | Chạy 1-2 container Spring Boot | ~$15 - $20 |
| **Application Load Balancer** | Cân bằng tải & SSL | ~$16 - $20 |
| **Amazon RDS (t3.micro)** | Lưu trữ Database | ~$15 (Miễn phí 12 tháng đầu) |
| **Amazon S3 & CloudFront** | Lưu file báo cáo, CDN giao diện | ~$2 - $5 |
| **Các dịch vụ khác** | Route53, Secrets Manager, Data Transfer | ~$5 |
| **TỔNG CỘNG** | | **~$53 - $65 / tháng** |

*Lưu ý*: Việc tận dụng tài khoản AWS Educate hoặc Free Tier có thể đưa chi phí thực tế về mức gần $0 trong quá trình phát triển.

### 7. Đánh giá rủi ro  
*Ma trận rủi ro*
- **Sập hệ thống do quá tải (Downtime):** Ảnh hưởng cao, xác suất thấp.
- **Lỗi bảo mật/Lộ lọt dữ liệu:** Ảnh hưởng cực cao, xác suất thấp.
- **Vượt ngân sách AWS:** Ảnh hưởng trung bình, xác suất trung bình (rất dễ xảy ra do treo tài nguyên).

*Chiến lược giảm thiểu*
- **Hệ thống:** Sử dụng Application Load Balancer (ALB) phân phối lưu lượng và triển khai Amazon ECS trên nhiều vùng sẵn sàng (Multi-AZ) để luôn có container dự phòng.
- **Bảo mật:** Đóng kín Amazon RDS và EFS trong Private Subnet; dùng AWS WAF lọc request độc hại ở lớp viền và xác thực nghiêm ngặt bằng JWT.
- **Chi phí:** Thiết lập AWS Budgets & Billing Alarms để tự động gửi email cảnh báo ngay khi chi phí chạm mốc 5$.

*Kế hoạch dự phòng*
- **Lỗi triển khai code (Deployment Failure):** Nhanh chóng Rollback (hoàn tác) Task Definition trên ECS về phiên bản Docker Image hoạt động ổn định trước đó.
- **Sự cố mất dữ liệu:** Kích hoạt tính năng Automated Backups của RDS (lưu trữ snapshot tối đa 35 ngày) và Versioning của S3 để khôi phục trạng thái dữ liệu an toàn gần nhất.

### 8. Kết quả kỳ vọng  
*Cải tiến kỹ thuật*
Hệ thống số hóa và tập trung hóa toàn bộ quy trình quản lý, thay thế hoàn toàn việc giao task và nộp file thủ công, rời rạc qua các kênh chat/drive. Kiến trúc linh hoạt trên Amazon ECS kết hợp Application Load Balancer cho phép hệ thống có khả năng tự động mở rộng (Auto-scaling), dư sức đáp ứng tải từ các nhóm nhỏ vài người cho đến hàng ngàn người dùng truy cập đồng thời mà không bị gián đoạn dịch vụ.

*Giá trị dài hạn*
Xây dựng một nền tảng Cloud cốt lõi vững chắc, sẵn sàng tích hợp thêm các Microservices mới trong tương lai (như tính năng Chat realtime, hay AI tổng kết tiến độ dự án). Quan trọng hơn, dự án mang lại trải nghiệm thực chiến vô giá về kiến trúc AWS Multi-AZ chuẩn doanh nghiệp, tạo thành một điểm nhấn "nặng ký" trong portfolio của các thành viên làm bước đệm vững chắc cho sự nghiệp kỹ sư phần mềm sau này.