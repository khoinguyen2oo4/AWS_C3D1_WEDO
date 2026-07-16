---
title: "Worklog Tuần 8"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.8. </b> "
---


### Mục tiêu tuần 8:
* Bảo vệ ứng dụng web khỏi các lỗ hổng bảo mật phổ biến bằng AWS WAF.
* Phân loại, tổ chức và quản lý tài nguyên AWS quy mô lớn sử dụng Tags và Resource Groups.
* Áp dụng nguyên tắc đặc quyền tối thiểu (least privilege) trong IAM bằng cách kiểm soát quyền truy cập EC2 thông qua Resource Tags.
* Thiết lập hệ thống giám sát và trực quan hóa dữ liệu hiệu suất (metrics) với Grafana.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **AWS WAF:** Tìm hiểu Tường lửa ứng dụng web (WAF). Thiết lập các quy tắc tùy chỉnh để ngăn chặn các rủi ro bảo mật phổ biến (như SQL Injection, Cross Site Scripting thuộc top 10 OWASP). | 08/06/2026 | 08/06/2026 | https://000026.awsstudygroup.com/1-introduction/ |
| 3 | **Tags & Resource Groups:** Thực hành gán siêu dữ liệu (Tags) dạng key-value cho tài nguyên. Khởi tạo Resource Groups dựa trên các truy vấn Tag để quản lý và tự động hóa tác vụ hàng loạt. | 09/06/2026 | 09/06/2026 | https://000027.awsstudygroup.com/1-introduction/ |
| 5 | **Quản lý truy cập EC2 với IAM & Tags:** Thiết lập IAM Policies và Roles kèm theo điều kiện (IAM policy conditions). Phân quyền cho EC2 Administrator dựa trên các Resource Tags cụ thể nhằm phi tập trung hóa quản trị. | 11/06/2026 | 11/06/2026 | https://000028.awsstudygroup.com/1-introduction/ |
| 6 | **Giám sát với Grafana:** Cài đặt phần mềm mã nguồn mở Grafana trên máy chủ Linux EC2. Truy vấn, trực quan hóa và thiết lập cảnh báo từ các luồng dữ liệu metrics khổng lồ để giám sát tài nguyên AWS. | 12/06/2026 | 12/06/2026 | https://000029.awsstudygroup.com/1-introduction/ |

### Kết quả đạt được tuần 8:
* **Bảo mật ứng dụng (AWS WAF):** Có khả năng thiết lập hệ thống phòng thủ chuyên sâu cho ứng dụng web, chủ động chặn/cho phép các HTTP requests độc hại trước khi chúng tiếp cận hệ thống.
* **Tổ chức tài nguyên (Tags & Resource Groups):** Làm chủ kỹ năng phân loại tài nguyên theo mục đích, chủ sở hữu hoặc môi trường, từ đó tối ưu hóa việc quản lý và thao tác trên hàng ngàn tài nguyên cùng lúc.
* **Bảo mật phân quyền (IAM):** Triển khai thành công mô hình quản trị phi tập trung và nguyên tắc đặc quyền tối thiểu. Kiểm soát chặt chẽ việc khởi tạo và quản lý tài nguyên EC2 thông qua các điều kiện ràng buộc bởi Tags.
* **Giám sát trực quan (Grafana):** Tự xây dựng được hệ thống giám sát độc lập, tích hợp thành công Grafana để vẽ biểu đồ và phân tích tình trạng sức khỏe của hạ tầng ứng dụng theo thời gian thực.