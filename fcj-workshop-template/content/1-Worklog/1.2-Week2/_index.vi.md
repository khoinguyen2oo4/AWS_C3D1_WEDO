---
title: "Worklog Tuần 2"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 1.2. </b> "
---


### Mục tiêu tuần 2:
* Nắm vững cách quản lý danh tính và truy cập bằng AWS IAM.
* Xây dựng hạ tầng mạng bảo mật với Amazon VPC và Site-to-Site VPN.
* Triển khai tài nguyên máy tính (Amazon EC2) và khắc phục các sự cố kết nối mạng.
* Hiểu các khái niệm quản lý cơ sở dữ liệu quan hệ với Amazon RDS.

### Các công việc cần triển khai trong tuần này:
| Thứ | Công việc | Ngày bắt đầu | Ngày hoàn thành | Nguồn tài liệu |
| :--- | :--- | :--- | :--- | :--- |
| 2 | **Kiểm soát truy cập AWS IAM:** Cấu hình kiểm soát truy cập chi tiết, quản lý User, Group và Policy. Triển khai IAM Roles (Switch Roles) tuân thủ nguyên tắc đặc quyền tối thiểu. | 27/04/2026 | 27/04/2026 | https://000002.awsstudygroup.com/ |
| 3 | **Amazon VPC & Site-to-Site VPN:** Xây dựng kiến trúc VPC từ đầu, cấu hình Security Group/NACL và triển khai các kết nối Site-to-Site VPN bảo mật. | 28/04/2026 | 28/04/2026 | https://000003.awsstudygroup.com/ |
| 4-5 | **Amazon EC2:** Triển khai ứng dụng Node.js CRUD (AWS User Management) trên các instance Windows và Amazon Linux. Khắc phục và giải quyết sự cố kết nối từ xa trên VS Code. | 29/04/2026 | 30/04/2026 | https://000004.awsstudygroup.com/ |
| 6 | **Amazon RDS:** Tìm hiểu về các engine cơ sở dữ liệu được hỗ trợ, tùy chọn lưu trữ, Tính sẵn sàng cao (Multi-AZ), khắc phục thảm họa, các tính năng bảo mật và sao lưu tự động. | 01/05/2026 | 01/05/2026 | https://000005.awsstudygroup.com/ |

### Kết quả đạt được tuần 2:
* **Bảo mật & Danh tính (IAM):** Thiết lập thành công cấu trúc quản trị cơ bản, áp dụng các IAM policy chi tiết và sử dụng IAM Roles để kiểm soát truy cập tạm thời, an toàn thay vì gán quyền trực tiếp.
* **Mạng (VPC & VPN):** Có kinh nghiệm thực tế trong việc xây dựng môi trường mạng bảo mật, hiểu các khái niệm cốt lõi của VPC và đảm bảo an toàn lưu lượng truyền tải giữa các môi trường on-premises và AWS.
* **Tính toán & Khắc phục sự cố (EC2):** Triển khai ứng dụng Node.js hoạt động ổn định trên các môi trường hệ điều hành khác nhau. Chẩn đoán và giải quyết thành công sự cố kết nối từ xa giữa Visual Studio Code và EC2 instance bằng cách xác định và sửa lỗi cấu hình sai địa chỉ IP.
* **Quản lý cơ sở dữ liệu (RDS):** Nắm vững kiến thức nền tảng về cơ sở dữ liệu quan hệ được quản lý trên AWS, hiểu rõ sự khác biệt giữa các tùy chọn lưu trữ, khi nào nên sử dụng Multi-AZ để đảm bảo tính sẵn sàng cao và các trường hợp sử dụng phù hợp cho khối lượng công việc OLTP.