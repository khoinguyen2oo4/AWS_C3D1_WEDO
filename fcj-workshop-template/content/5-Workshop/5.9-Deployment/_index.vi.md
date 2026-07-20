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

### System demo

| | Content |
| :--- | :--- |
| **Web access URL** | [WeDo Workspace Web](https://tinyurl.com/Wedo-c3d1) |
| **Demo video** | Watch below or download [Demo-aws.mp4](https://drive.google.com/file/d/19jLMrXjSZSN6gKfXB3MJ4Kub92MRf-f-/view?usp=sharing) |

<br>

<video width="100%" controls style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  <source src="/fcj-workshop-template/video/demo-aws.mp4" type="video/mp4">
  Trình duyệt của bạn không hỗ trợ thẻ video.
</video>


### 5.9.2. Môi trường Production
* Giao diện người dùng đang được phân phối toàn cầu ở tốc độ siêu cao qua mạng biên (S3 + CloudFront).
* Backend hoạt động ổn định và xử lý hàng ngàn request đồng thời phía sau Application Load Balancer một cách an toàn trong Private Subnet.
![Màn hình Go-live](/AWS_C3D1_WEDO/images/5-Workshop/5.9-Deployment/wedo-live.jpg)