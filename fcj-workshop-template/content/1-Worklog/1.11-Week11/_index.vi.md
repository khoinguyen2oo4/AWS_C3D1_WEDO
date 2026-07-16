---
title: "Worklog Tuần 11"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 1.11. </b> "
---


### Mục tiêu tuần 11:
* Áp dụng tư duy Cơ sở hạ tầng dưới dạng mã (Infrastructure as Code - IaC) để tự động hóa việc triển khai và quản lý tài nguyên AWS.
* Xây dựng và quản lý kiến trúc AWS bằng các ngôn ngữ lập trình phổ biến thông qua AWS Cloud Development Kit (CDK).
* Nắm vững các nguyên tắc cốt lõi về mô hình hóa dữ liệu NoSQL, các tính năng nâng cao và cách tích hợp Generative AI với Amazon DynamoDB.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **AWS CloudFormation:** Tìm hiểu cách mô tả hạ tầng đám mây bằng code (JSON/YAML) để tự động hóa triển khai ứng dụng. Cấu hình môi trường và thực hành trực tiếp trên trình duyệt bằng AWS Cloud9 IDE. | 29/06/2026 | 29/06/2026 | https://000037.awsstudygroup.com/1-introduction/ |
| 3 | **CDK Basic:** Triển khai kiến trúc AWS bằng các ngôn ngữ lập trình (TypeScript, Python, Java...). Thực hành tạo, cập nhật Template CDK, cấu hình EC2 qua User Data và dọn dẹp tài nguyên (Resource Cleanup). | 30/06/2026 | 30/06/2026 | https://000038.awsstudygroup.com/1-introduction/ |
| 4-6 | **Amazon DynamoDB Immersion Day:** Thực hành từ cơ bản (CLI/Console) đến nâng cao (Design Patterns, CDC, Event-Driven Architecture). Đặc biệt, thực hành tích hợp Generative AI (Zero-ETL vào OpenSearch kết hợp Amazon Bedrock) và xây dựng hệ thống Global (Multi-Region). | 01/07/2026 | 03/07/2026 | https://000039.awsstudygroup.com/1-introduction/ |

### Kết quả đạt được tuần 11:
* **Tự động hóa hạ tầng (IaC):** Thành thạo việc sử dụng CloudFormation và Cloud9 IDE để định nghĩa và khởi tạo trọn gói một cụm tài nguyên trên AWS, giảm thiểu rủi ro từ các thao tác thủ công.
* **Mở rộng khả năng lập trình đám mây (AWS CDK):** Nắm vững quy trình thiết kế hạ tầng bằng chính ngôn ngữ lập trình đang sử dụng, giúp dễ dàng tận dụng các vòng lặp, biến số và quản lý phiên bản kiến trúc.
* **Làm chủ Cơ sở dữ liệu NoSQL:** Hiểu sâu sắc sự đánh đổi (tradeoffs) khi thiết kế Data model trên DynamoDB để đạt hiệu suất mili-giây. Nắm bắt được quy trình tích hợp sự kiện thời gian thực (Streams/Lambda) và kỹ thuật kết hợp dữ liệu truyền thống với các mô hình Generative AI để tìm kiếm bằng ngôn ngữ tự nhiên.

