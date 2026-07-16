---
title: "Worklog Tuần 4"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.4. </b> "
---



### Mục tiêu tuần 4:
* Xây dựng kiến trúc DNS lai (hybrid DNS) sử dụng Amazon Route 53 Resolver.
* Nắm vững AWS Command Line Interface (CLI) để quản lý tài nguyên hiệu quả và tự động hóa.
* Tự động hóa các quá trình bảo vệ dữ liệu, sao lưu và phục hồi bằng AWS Backup và Amazon SNS.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **Hybrid DNS với Route 53 Resolver:** Xây dựng hệ thống DNS lai tích hợp hệ thống DNS on-premise với Amazon Route 53 bằng cách sử dụng Inbound Endpoints, Outbound Endpoints và Resolver Rules. | 11/05/2026 | 11/05/2026 | https://000010.awsstudygroup.com/ |
| 3-5 | **AWS Command Line Interface (CLI):** Cài đặt và cấu hình AWS CLI. Thiết lập CLI profile, thông tin xác thực bảo mật, region mặc định và tìm hiểu các định dạng đầu ra khác nhau (JSON, text, table). Khắc phục các sự cố cấu hình. | 12/05/2026 | 14/05/2026 | https://000011.awsstudygroup.com/ |
| 6 | **Hệ thống (AWS Backup & SNS):** Triển khai hạ tầng và tạo Kế hoạch sao lưu (Backup Plan) tự động cho các tài nguyên (EBS, RDS, DynamoDB, EFS). Cấu hình SNS topic để nhận thông báo bất đồng bộ và tiến hành kiểm tra phục hồi (restore testing). | 15/05/2026 | 15/05/2026 | https://000013.awsstudygroup.com/ |

### Kết quả đạt được tuần 4:
* **Mạng & DNS (Route 53):** Thiết lập thành công kiến trúc DNS lai, cho phép phân giải tên miền và chuyển tiếp truy vấn mượt mà giữa các hệ thống giả lập on-premise và AWS.
* **Quản lý qua dòng lệnh (AWS CLI):** Thành thạo trong việc thực thi các tác vụ quản trị và quản lý nhiều profile qua dòng lệnh. Khắc phục thành công sự cố cấu hình sai địa chỉ bằng cách xác định nguyên nhân gốc rễ, xóa môi trường bị lỗi và xây dựng lại toàn bộ hệ thống từ đầu để đảm bảo tính chính xác.
* **Bảo vệ dữ liệu & Tự động hóa (AWS Backup & SNS):** Thiết kế và triển khai chiến lược sao lưu tập trung, tự động cho các tài nguyên đang hoạt động. Xác minh tính toàn vẹn của dữ liệu thông qua việc thực hành khôi phục (restore) và cấu hình thành công hệ thống thông báo SNS để giám sát trạng thái các tác vụ sao lưu theo thời gian thực.