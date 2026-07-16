---
title : "Hạ tầng mạng (VPC) & IAM"
date : 2024-01-01 
weight : 3
chapter : false
pre : " <b> 5.3. </b> "
---

### 5.3.1. Thiết lập IAM Roles & Policies (Cấp quyền)
Hệ thống Container cần 2 Role riêng biệt để chạy và tương tác với các dịch vụ khác.

**Bước 1: Tạo ECS Task Execution Role (Quyền thực thi)**
* Truy cập **AWS Console** → **IAM** → **Roles** → **Create role**
* Select trusted entity: **AWS service**
* Use case: **Elastic Container Service** → Chọn **Elastic Container Service Task**
* Nhấn **Next**
* Attach policies (Tìm và tích chọn):
  * `AmazonECSTaskExecutionRolePolicy` (Để pull image từ ECR)
  * `CloudWatchLogsFullAccess` (Để ghi log)
* Nhấn **Next** → Role name: `WeDo-ECS-Execution-Role` → **Create role**

**Bước 2: Tạo ECS Task Role (Quyền của ứng dụng Spring Boot)**
* Tương tự Bước 1, tạo một Role mới cho ECS Task.
* Attach policies:
  * `AmazonS3FullAccess` (Để Spring Boot upload/download file)
  * `SecretsManagerReadWrite` (Để đọc mật khẩu DB)
* Nhấn **Next** → Role name: `WeDo-ECS-Task-Role` → **Create role**

![Tạo IAM Role](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-iam-role.jpg)
*(Lưu ý: Bạn cần cấp quyền chính xác để các dịch vụ có thể giao tiếp nội bộ)*

### 5.3.2. Thiết lập Hạ tầng mạng (VPC Setup)
Thay vì tạo tay từng Subnet rất dễ nhầm, chúng ta sẽ dùng tính năng "VPC and more".

**Bước 1: Khởi tạo VPC Multi-AZ**
* Truy cập **AWS Console** → **VPC** → **Your VPCs** → **Create VPC**
* Chọn **VPC and more**
* Name tag auto-generation: `wedo-workspace`
* IPv4 CIDR block: `10.0.0.0/16`
* Number of Availability Zones (AZs): **2**
* Number of public subnets: **2** (Dành cho Load Balancer & NAT)
* Number of private subnets: **4** (2 cho ECS, 2 cho RDS)
* NAT gateways: **In 1 AZ** (Để tiết kiệm chi phí thay vì 1 per AZ)
* Nhấn **Create VPC** và chờ AWS tự động đi dây mạng lưới.

![Tạo VPC và Subnet cơ bản](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-vpc-subnet.jpg)

### 5.3.3. Route 53 & WAFv2 Setup
**Route 53 - Cấu hình DNS:**
Hiện tại Route 53 không còn cung cấp tên miền tùy chỉnh miễn phí. Thay vì phải mua domain mới, chúng ta sẽ tạm thời sử dụng **Domain name mặc định của Application Load Balancer (ALB)** hoặc **CloudFront** cung cấp để tiết kiệm ngân sách.
*(Lưu ý: Bỏ qua bước này, sẽ quay lại cấu hình CNAME nếu sau này nhóm mua tên miền).*

**WAFv2 - Tường lửa bảo vệ:**
* Truy cập **AWS Console** → **WAF & Shield** → **Web ACLs** → **Create web ACL**
* Đặt tên: `WeDo-WAF-Protection`
* Resource type: Chọn **Regional resources** (nếu gắn vào ALB) hoặc **CloudFront distributions** (nếu gắn lớp ngoài cùng).
* Add rules: Chọn **Managed rule groups** → Thêm `Core rule set` và `SQL database` để chặn SQL Injection độc hại.

### 5.3.4. Cấu hình VPC Endpoints (AWS PrivateLink)
Để tăng cường bảo mật và tối ưu chi phí (giảm tải luồng traffic đi qua NAT Gateway), chúng ta sẽ tạo các VPC Interface Endpoints để các Container trong Private Subnet giao tiếp trực tiếp với các dịch vụ lõi của AWS.

