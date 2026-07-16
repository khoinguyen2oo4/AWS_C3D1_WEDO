---
title : "Giám sát hệ thống"
date : 2024-01-01
weight : 8
chapter : false
pre : " <b> 5.8. </b> "
---

### 5.8.1. Giám sát Log Ứng dụng
Nhờ VPC Endpoint và Task Execution Role, các container Spring Boot tự động đẩy log thực thi về **Amazon CloudWatch Logs**.
* Truy cập CloudWatch Logs → Log groups để theo dõi log realtime của Backend, giúp dễ dàng debug lỗi (như lỗi Connection Refused của Database).
![CloudWatch Log Group](/images/5-Workshop/5.8-Monitoring/cloudwatch-logs.jpg)

### 5.8.2. Thiết lập CloudWatch Alarms
Cấu hình cảnh báo dựa trên Metric `CPUUtilization` và `MemoryUtilization` của cụm ECS Cluster.
* Thiết lập: Nếu CPU vượt quá 80% trong 5 phút liên tục, hệ thống sẽ tự động gửi cảnh báo để quản trị viên kịp thời xử lý.
![CloudWatch Alarms](/images/5-Workshop/5.8-Monitoring/cloudwatch-alarm.jpg)