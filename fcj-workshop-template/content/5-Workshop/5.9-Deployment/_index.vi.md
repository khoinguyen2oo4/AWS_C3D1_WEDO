---
title : "Triển khai"
date : 2024-01-01 
weight : 9
chapter : false
pre : " <b> 5.9. </b> "
---

### 5.9.1. Rà soát kiến trúc tổng thể
Hệ thống hiện tại thỏa mãn các tiêu chuẩn của AWS Well-Architected Framework:
* **High Availability:** Triển khai Multi-AZ với VPC, ALB, NAT Gateway và RDS.
* **Security:** Private Subnets, WAF, Secrets Manager, IAM phân quyền least-privilege.
* **Scalability:** Sử dụng Serverless ECS Fargate tự động mở rộng theo tải.

### 5.9.2. Môi trường Production
* Giao diện người dùng đang được phân phối toàn cầu ở tốc độ siêu cao qua mạng biên (S3 + CloudFront).
* Backend hoạt động ổn định và xử lý hàng ngàn request đồng thời phía sau Application Load Balancer một cách an toàn trong Private Subnet.
![Màn hình Go-live](/images/5-Workshop/5.9-Deployment/wedo-live.jpg)