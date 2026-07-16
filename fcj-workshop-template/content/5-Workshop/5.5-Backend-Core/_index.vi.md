---
title : "Backend-Core"
date : 2024-01-01
weight : 5
chapter : false
pre : " <b> 5.5 </b> "
---

### 5.5.1. Chuẩn bị mã nguồn & Dockerfile
Trước tiên, cấu hình `application.yml` của Spring Boot cần được tinh chỉnh để đọc thông tin Database từ AWS Secrets Manager. Sau đó, chúng ta tạo một `Dockerfile` tại thư mục gốc của dự án:

```dockerfile
# Sử dụng JDK 17 làm base image
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
# Copy file JAR sau khi build vào container
COPY target/wedo-workspace-0.0.1-SNAPSHOT.jar app.jar
# Mở port 8080
EXPOSE 8080
# Lệnh chạy ứng dụng
ENTRYPOINT ["java","-jar","/app.jar"]
```

### 5.5.2. Đẩy Image lên Amazon ECR (Elastic Container Registry)
ECR là kho chứa các Docker Image bảo mật của AWS.
* Truy cập **AWS Console** → **Elastic Container Registry** → **Create repository**.
* Visibility settings: Chọn **Private**.
* Repository name: `wedo-backend`.
* Image tag mutability: Chọn **Mutable** (Để có thể ghi đè image bản cập nhật mới).
* Bấm **Create repository**.

![Tạo ECR Repository](/images/5-Workshop/5.5-Backend-Core/ecr-create.jpg)

Sau khi tạo xong, click vào repository `wedo-backend` vừa tạo, chọn nút **View push commands**. AWS sẽ cung cấp sẵn các lệnh dòng lệnh (CLI). Bạn mở Terminal trên máy tính và chạy lần lượt các lệnh để: Đăng nhập AWS, Build Docker Image, và Push Image lên kho chứa.

![Xem nút Push Commands](/images/5-Workshop/5.5-Backend-Core/ecr-push-btn.png)

![Thực thi lệnh Docker Build & Push](/images/5-Workshop/5.5-Backend-Core/ecr-terminal.jpg)
*(Lưu ý: Luôn bảo mật tuyệt đối Access Key và Secret Key của bạn khi cấu hình AWS CLI).*

### 5.5.3. Khởi tạo Cụm Amazon ECS (Cluster)
Cluster là cụm logic để quản lý các Container.
* Truy cập **AWS Console** → **Amazon ECS** → **Clusters** → **Create cluster**.
* Cluster name: `wedo-cluster`.
* Infrastructure: Chọn **AWS Fargate (serverless)**.
* Bấm **Create**.

![Tạo ECS Cluster](/images/5-Workshop/5.5-Backend-Core/ecs-cluster.jpg)

### 5.5.4. Tạo Task Definition (Định nghĩa Container)
Đây là bản thiết kế chỉ định cách Container của chúng ta hoạt động và kết nối với Database an toàn.

**Bước 1: Lấy ARN của Database Secret**
* Truy cập **AWS Console** → **Secrets Manager**.
* Chọn Secret của RDS đã tạo ở Module 4.
* Copy giá trị **Secret ARN** để sử dụng cho bước sau.
![Copy Secret ARN](/images/5-Workshop/5.5-Backend-Core/secrets-arn.png)

**Bước 2: Khởi tạo Task Definition**
* Chuyển sang **Amazon ECS** → **Task definitions** → **Create new task definition**.
* Task definition family: `wedo-backend-task`.
* Infrastructure requirements: Chọn **AWS Fargate** (1 vCPU, 2 GB Memory).
* **Task role:** Chọn `WeDo-ECS-Task-Role`.
* **Task execution role:** Chọn `WeDo-ECS-Execution-Role`.

**Bước 3: Cấu hình Storage (Tích hợp EFS)**
* Kéo xuống phần Storage, nhấn **Add volume**.
* Đặt tên volume `wedo_backend`, Volume type chọn **EFS** và trỏ đến `wedo-uploads-efs` đã tạo ở Module 4.
![Cấu hình ECS Volume](/images/5-Workshop/5.5-Backend-Core/ecs-volume.jpg)

