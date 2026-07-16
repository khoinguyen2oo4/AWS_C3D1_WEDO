---
title : "Xác thực-Biên"
date : 2024-01-01
weight : 7
chapter : false
pre : " <b> 5.7. </b> "
---

Dựa trên sơ đồ kiến trúc tổng thể, lớp **Global (Bảo mật biên)** đóng vai trò là lá chắn đầu tiên tiếp nhận lưu lượng truy cập từ Internet. Trong module này, chúng ta sẽ thiết lập bộ ba dịch vụ Amazon CloudFront, AWS WAF và Amazon Route 53 để phân phối nội dung và bảo vệ hệ thống khỏi các cuộc tấn công mạng.

### 5.7.1. Cấu hình mạng phân phối nội dung (Amazon CloudFront)
Thay vì để người dùng truy cập trực tiếp vào S3 (có độ trễ cao nếu ở xa), chúng ta dùng CloudFront làm CDN để lưu trữ đệm (cache) giao diện ở các máy chủ biên (Edge Locations) trên toàn cầu.

* Truy cập **AWS Console** → **CloudFront** → **Create Distribution**.
* **Origin:**
  * Origin type: Chọn **Amazon S3**.
  * Origin domain: Chọn Bucket `wedo-frontend-2026` chứa mã nguồn React.
![Cấu hình CloudFront Origin](/images/5-Workshop/5.7-Edge-Security/cloudfront-origin.jpg)

### 5.7.2. Tích hợp Tường lửa ứng dụng web (AWS WAF)
WAF được tích hợp trực tiếp vào CloudFront để lọc các luồng traffic độc hại (ví dụ: DDoS ở layer 7, SQL Injection, XSS) trước khi chúng kịp chạm tới S3 hay Backend.

* Tại mục **Enable security** trong lúc tạo CloudFront:
  * Tích chọn bật **Web Application Firewall (WAF)**.
  * Lựa chọn này giúp tự động chặn các IP có rủi ro cao dựa trên hệ thống phân tích tình báo của AWS.
![Bật bảo mật WAF cho CloudFront](/images/5-Workshop/5.7-Edge-Security/cloudfront-waf.png)

* Cuộn xuống dưới cùng, kiểm tra lại toàn bộ thông tin tại mục **Review and create** và nhấn **Create distribution**.
![Xác nhận tạo CloudFront](/images/5-Workshop/5.7-Edge-Security/cloudfront-create.jpg)

### 5.7.3. Định tuyến tên miền (Amazon Route 53)
Để người dùng truy cập bằng tên miền dễ nhớ (ví dụ: `wedo-workspace.com`) thay vì một đường dẫn dài của CloudFront, chúng ta sử dụng Amazon Route 53.

* Truy cập **Route 53** → **Hosted zones**.
* Tạo một **Record (Bản ghi DNS)** mới:
  * Record name: Để trống (truy cập thẳng domain gốc) hoặc nhập subdomain (VD: `app`).
  * Record type: Chọn **A - Routes traffic to an IPv4 address and some AWS resources**.
  * Bật **Alias** → Trỏ (Route traffic to) vào **Alias to CloudFront distribution**.
  * Chọn Distribution vừa tạo ở bước trên và nhấn **Create records**.

**Kết quả nghiệm thu:** Toàn bộ luồng traffic đi vào hệ thống WeDo Workspace hiện tại đã bị bắt buộc phải đi qua tuyến đường: `Internet → Route 53 → WAF (Quét mã độc) → CloudFront (Cache)`. Đảm bảo tốc độ tải trang siêu tốc và bảo mật tối đa cho toàn bộ kiến trúc lõi bên trong.