---
title: "Blog 1"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 3.1. </b> "
---

# ĐƯA AI VÀO XÂY DỰNG ỨNG DỤNG NHẬN DIỆN CALO & PROTEIN CÙNG AWS SERVERLESS

Bài viết giới thiệu kiến trúc thực chiến ứng dụng nền tảng AWS Serverless kết hợp cùng trí tuệ nhân tạo để phát triển "AI Diet Tracker" – một trợ lý cá nhân tự động phân tích và theo dõi chế độ dinh dưỡng. Giải pháp này giúp chuyển hóa công việc cân đo đong đếm thủ công, tra cứu từng lạng ức gà hay thịt bò khô khan thành một thao tác chụp ảnh đơn giản. Từ đó, giải quyết triệt để rào cản thời gian trong việc theo dõi macro (calo, protein) cho những người duy trì lịch tập luyện cường độ cao.

**Các điểm chính cần nắm:**
* **Kiến trúc Serverless toàn phần:** Sử dụng AWS Lambda và Amazon API Gateway để xử lý logic, giúp tối ưu hóa chi phí (chỉ trả tiền trên mỗi lượt gọi) và loại bỏ hoàn toàn gánh nặng vận hành máy chủ hoạt động 24/7.
* **Tự động hóa bằng AI:** Tích hợp Amazon Rekognition để phân tích hình ảnh thức ăn, tự động bóc tách nhãn (labels) và đối chiếu với cơ sở dữ liệu dinh dưỡng để quy đổi thành khối lượng macro chi tiết (ví dụ: 200g ức gà = ~330 calo & 62g protein).
* **Truy xuất dữ liệu siêu tốc:** Toàn bộ lịch sử dinh dưỡng được lưu trữ tập trung tại cơ sở dữ liệu NoSQL Amazon DynamoDB với độ trễ tính bằng mili-giây, tạo tiền đề để trích xuất thành Dashboard theo dõi tiến độ hình thể theo tuần/tháng.
* **Kiến trúc Microservices tách rời (Decoupled):** Giao diện người dùng (Frontend) phát triển bằng Flutter giao tiếp hoàn toàn độc lập với luồng xử lý Backend thông qua các API endpoint. Điều này giúp hệ thống linh hoạt, dễ dàng thay thế hoặc mở rộng sang các model Computer Vision tự huấn luyện trong tương lai mà không ảnh hưởng đến trải nghiệm người dùng.
* **Khả năng quan sát và lưu trữ an toàn:** Lưu trữ toàn bộ hình ảnh gốc an toàn trên Amazon S3 phục vụ cho việc tracking sau này, đồng thời giám sát chặt chẽ hiệu năng, độ trễ và lỗi (exceptions) của hệ thống thông qua Amazon CloudWatch.

![Sơ đồ kiến trúc AI Diet Tracker](/AWS_C3D1_WEDO/images/3-blogsposted/blog1/blog1.jpg)



**Hướng dẫn triển khai chi tiết:**

1. **Thiết lập Frontend và luồng thu thập hình ảnh:** 
   Xây dựng ứng dụng di động bằng Flutter với giao diện tối giản (minimalist tone đen). Ứng dụng tích hợp module Camera để chụp ảnh khay thức ăn. Trước khi gửi đi, hình ảnh được nén nhẹ (compress) để tối ưu payload. Mobile client sau đó sẽ thực hiện một phương thức POST mang theo dữ liệu ảnh (định dạng base64 hoặc multipart) gọi trực tiếp đến endpoint của Amazon API Gateway.

2. **Cấu hình cửa ngõ API (API Gateway) & Trigger:** 
   Thiết lập Amazon API Gateway dưới dạng REST API. Cửa ngõ này đóng vai trò tiếp nhận request, xử lý CORS cho ứng dụng di động và kích hoạt (trigger) một hàm AWS Lambda chuyên dụng. Việc này giúp bảo vệ luồng xử lý phía sau và dễ dàng gắn thêm các cơ chế xác thực (như Amazon Cognito) nếu cần phân quyền nhiều người dùng.

3. **Tích hợp AI phân tích qua AWS Lambda:** 
   Hàm AWS Lambda (viết bằng Node.js hoặc Python) đóng vai trò là "bộ não" điều phối. Tại đây, Lambda gọi hàm API `DetectLabels` của dịch vụ Amazon Rekognition để phân tích bức ảnh. Hệ thống sẽ lọc ra các nhãn liên quan đến thực phẩm (Food, Meat, Chicken, Vegetables...), sau đó chạy qua một thuật toán nội bộ để tính toán và trả về tổng lượng Calo và Protein ước tính.

4. **Ghi nhận dữ liệu có cấu trúc vào DynamoDB:** 
   Ngay khi có kết quả macro từ bước 3, AWS Lambda sẽ tiến hành định dạng lại dữ liệu (JSON) và thực thi lệnh `PutItem` vào bảng của Amazon DynamoDB. Bảng này được thiết kế với Partition Key là `UserID` và Sort Key là `Timestamp` (thời gian bữa ăn), giúp việc truy vấn lịch sử ăn uống hàng ngày diễn ra cực kỳ nhanh chóng.

5. **Lưu trữ dữ liệu thô dài hạn (Amazon S3):** 
   Song song với việc lưu các con số khô khan, AWS Lambda đẩy bản sao hình ảnh gốc của khay thức ăn vào một bucket trên Amazon S3. Việc này không chỉ giúp người dùng xem lại nhật ký bữa ăn trên app, mà còn tạo ra một nguồn dữ liệu Data Lake quý giá để huấn luyện (train) các model AI chuyên biệt hơn cho các món ăn đặc thù của Việt Nam sau này.

6. **Thiết lập giám sát và Log (Amazon CloudWatch):** 
   Cấu hình hệ thống để toàn bộ quá trình gọi hàm, thời gian xử lý AI (latency) và các luồng lỗi được AWS Lambda đẩy tự động về Amazon CloudWatch Logs. Có thể thiết lập thêm CloudWatch Alarms để gửi thông báo nếu tỷ lệ nhận diện lỗi của API tăng cao bất thường.