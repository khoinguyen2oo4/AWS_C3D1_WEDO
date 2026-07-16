---
title: "Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Workshop: Triển khai Hệ thống WeDo Workspace trên AWS

#### Tổng quan

**WeDo Workspace** là một hệ thống quản lý dự án nội bộ và không gian làm việc cộng tác được thiết kế theo kiến trúc Container, sử dụng Java Spring Boot cho Backend và ReactJS/NextJS cho Frontend.

Trong chuỗi bài Lab (Workshop) thực chiến này, chúng ta sẽ học cách từng bước đưa hệ thống từ môi trường phát triển (Local) lên nền tảng điện toán đám mây AWS chuẩn doanh nghiệp. Khác với các hệ thống Serverless đơn giản, Workshop này sẽ đi sâu vào việc triển khai hạ tầng bảo mật **Đa vùng sẵn sàng (Multi-AZ)**.

Bạn sẽ tự tay thiết lập mạng nội bộ (VPC), cơ sở dữ liệu quan hệ (Amazon RDS), đóng gói ứng dụng bằng Docker chạy trên Amazon ECS (Fargate), và thiết lập Application Load Balancer để đảm bảo tính sẵn sàng cao (High Availability). Mục tiêu cuối cùng là giúp bạn nắm vững vòng đời triển khai một ứng dụng thực tế trên AWS, từ cấu hình hạ tầng cơ sở đến khi website chính thức public ra Internet một cách bảo mật.

#### Nội dung Workshop

1. [Module 1: Tổng quan & Mục tiêu dự án](5.1-Introduction/)
2. [Module 2: Điều kiện tiên quyết & Cài đặt](5.2-Prerequisites/)
3. [Module 3: Hạ tầng mạng (VPC) & IAM](5.3-IAM-Infrastructure/)
4. [Module 4: Cơ sở dữ liệu (RDS) & Lưu trữ (EFS)](5.4-Database/)
5. [Module 5: Backend Core - Spring Boot & ECS](5.5-Backend-Core/)
6. [Module 6: Frontend & Tích hợp S3](5.6-Frontend-S3/)
7. [Module 7: Bảo mật biên (WAF & CloudFront)](5.7-Edge-Security/)
8. [Module 8: Giám sát hệ thống (CloudWatch)](5.8-Monitoring/)
9. [Module 9: Triển khai & Go-Live](5.9-Deployment/)
10. [Module 10: Dọn dẹp tài nguyên](5.10-Cleanup/)