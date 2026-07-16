---
title: "Worklog Tuần 3"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.3. </b> "
---



### Mục tiêu tuần 3:
* Triển khai ứng dụng có khả năng mở rộng tự động và cân bằng tải (Auto Scaling & ELB).
* Quản lý, kiểm soát và tối ưu hóa chi phí AWS sử dụng AWS Budget.
* Giám sát toàn diện hệ thống, tài nguyên và ứng dụng thông qua Amazon CloudWatch.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **Auto Scaling Group & Load Balancer:** Tạo Launch Template, thiết lập Load Balancer và cấu hình Auto Scaling Group để tự động mở rộng ứng dụng FCJ Management dựa trên biến động của lưu lượng truy cập. | 04/05/2026 | 04/05/2026 | https://000006.awsstudygroup.com/ |
| 3 | **Quản lý chi phí với AWS Budget:** Tìm hiểu 4 loại ngân sách (Cost, Usage, RI, Savings Plans). Phân tích chi phí hiện tại, thiết lập mục tiêu ngân sách và cấu hình ngưỡng cảnh báo (80% và 100%). | 05/05/2026 | 05/05/2026 | https://000007.awsstudygroup.com/ |
| 4-5 | **Amazon CloudWatch:** Thu thập, phân tích metric và log. Cấu hình CloudWatch Alarm để tự động hóa phản hồi và xây dựng Dashboard trực quan. Tìm hiểu thêm về Container Insights. | 06/05/2026 | 07/05/2026 | https://000008.awsstudygroup.com/ |
| 7   |  **Event 1**                                                                              | 09/05/2026   | 09/05/2026      | <https://cloudjourney.awsstudygroup.com/> |

### Kết quả đạt được tuần 3:
* **Kiến trúc mở rộng (Auto Scaling & ELB):** Đã triển khai thành công mô hình kiến trúc có tính sẵn sàng cao, chịu lỗi tốt. Ứng dụng tự động điều chỉnh tài nguyên để duy trì hiệu suất trong các đợt tăng đột biến lưu lượng mà vẫn tối ưu được chi phí khi nhu cầu sử dụng thấp.
* **Kiểm soát chi phí (AWS Budget):** Nắm vững cách chủ động theo dõi và kiểm soát chi phí AWS. Cấu hình thành công hệ thống cảnh báo tức thời khi chi phí vượt ngưỡng, đồng thời hiểu rõ tính linh hoạt của việc sử dụng Savings Plans thay cho Reserved Instances đối với EC2.
* **Giám sát hệ thống (CloudWatch):** Có khả năng quan sát toàn diện ứng dụng và hạ tầng. Hoàn thiện kỹ năng thiết lập báo động (Alarm) để giảm thiểu thời gian xử lý sự cố (MTTR) và tạo các Dashboard tùy chỉnh để theo dõi tình trạng hệ thống theo thời gian thực.