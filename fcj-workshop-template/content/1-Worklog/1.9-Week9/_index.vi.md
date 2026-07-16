---
title: "Worklog Tuần 9"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.9. </b> "
---



### Mục tiêu tuần 9:
* Áp dụng giới hạn quyền truy cập an toàn, ngăn chặn rủi ro bằng IAM Permission Boundary.
* Quản lý tập trung, tự động hóa quá trình vá lỗi (patching) và thực thi lệnh với AWS Systems Manager.
* Thu thập số liệu hiệu suất và tối ưu hóa cấu hình máy chủ (Right-sizing EC2) với CloudWatch Agent và Compute Optimizer.
* Bảo vệ dữ liệu lưu trữ (Encrypt at rest) với AWS KMS, kết hợp theo dõi log qua CloudTrail và Athena.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **IAM Permission Boundary:** Tìm hiểu cách ngăn chặn leo thang đặc quyền (privilege escalation). Thực hành tạo chính sách giới hạn và cấp quyền, sau đó kiểm tra giới hạn quyền đối với IAM User. | 15/06/2026 | 15/06/2026 | https://000030.awsstudygroup.com/1-introduction/ |
| 3 | **AWS Systems Manager:** Quản lý tập trung tài nguyên. Cấu hình Patch Manager và sử dụng Run Command để tự động hóa việc vá lỗi phần mềm và thực thi lệnh trên nhiều máy chủ cùng lúc. | 16/06/2026 | 16/06/2026 | https://000031.awsstudygroup.com/1-introduction/ |
| 4 | **Tối ưu kích thước EC2:** Cài đặt CloudWatch Agent để thu thập chỉ số bộ nhớ (Memory). Sử dụng AWS Resource Optimization và AWS Compute Optimizer để phân tích và chọn cấu hình EC2 phù hợp (Right-sizing). | 17/06/2026 | 17/06/2026 | https://000032.awsstudygroup.com/1-introduction/ |
| 6 | **Mã hóa với AWS KMS:** Tạo khóa quản lý dịch vụ (KMS), thiết lập mã hóa bảo vệ dữ liệu trên Amazon S3. Kết hợp với CloudTrail để ghi nhận nhật ký API và dùng Athena để truy vấn log. | 19/06/2026 | 19/06/2026 | https://000033.awsstudygroup.com/1-introduction/ |
| 7 | **Sự kiện:** Tham gia sự kiện Event 3. | 20/06/2026 | 20/06/2026 | FCAJ Event |

### Kết quả đạt được tuần 9:
* **Bảo mật phân quyền (IAM):** Hiểu và áp dụng thành công IAM Permission Boundary, ngăn chặn hiệu quả rủi ro leo thang đặc quyền khi hệ thống có nhiều người dùng phức tạp.
* **Tự động hóa vận hành (Systems Manager):** Đơn giản hóa quá trình quản trị bằng cách tự động hóa thành công các tác vụ vận hành diện rộng (như cập nhật bản vá, chạy lệnh), giúp giảm thiểu đáng kể thao tác thủ công.
* **Tối ưu hóa Chi phí & Hiệu suất (EC2 Right-sizing):** Thu thập thành công các chỉ số chuyên sâu (metrics) qua CloudWatch Agent và phân tích bằng Compute Optimizer để đưa ra quyết định chọn cấu hình máy chủ tối ưu nhất, cân bằng giữa chi phí và hiệu suất.
* **Bảo mật dữ liệu (KMS & Data logs):** Mã hóa thành công dữ liệu ở trạng thái nghỉ, đồng thời thiết lập hệ thống giám sát và truy vết các lệnh gọi API truy cập dữ liệu, đảm bảo tuân thủ nghiêm ngặt các quy chuẩn bảo mật.