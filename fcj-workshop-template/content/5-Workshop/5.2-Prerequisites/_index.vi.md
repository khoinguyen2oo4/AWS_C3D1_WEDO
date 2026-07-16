---
title : "Các bước chuẩn bị"
date : 2024-01-01 
weight : 2
chapter : false
pre : " <b> 5.2. </b> "
---

### 5.2.1. Yêu cầu về Tài khoản AWS (AWS Account Requirements)
Để thực hành trơn tru toàn bộ các bài Lab trong Workshop này, bạn cần:
* **Tài khoản AWS:** Một tài khoản đang hoạt động (có thể dùng tài khoản Shared của nhóm). Khuyến nghị người dùng có quyền quản trị trị viên (Administrator Access) để khởi tạo VPC, IAM Role và các dịch vụ cốt lõi.
* **Khu vực triển khai (Region):** Khuyến nghị sử dụng Region `ap-southeast-1` (Singapore) để tối ưu hóa độ trễ kết nối.
* **Cảnh báo chi phí:** Dù thiết kế được tối ưu cho AWS Free Tier, hệ thống kiến trúc Multi-AZ sử dụng một số tài nguyên (như NAT Gateway hay Application Load Balancer) sẽ tính phí theo giờ. Hãy đảm bảo bạn đã thiết lập **AWS Budgets** cảnh báo qua email khi chi phí vượt quá $5.

### 5.2.2. Công cụ cài đặt trên máy tính (Local Environment)
Hãy đảm bảo cỗ máy của bạn (như chiếc MSI Bravo 15) đã được cài đặt đầy đủ các phần mềm và môi trường sau:
* **Docker Desktop:** Bắt buộc phải có để đóng gói (Containerize) mã nguồn Java Spring Boot thành Image trước khi đẩy lên Amazon ECR.
* **Java Development Kit (JDK 17+) & Maven:** Để biên dịch, chạy thử và debug Backend ở môi trường Local.
* **Node.js (18+) & npm/yarn:** Cần thiết để tải thư viện và build giao diện tĩnh của Frontend ReactJS/NextJS.
* **AWS CLI v2:** Công cụ dòng lệnh để giao tiếp, tải file và xác thực với tài khoản AWS trực tiếp từ Terminal.
* **Git & Code Editor:** Visual Studio Code hoặc IntelliJ IDEA để thao tác với mã nguồn dự án dễ dàng.

### 5.2.3. Kiến thức nền tảng (Knowledge Assumptions)
Workshop này đi sâu vào triển khai hệ thống thực chiến chuẩn doanh nghiệp. Để theo kịp tiến độ, bạn nên làm quen trước với:
* **Mạng cơ bản:** Các khái niệm về IP tĩnh, Subnetting, Port, và giao thức mạng (TCP/HTTP/HTTPS).
* **Kiến trúc Container:** Hiểu cách hoạt động cơ bản của Docker và cách viết một Dockerfile.
* **Web Application:** Nắm vững mô hình Client - Server, cơ chế xác thực JWT và cách hoạt động của RESTful API.