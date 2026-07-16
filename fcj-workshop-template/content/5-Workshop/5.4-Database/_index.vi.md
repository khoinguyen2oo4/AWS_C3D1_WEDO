---
title : "Database"
date : 2024-01-01 
weight : 4 
chapter : false
pre : " <b> 5.4. </b> "
---

### 5.4.1. Chuẩn bị Security Groups (Tường lửa bảo mật)
Trước khi tạo Database và File System, việc quan trọng nhất là thiết lập tường lửa. Nguyên tắc bảo mật cốt lõi: RDS và EFS chỉ được phép nhận kết nối từ Backend (Spring Boot), tuyệt đối chặn mọi luồng truy cập trực tiếp từ Internet.

* **Security Group cho EFS (`wedo-efs-sg`):** Thêm Inbound Rule cho phép giao thức **NFS (Port 2049)**. Phần Source (nguồn) chọn thẳng vào tên Security Group của Backend (`wedo-backend-sg`).
![Cấu hình Security Group cho EFS](/images/5-Workshop/5.4-Database/sg-efs.png)

* **Security Group cho RDS (`wedo-db-sg`):** Thêm Inbound Rule cho phép giao thức **MYSQL/Aurora (Port 3306)**. Phần Source cũng trỏ trực tiếp về Security Group của Backend.
![Cấu hình Security Group cho RDS](/images/5-Workshop/5.4-Database/sg-db.jpg)

### 5.4.2. Khởi tạo Amazon EFS (Elastic File System)
EFS sẽ hoạt động như một ổ cứng mạng khổng lồ, được mount (gắn) trực tiếp vào các Container của Spring Boot để lưu trữ các file báo cáo đính kèm do người dùng tải lên.

* Truy cập **AWS Console** → Tìm kiếm **EFS** → **Create file system** (Nhấn nút **Customize** để cấu hình chi tiết).
* **Name:** `wedo-uploads-efs`.
* **VPC:** Chọn VPC của dự án (`wedo-workspace-vpc`).
![Tạo file system EFS](/images/5-Workshop/5.4-Database/efs-create.jpg)

* Giữ nguyên các thông số Recommended (khuyên dùng) như Elastic Throughput và Automatic backups. 
* Nhấn **Create file system** và chờ đợi đến khi trạng thái chuyển sang **Available**.
![EFS tạo thành công](/images/5-Workshop/5.4-Database/efs-success.png)

### 5.4.3. Khởi tạo Cơ sở dữ liệu Amazon RDS (MySQL)
Dữ liệu nghiệp vụ cốt lõi của WeDo Workspace (thông tin dự án, task, người dùng) sẽ được lưu trữ tại cụm Database này với cấu trúc High Availability (Đa vùng sẵn sàng).

* Truy cập **AWS Console** → **RDS** → **Databases** → **Create database**.
* Choose a database creation method: **Full configuration**.
* Engine options: Chọn **MySQL**.
* Templates: Chọn **Dev/Test**.
* Availability and durability: Chọn **Multi-AZ DB instance deployment** để hệ thống tự động tạo một bản sao lưu (standby) ở Availability Zone khác.
![Cấu hình Template và Multi-AZ](/images/5-Workshop/5.4-Database/rds-template.jpg)

* **Settings:**
  * DB cluster identifier: `wedo-database`.
  * Master username: `admin`.
  * **Credentials management:** Tích chọn **Managed in AWS Secrets Manager**. Đây là tính năng bảo mật cao cấp, AWS sẽ tự động sinh mật khẩu ngẫu nhiên và cất an toàn vào Secrets Manager, giúp chúng ta không cần phải hardcode mật khẩu.
![Cấu hình Settings RDS](/images/5-Workshop/5.4-Database/rds-settings.png)

* **Instance & Storage configuration:** * Chọn class `db.m5d.large` (hoặc class phù hợp).
  * Storage type: Chọn **General Purpose SSD (gp3)** và phân bổ **20 GiB** dung lượng.
![Cấu hình Ổ cứng RDS](/images/5-Workshop/5.4-Database/rds-storage.png)

* **Connectivity:**
  * Compute resource: **Don't connect to an EC2 compute resource**.
  * Virtual private cloud (VPC): Chọn `wedo-workspace-vpc`.
  * Public access: **No** (Đảm bảo Database không bị phơi ra Internet).
  * VPC security group: Chọn **Choose existing** và xóa nhóm mặc định, chỉ chọn `wedo-db-sg` đã tạo ở bước 5.4.1.
![Cấu hình Network RDS](/images/5-Workshop/5.4-Database/rds-network.png)

* Kéo xuống dưới cùng và nhấn **Create database**. Quá trình khởi tạo Multi-AZ có thể mất từ 10 - 15 phút.

**Kết quả nghiệm thu:** Sau khi chờ đợi, cơ sở dữ liệu đã chuyển sang trạng thái **Available** thành công!
![RDS tạo thành công](/images/5-Workshop/5.4-Database/rds-success.png)