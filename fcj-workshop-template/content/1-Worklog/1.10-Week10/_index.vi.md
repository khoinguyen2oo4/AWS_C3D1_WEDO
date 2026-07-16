---
title: "Worklog Tuần 10"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 1.10. </b> "
---



### Mục tiêu tuần 10:
* Trực quan hóa, phân tích và tối ưu hóa chi phí AWS tuân thủ theo Well-Architected Framework.
* Xây dựng hệ thống Data Lake toàn diện để lưu trữ, xử lý và trực quan hóa dữ liệu lớn (Big Data).
* Triển khai giám sát hệ thống chuyên sâu và tự động hóa cảnh báo hạ tầng với Amazon CloudWatch.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2-3 | **Trực quan hóa chi phí (Cost Visualization):** Phân tích chi phí qua Cost Explorer (theo dịch vụ, tài khoản), kiểm tra phạm vi Savings Plan/RI. Tạo báo cáo EC2 tùy chỉnh và tìm hiểu phí truyền tải dữ liệu. Khắc phục sự cố cấu hình EC2. | 22/06/2026 | 23/06/2026 | https://000034.awsstudygroup.com/1-introduction/ |
| 4 | **Data Lake trên AWS:** Thu thập và lưu trữ dữ liệu thô. Sử dụng AWS Glue làm Data Catalog, Amazon Athena để truy vấn dữ liệu và Amazon QuickSight để xây dựng Dashboard thống kê cho dự án phân tích dữ liệu âm nhạc. | 24/06/2026 | 24/06/2026 | https://000035.awsstudygroup.com/1-introduction/ |
| 6 | **Amazon CloudWatch:** Thực hành thu thập Metrics, Logs. Cấu hình CloudWatch Alarm và Dashboard. Tìm hiểu Container Insights để giám sát môi trường EKS, ECS, Fargate giúp giảm thiểu thời gian xử lý sự cố (MTTR). | 26/06/2026 | 26/06/2026 | https://000036.awsstudygroup.com/1-introduction/ |

### Kết quả đạt được tuần 10:
* **Quản trị chi phí (Cost Management):** Thành thạo việc sử dụng Cost Explorer để theo dõi và tối ưu hóa chi phí. Đã tự khắc phục thành công lỗi phát sinh liên quan đến EC2 trong quá trình thực hành bằng cách chủ động rà soát và làm lại cấu hình chuẩn xác.
* **Kiến trúc Dữ liệu lớn (Data Lake):** Hiểu rõ vòng đời của Big Data. Xây dựng thành công luồng xử lý dữ liệu liên hoàn: từ phân loại (Glue), truy vấn SQL serverless trực tiếp trên S3 (Athena) cho đến trực quan hóa thành biểu đồ (QuickSight).
* **Giám sát hệ thống (CloudWatch):** Làm chủ khả năng quan sát (observability) toàn diện cho hạ tầng. Thiết lập thành công các cảnh báo tự động và bảng điều khiển trực quan để theo dõi sức khỏe ứng dụng và tài nguyên container theo thời gian thực.