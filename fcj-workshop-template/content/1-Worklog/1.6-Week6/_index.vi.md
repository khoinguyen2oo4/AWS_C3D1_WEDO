---
title: "Worklog Tuần 6"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.6. </b> "
---



### Mục tiêu tuần 6:
* Tìm hiểu và thiết lập AWS Security Hub để giám sát tập trung các cảnh báo bảo mật và tuân thủ.
* Xây dựng kết nối mạng an toàn, trực tiếp giữa các VPC bằng VPC Peering.
* Mở rộng và đơn giản hóa kiến trúc mạng quy mô lớn (nhiều VPC) bằng AWS Transit Gateway.
* Tối ưu hóa chi phí vận hành Amazon EC2 thông qua tự động hóa bằng AWS Lambda và tìm hiểu Savings Plans.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **Study - AWS Security Hub & VPC Peering:** Nghiên cứu bảng điều khiển Security Hub. Thiết lập kết nối ngang hàng (Peering) giữa 2 VPC để giao tiếp không qua Internet. Cấu hình Network ACLs (stateless firewall) và Cross-Peering DNS. | 25/05/2026 | 25/05/2026 | https://000019.awsstudygroup.com/1-introduction/ |
| 3-4 | **AWS Transit Gateway:** Triển khai kiến trúc mạng mở rộng kết nối 4 VPC thông qua Transit Gateway (đóng vai trò là hub trung tâm). Tạo và cấu hình Transit Gateway Attachments cùng các bảng định tuyến (Route Tables) tương ứng. | 26/05/2026 | 27/05/2026 | https://000020.awsstudygroup.com/1-introduction/ |
| 6 | **Tối ưu chi phí EC2 với Lambda:** Viết và kiểm thử hàm Lambda (Serverless) để tự động hóa quá trình bật/tắt các EC2 instances không cần chạy 24/7 dựa trên Tags. Tìm hiểu chiến lược mua Savings Plans cho các instances chạy liên tục. | 29/05/2026 | 29/05/2026 | https://000022.awsstudygroup.com/1-introduction/ |

### Kết quả đạt được tuần 6:
* **Bảo mật & Giám sát (Security Hub & NACL):** Nắm bắt cách tổng hợp, phân tích các rủi ro bảo mật từ nhiều dịch vụ (GuardDuty, Macie, Inspector) vào một màn hình duy nhất. Hiểu rõ nguyên lý hoạt động của Network ACLs (cấp độ Subnet, stateless) kết hợp cùng Security Groups (cấp độ Instance, stateful) để bảo mật nhiều lớp.
* **Kiến trúc Mạng (VPC Peering vs Transit Gateway):** Phân biệt rõ các use-case: dùng VPC Peering cho các kết nối mạng đơn giản (không có tính chất bắc cầu) và dùng Transit Gateway làm bộ định tuyến đám mây để quản lý tập trung, giảm thiểu độ phức tạp cho kiến trúc nhiều VPC.
* **Tối ưu hóa Chi phí (AWS Lambda):** Ứng dụng thành công Lambda Function và IAM Roles vào việc quản trị tài nguyên tự động. Kiểm soát tốt lịch trình bật/tắt EC2, giúp giảm thiểu đáng kể chi phí hạ tầng cho các môi trường thử nghiệm hoặc không yêu cầu hoạt động 24/7.