**Bước 4: Cấu hình Container & Biến môi trường**
* **Name:** `backend-container`.
* **Image URI:** Dán đường dẫn URI từ ECR.
* **Port mappings:** `8080` (TCP).
* Kéo xuống phần **Environment variables**, thêm biến môi trường để Spring Boot đọc Database an toàn:
  * Key: `SPRING_DATASOURCE_PASSWORD` (hoặc cấu trúc JSON trỏ vào secret).
  * Value type: Chọn **ValueFrom**.
  * Value: Dán **Secret ARN** đã copy ở Bước 1.
![Cấu hình Biến môi trường](/images/5-Workshop/5.5-Backend-Core/ecs-env-vars.jpg)
* Quay lại phần Storage của Container, mount cái Volume `wedo_backend` vào đường dẫn `/app/uploads` (Root directory).
* Nhấn **Create**.

**Kết quả:** Hệ thống báo Success, bản thiết kế Container đã sẵn sàng!
![Tạo Task Definition thành công](/images/5-Workshop/5.5-Backend-Core/ecs-task-success.jpg)

### 5.5.5. Cấu hình Load Balancer (ALB) & Target Group
Vì các Container Backend được đặt trong Private Subnet để bảo mật, chúng ta cần một Application Load Balancer (ALB) nằm ở Public Subnet để tiếp nhận luồng truy cập từ Internet.

**Bước 1: Tạo Target Group**
* Truy cập **EC2** → **Target Groups** → **Create target group**.
* Target type: Chọn **IP addresses** (Bắt buộc với AWS Fargate).
* Target group name: `tg-wedo-backend`.
* Protocol: **HTTP**, Port: **8080**.
* VPC: Chọn `wedo-workspace-vpc`. Bấm **Create target group**.
![Tạo Target Group](/images/5-Workshop/5.5-Backend-Core/alb-tg-create.jpg)

**Bước 2: Tạo Application Load Balancer**
* Truy cập **EC2** → **Load Balancers** → **Create Load Balancer** → Chọn **Application Load Balancer**.
* Name: `alb-wedo-backend`.
* Scheme: **Internet-facing**.
* Network mapping: Chọn VPC và tích chọn các **Public Subnets**.
* Security groups: Chọn SG dành riêng cho ALB (`wedo-alb-sg`).
* Listeners and routing: HTTP:80 forward về `tg-wedo-backend`.
* Bấm **Create load balancer** và chờ cấp phát thành công.
![Tạo ALB thành công](/images/5-Workshop/5.5-Backend-Core/alb-create-success.png)

### 5.5.6. Cập nhật ECS Service để gắn Load Balancer
Bây giờ chúng ta sẽ liên kết cụm Container đang chạy với Load Balancer vừa tạo.

* Quay lại **Amazon ECS** → Chọn Cluster `wedo-cluster`.
* Tại tab **Services**, chọn Service `wedo-backend-task-service...` và nhấn nút **Update**.
![Cập nhật ECS Service](/images/5-Workshop/5.5-Backend-Core/ecs-service-update.png)

* Kéo xuống phần **Networking**, đảm bảo vẫn giữ nguyên các Private Subnets và Security Group `wedo-ecs-sg`.
* Kéo xuống phần **Load balancing**, chọn **Use load balancing**.
* Load balancer type: **Application Load Balancer**.
* Load balancer: Chọn `alb-wedo-backend`.
* Container to load balance: Chọn `backend-container:8080`.
![Gắn ALB vào ECS Service](/images/5-Workshop/5.5-Backend-Core/ecs-service-alb.png)
* Nhấn **Update** để AWS tiến hành cấu hình lại luồng mạng.

**Kết quả:** Hệ thống Backend Core đã được bảo vệ phía sau Load Balancer, sẵn sàng tiếp nhận các API Request từ Frontend một cách an toàn và tự động phân tải!