**1. Endpoint cho Secrets Manager (`wedo-secrets-endpoint`):**
* Truy cập **AWS Console** → **VPC** → **Endpoints** → **Create endpoint**.
* Service category: Chọn **AWS services**.
* Service name: Tìm và chọn `com.amazonaws.ap-southeast-1.secretsmanager`.
* VPC: Chọn `wedo-workspace-vpc`.
* Subnets: Tích chọn các **Private Subnets** đã tạo.
* Security groups: Chọn Security Group nội bộ (cho phép Inbound Port 443 từ dải IP của VPC).
* Bấm **Create endpoint**.

![Tạo VPC Endpoint cho Secrets Manager](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-endpoint-1.jpg)

**2. Endpoint cho CloudWatch Logs (`wedo-cloudwatch-endpoint`):**
* Tương tự bước trên, tạo một Endpoint mới.
* Service name: Tìm và chọn `com.amazonaws.ap-southeast-1.logs`.
* Cấu hình VPC, Subnet và Security Group y hệt như Endpoint của Secrets Manager.
* Bấm **Create endpoint** và đợi trạng thái chuyển sang **Available**.

![Tạo VPC Endpoint cho CloudWatch](/images/5-Workshop/5.3-IAM-Infrastructure/hinh-endpoint-2.jpg)

**Kết quả nghiệm thu:** Sau vài phút, cả hai Endpoint đều chuyển sang trạng thái hoạt động.

![Kết quả tạo Endpoint](/images/5-Workshop/5.3-IAM-Infrastructure/endpoint_ket_qua.png)

### 5.3.5. Khởi tạo NAT Gateway và Cấu hình Route Table
Để các tài nguyên nằm trong mạng nội bộ (Private Subnet) như ECS Fargate hay RDS có thể truy cập Internet (ví dụ: để pull Docker image hoặc gọi API bên ngoài) mà vẫn đảm bảo tính bảo mật không bị truy cập ngược từ Internet vào, chúng ta cần thiết lập NAT Gateway.

**Bước 1: Tạo NAT Gateway**
* Truy cập **AWS Console** → **VPC** → **NAT gateways** → **Create NAT gateway**.
* Name: `wedo-nat-gateway`.
* Subnet: Bắt buộc chọn một **Public Subnet** (Ví dụ: `wedo-workspace-subnet-public1`).
* Elastic IP allocation: Chọn **Allocate Elastic IP** để AWS cấp phát một IP tĩnh cho NAT.
* Nhấn **Create NAT gateway** và chờ vài phút để trạng thái chuyển sang *Available*.
![Khởi tạo NAT Gateway](/images/5-Workshop/5.3-IAM-Infrastructure/nat-create.jpg)
![NAT Gateway thành công](/images/5-Workshop/5.3-IAM-Infrastructure/nat-success.png)

**Bước 2: Cập nhật Route Table cho Private Subnet**
* Chuyển sang menu **Route tables** trong VPC.
* Tìm và chọn Route Table đang được liên kết với các **Private Subnets** (Ví dụ: `wedo-workspace-rtb-private`).
![Chọn Private Route Table](/images/5-Workshop/5.3-IAM-Infrastructure/rtb-private.jpg)
* Chuyển sang tab **Routes** → Nhấn **Edit routes**.
* Nhấn **Add route**:
  * Destination: `0.0.0.0/0` (Đại diện cho toàn bộ luồng traffic đi ra Internet).
  * Target: Chọn **NAT Gateway** và trỏ vào con `wedo-nat-gateway` vừa tạo ở Bước 1.
* Nhấn **Save changes** để lưu lại.
![Trỏ Route ra NAT Gateway](/images/5-Workshop/5.3-IAM-Infrastructure/rtb-save-route.png)

Từ lúc này, các Container nằm trong Private Subnet đã có thể an toàn đi ra Internet thông qua "cửa khẩu" NAT Gateway.