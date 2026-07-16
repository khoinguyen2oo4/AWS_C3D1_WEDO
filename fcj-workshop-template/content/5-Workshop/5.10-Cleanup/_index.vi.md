---
title : "Dọn dẹp"
date : 2024-01-01 
weight : 10
chapter : false
pre : " <b> 5.10. </b> "
---

**LƯU Ý:** Để tránh bị AWS trừ tiền không mong muốn sau khi hoàn thành đồ án, việc dọn dẹp (Cleanup) các tài nguyên là bắt buộc. Dưới đây là danh sách và thứ tự ưu tiên cần xóa để không bị lỗi phụ thuộc (Dependency).

### 5.10.1. Dọn dẹp tài nguyên (AWS CLI)

Thay vì thao tác thủ công trên AWS Console, quản trị viên có thể sử dụng giao diện dòng lệnh (AWS CLI) để tự động hóa quá trình xóa tài nguyên. Quá trình dọn dẹp phải tuân thủ nghiêm ngặt nguyên tắc: **Xóa từ trong lõi ra ngoài biên**.

#### Bước 1: Dọn dẹp tầng Lõi (App & Data)
Bao gồm cụm máy chủ ECS, Application Load Balancer, và hệ thống cơ sở dữ liệu.
![Cleanup Core](/images/5-Workshop/5.10-Cleanup/Det_App&Data.jpg)

**Xóa cơ sở dữ liệu RDS PostgreSQL (Bỏ qua khâu tạo bản sao lưu cuối cùng):**
```bash
aws rds delete-db-instance \
  --db-instance-identifier wedo-database \
  --skip-final-snapshot \
  --region ap-southeast-1
```

**Xóa Service và Cluster của Amazon ECS (Backend):**
```bash
aws ecs update-service --cluster wedo-cluster --service wedo-backend-service --desired-count 0
aws ecs delete-service --cluster wedo-cluster --service wedo-backend-service
aws ecs delete-cluster --cluster wedo-cluster
```

**Xóa Application Load Balancer (ALB):**
```bash
aws elbv2 delete-load-balancer \
  --load-balancer-arn <YOUR_ALB_ARN>
```

---

#### Bước 2: Dọn dẹp tầng Mạng (Network)
Bao gồm các cổng giao tiếp và định tuyến nội bộ.
![Cleanup Network](/images/5-Workshop/5.10-Cleanup/Det_Network.jpg)

**Xóa NAT Gateway (Tài nguyên ngốn tiền nhất):**
```bash
aws ec2 delete-nat-gateway \
  --nat-gateway-id <YOUR_NAT_GATEWAY_ID>
```
*Lưu ý: Sau khi xóa NAT Gateway và đợi trạng thái chuyển sang `Deleted`, cần tiến hành Release Elastic IP và xóa toàn bộ VPC.*

---

#### Bước 3: Dọn dẹp tầng Biên (Global & Edge)
Cuối cùng, xóa bỏ bộ nhớ đệm phân phối nội dung tĩnh và lớp bảo vệ bên ngoài.
![Cleanup Edge](/images/5-Workshop/5.10-Cleanup/Det_Global.jpg)

**Xóa toàn bộ dữ liệu và Bucket S3 Frontend:**
```bash
aws s3 rb s3://wedo-frontend-2026 --force
```
*(Lưu ý: Các tài nguyên nâng cao như CloudFront và WAF nên được kiểm tra và xóa thủ công trên AWS Console để đảm bảo không bỏ sót).*

---

### 5.10.2. Checklist — Nghiệm thu dự án
Sau khi hoàn thành toàn bộ đồ án, nhóm đã rà soát và xác nhận các hạng mục sau hoạt động ổn định đúng với thiết kế:
- [x] **Module 1:** Hiểu rõ kiến trúc hạ tầng mạng và các luồng đi của dữ liệu.
- [x] **Module 2:** Cài đặt đầy đủ công cụ (Docker, Postman, Git) và cấu hình môi trường.
- [x] **Module 3 (IAM):** Các Roles và Policies được thiết lập theo nguyên tắc đặc quyền tối thiểu (Least Privilege).
- [x] **Module 4 (Database):** RDS PostgreSQL khởi tạo thành công trong Private Subnet, quản lý thông tin đăng nhập bảo mật qua Secrets Manager.
- [x] **Module 5 & 6 (Backend & Frontend):** Container Backend Spring Boot chạy ổn định trên ECS Fargate; giao diện Frontend ReactJS deploy lên S3 thành công.
- [x] **Module 7 (Edge Security):** Mạng phân phối nội dung CloudFront và tường lửa AWS WAF hoạt động tốt, định tuyến tên miền thành công qua Route 53.
- [x] **Module 8 (Monitoring):** Đẩy log hệ thống lên CloudWatch thành công, cấu hình Alarm cảnh báo khi CPU cụm Backend vượt mức 80%.
- [x] **Module 9 (Go-Live):** Truy cập ứng dụng trơn tru trên môi trường Internet thực tế, chịu tải tốt qua Application Load Balancer.
- [x] **Module 10 (Cleanup):** Nắm rõ quy trình và thứ tự dọn dẹp tài nguyên trên AWS để tối ưu chi phí.

### Tài liệu tham khảo (References)
* [AWS Documentation – Amazon Virtual Private Cloud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)
* [AWS Documentation – Amazon Elastic Container Service (ECS) & Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
* [AWS Documentation – Application Load Balancer (ALB)](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
* [AWS Documentation – Amazon Relational Database Service (RDS)](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
* [AWS Documentation – Amazon CloudFront & AWS WAF](https://docs.aws.amazon.com/cloudfront/latest/APIReference/Welcome.html)
* [Spring Boot Framework Reference Guide](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
* [ReactJS Official Documentation](https://react.dev/)
* [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)