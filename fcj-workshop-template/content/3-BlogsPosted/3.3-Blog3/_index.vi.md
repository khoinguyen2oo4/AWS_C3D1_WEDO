---
title: "Blog 3"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 3.3. </b> "
---
# TỐI ƯU HIỆU NĂNG VÀ GIẢM TẢI DB: KIẾN TRÚC CACHING CHIẾN LƯỢC CACHE-ASIDE VỚI SPRING BOOT VÀ AMAZON ELASTICACHE

Bài viết chia sẻ một giải pháp kiến trúc thực chiến giúp tăng tốc độ phản hồi API đáng kể và giải quyết triệt để bài toán nghẽn cổ chai (bottleneck) cho cơ sở dữ liệu quan hệ khi traffic tăng đột biến. Bằng cách sử dụng chiến lược Cache-Aside (Lazy Loading) với Amazon ElastiCache (Redis), hệ thống giảm thiểu chi phí scale-up đắt đỏ, tối ưu I/O và mang lại độ trễ cực thấp cho các ứng dụng backend Spring Boot.
 
**Các điểm chính cần nắm:**
* **Giảm tải cơ sở dữ liệu (Database Offloading):** Giảm tới 80% áp lực truy vấn đọc (SELECT) lặp đi lặp lại cho Amazon RDS, giúp tiết kiệm CPU và tránh nghẽn I/O hệ thống.
* **Độ trễ cực thấp (Ultra-low Latency):** Sử dụng Amazon ElastiCache (Redis) làm lớp đệm In-memory, lưu trữ các key-value có tần suất truy cập lớn, trả về dữ liệu cho Client với độ trễ chỉ dưới 2 mili-giây.
* **Tự động co giãn (Auto Scaling):** Môi trường serverless Amazon ECS (AWS Fargate) kết hợp cùng Application Load Balancer (ALB) giúp điều phối traffic thông minh và tự động mở rộng tài nguyên tính toán mà không cần quản lý hệ điều hành.
* **Bảo mật thông tin (Security & Credentials):** Tích hợp AWS Secrets Manager để lưu trữ và quản lý an toàn chuỗi kết nối cơ sở dữ liệu (Database Credentials), loại bỏ hoàn toàn rủi ro hardcode trong source code.
* **Kiến trúc mạng an toàn (Network Isolation):** Cơ sở dữ liệu RDS và cụm ElastiCache được đặt an toàn tuyệt đối bên trong Private Subnet, chỉ cho phép kết nối nội bộ từ cụm ECS.
 
![Sơ đồ kiến trúc Cache-Aside](/images/3-blogsposted/blog3/blog3.jpg)

**Hướng dẫn triển khai chi tiết:**
 
1. **Tiếp nhận và điều phối lượng truy cập (Application Load Balancer):** Client (Web/Mobile App) gửi request (ví dụ: lấy thông tin profile, danh mục sản phẩm, hoặc tracking real-time) đến hệ thống. Application Load Balancer (ALB) tiếp nhận và phân bổ đều lượng traffic này xuống các container Spring Boot đang chạy trên cụm Amazon ECS.
 
2. **Xử lý logic và xác thực an toàn (Amazon ECS & AWS Secrets Manager):** Ứng dụng Spring Boot chạy trên môi trường ECS Fargate tiến hành chặn request. Trước khi thực thi truy vấn, ứng dụng gọi đến AWS Secrets Manager để lấy thông tin xác thực an toàn, chuẩn bị cho việc kết nối vào cơ sở dữ liệu hoặc cache.
 
3. **Kiểm tra lớp đệm tốc độ cao (Amazon ElastiCache - Cache Hit):** Spring Boot kiểm tra xem dữ liệu (Key) được yêu cầu đã tồn tại trong Amazon ElastiCache (Redis) chưa. Nếu dữ liệu có sẵn (Cache Hit), ứng dụng lập tức lấy và trả về cho Client. Độ trễ của toàn bộ tiến trình này chỉ ở mức dưới 2 mili-giây, bỏ qua hoàn toàn việc truy vấn xuống Database.
 
4. **Truy vấn Database gốc và cập nhật Cache (Amazon RDS - Cache Miss):** Trong trường hợp dữ liệu chưa có trong Redis (Cache Miss), Spring Boot sẽ tiến hành truy vấn dữ liệu gốc từ Amazon RDS. Sau khi lấy được kết quả, dữ liệu này lập tức được ghi ngược lại vào ElastiCache kèm theo thời gian hết hạn (TTL - Time To Live) hợp lý nhằm sẵn sàng phục vụ với tốc độ cao nhất cho các request tiếp theo.
 
5. **Trả kết quả cho Client:** Kết quả cuối cùng được trả về cho API Gateway/ALB và chuyển định dạng thành JSON trước khi gửi lại cho Client, hoàn tất một vòng đời (workflow) tối ưu của request.
