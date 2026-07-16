---
title: "Blog 2"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 3.2. </b> "
---
# Tối ưu hóa hiệu năng ứng dụng Spring Boot Serverless trên AWS Lambda với tính năng SnapStart
Bài viết giới thiệu kiến trúc thực chiến ứng dụng Spring Boot trên nền tảng AWS Serverless, tối ưu hóa hiệu năng bằng tính năng SnapStart để giải quyết bài toán "Cold Start" nan giải cho các hệ thống Java hiện đại. Giải pháp này giúp chuyển hóa quy trình khởi động vốn nặng nề, tốn thời gian của các ứng dụng truyền thống thành một cơ chế khôi phục trạng thái tức thì. Từ đó, giải quyết triệt để rào cản về độ trễ trong môi trường Serverless, giúp các doanh nghiệp hiện đại hóa hệ thống Microservices một cách linh hoạt, ổn định và tối ưu hóa chi phí vận hành tối đa.
**Đặt vấn đề**: Ứng dụng Spring Boot truyền thống khi chuyển đổi sang kiến trúc Serverless (AWS Lambda) thường gặp vấn đề "Cold Start" đáng kể do thời gian khởi tạo Application Context và thư viện quá dài, làm giảm trải nghiệm người dùng

**Giải pháp kiến trúc**: Triển khai AWS Lambda tích hợp SnapStart để tối ưu hóa thời gian khởi động thông qua cơ chế khôi phục trạng thái từ snapshot. Hệ thống kết hợp Amazon API Gateway, AWS Secrets Manager để bảo mật thông tin, và Amazon RDS trong Private Subnet để đảm bảo an toàn dữ liệu

**Quy trình thực thi**: Yêu cầu từ người dùng thông qua API Gateway kích hoạt AWS Lambda. SnapStart giúp Lambda khôi phục trạng thái nhanh chóng, bỏ qua quá trình khởi động nặng. Lambda sau đó truy xuất thông tin bảo mật từ Secrets Manager và thực thi truy vấn dữ liệu từ Amazon RDS

**Đánh giá giải pháp**: Giải pháp giải quyết triệt để vấn đề Cold Start cho Java, hỗ trợ khả năng tự động mở rộng linh hoạt và tối ưu chi phí vận hành cho các doanh nghiệp đang hiện đại hóa hệ thống hoặc chuyển đổi sang Microservices

![AI Diet Tracker Architecture Diagram](/images/3-blogsposted/blog2/blog2.png)