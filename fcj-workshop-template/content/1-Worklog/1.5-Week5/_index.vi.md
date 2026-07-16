---
title: "Worklog Tuần 5"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.5. </b> "
---



### Mục tiêu tuần 5:
* Nắm vững kỹ thuật di chuyển máy ảo giữa môi trường on-premises và AWS bằng VM Import/Export.
* Thành thạo quy trình triển khai, quản lý và vận hành ứng dụng trong môi trường container hóa (Docker, Amazon ECR, Nginx).
* Hiểu rõ kiến trúc Amazon ECS, các chiến lược cập nhật phiên bản (Rolling, Blue/Green) và quy trình tự động hóa CI/CD.
* Giám sát hệ thống container và quản lý log hiệu quả bằng CloudWatch Container Insights và FireLens.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **VM Import/Export:** Thực hành tính năng import/export image máy ảo từ môi trường on-premises (như VMware) lên Amazon EC2 để phục vụ di chuyển ứng dụng hoặc sao lưu (Disaster Recovery). Tìm hiểu lưu trữ Amazon S3. | 18/05/2026 | 18/05/2026 | https://000014.awsstudygroup.com/1-introduction/ |
| 3-5 | **Triển khai ứng dụng với Docker Containers:** Xây dựng và quản lý quy trình triển khai bằng Docker Hub, Amazon ECR, Amazon EC2 và Amazon RDS. Cấu hình Nginx làm Reverse Proxy và Load Balancer để điều hướng lưu lượng từ Client đến Frontend/Backend. | 19/05/2026 | 21/05/2026 | https://000015.awsstudygroup.com/1-introduction/ |
| 6 | **Study - ECS, CI/CD & Monitoring:** Nghiên cứu kiến trúc Amazon ECS (Task, Service, Cluster, Fargate/EC2). Tìm hiểu các nền tảng CI/CD (GitHub Actions, GitLab CI/CD, AWS CodePipeline) và công cụ giám sát (CloudWatch Container Insights, FireLens). | 22/05/2026 | 22/05/2026 | https://000016.awsstudygroup.com/1-introduction/ <br>&emsp; https://000017.awsstudygroup.com/1-introduction/|
| 7 | Sự kiện: Tham gia Event 2. | 23/05/2026 | 23/05/2026 | [Xem báo cáo Event 2](/4-eventparticipated/4.2-event2/) |

### Kết quả đạt được tuần 5:
* **Di chuyển & Lưu trữ đám mây:** Có khả năng chuyển đổi và đưa các image máy ảo (VM) từ môi trường cục bộ lên hạ tầng Amazon EC2 một cách an toàn, đáp ứng tốt cho các kịch bản di chuyển khối lượng công việc (workloads) và khắc phục thảm họa.
* **Container hóa & Vận hành ứng dụng:** Thiết lập thành công môi trường ứng dụng container hóa toàn diện. Cấu hình mượt mà luồng xử lý yêu cầu (workflow) từ Internet Gateway qua Nginx đến các container Frontend/Backend và kết nối an toàn với cơ sở dữ liệu Amazon RDS.
* **Kiến trúc ECS & Tự động hóa CI/CD:** Nắm bắt sâu sắc cách thức hoạt động của Amazon ECS, phân biệt rõ các chiến lược Cluster/Service Scaling và các phương pháp triển khai an toàn (Rolling vs Blue/Green). Hiểu rõ vòng đời tự động hóa CI/CD nhằm tối ưu hóa quá trình xây dựng, kiểm thử và phát hành phần mềm.
* **Giám sát & Định tuyến Log:** Tích lũy kiến thức thiết lập giám sát hiệu suất container (CPU, RAM, Network) với CloudWatch Container Insights và biết cách định tuyến log linh hoạt bằng tính năng FireLens.