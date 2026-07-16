---
title: "Worklog Tuần 7"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.7. </b> "
---



### Mục tiêu tuần 7:
* Triển khai quy trình CI/CD hoàn chỉnh để tự động hóa phát hành ứng dụng lên EC2 bằng bộ công cụ AWS Developer Tools.
* Xây dựng giải pháp lưu trữ lai (hybrid storage) kết nối môi trường on-premises và AWS bằng File Storage Gateway.
* Triển khai, cấu hình và quản lý hệ thống tệp tin dùng chung hiệu suất cao cho hạ tầng Windows với Amazon FSx.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2-3 | **CI/CD với AWS CodePipeline:** Tạo repository (CodeCommit), cấu hình môi trường build (CodeBuild) và tự động triển khai (CodeDeploy). Tích hợp toàn bộ luồng với CodePipeline, lưu trữ artifact trên S3 và mã hóa với KMS. | 01/06/2026 | 02/06/2026 | https://000023.awsstudygroup.com/1-introduction/ |
| 4 | **AWS File Storage Gateway:** Khởi tạo Storage Gateway và tạo File Shares. Thực hành mount File Sharing từ nền tảng AWS lên máy chủ On-premise để tích hợp hệ thống lưu trữ. | 03/06/2026 | 03/06/2026 | https://000024.awsstudygroup.com/1-introduction/ |
| 5-6 | **Amazon FSx for Windows File Server:** Thiết lập máy chủ tệp dùng chung. Thực hành Map Default File Share, bật chống trùng lặp dữ liệu (Deduplication), Shadow copies, giới hạn dung lượng (Quotas) và mở rộng linh hoạt. | 04/06/2026 | 05/06/2026 | https://000025.awsstudygroup.com/1-introduction/ |

### Kết quả đạt được tuần 7:
* **Tự động hóa phát hành (DevOps & CI/CD):** Hiểu sâu về triết lý DevOps. Xây dựng thành công luồng CI/CD end-to-end hoàn toàn tự động, từ khi commit mã nguồn đến khi ứng dụng được cập nhật an toàn trên EC2, giúp tăng tốc độ phân phối phần mềm.
* **Lưu trữ lai (Storage Gateway):** Nắm vững cách thức tích hợp và mở rộng không gian lưu trữ từ môi trường hạ tầng cục bộ (on-premises) lên đám mây AWS một cách liền mạch.
* **Quản trị lưu trữ Windows (Amazon FSx):** Quản lý thành thạo hệ thống lưu trữ tệp Windows có độ sẵn sàng cao. Ứng dụng thành công các tính năng tối ưu hóa lưu trữ (Deduplication) và bảo vệ dữ liệu (Shadow copies) vào thực tế vận hành hệ thống.