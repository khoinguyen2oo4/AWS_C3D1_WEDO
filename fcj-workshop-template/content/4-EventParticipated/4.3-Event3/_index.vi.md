---
title: "Event 3"
date: 2026-06-20
weight: 3
chapter: false
pre: " <b> 4.3. </b> "
---

# Bài thu hoạch “AWS GameDay - 8 Đội Tranh Hùng”

### Mục Đích Của Sự Kiện
- Tạo sân chơi thực chiến để áp dụng trực tiếp các kiến thức AWS đã học vào giải quyết các bài toán hệ thống thực tế.
- Rèn luyện kỹ năng xử lý sự cố (Troubleshooting), tối ưu hóa kiến trúc dưới áp lực thời gian.
- Nâng cao tinh thần làm việc nhóm (Teamwork) thông qua hình thức thi đấu đối kháng, tranh tài trực tiếp giữa 8 đội thi.

### Hình Thức Tổ Chức
- **Quy mô:** Trận tranh tài nảy lửa giữa 8 đội thi xuất sắc nhất.
- **Cách thức:** Các đội thi đấu tính điểm thông qua việc giải quyết các tình huống hệ thống hỏng hóc (break/fix), triển khai hạ tầng theo yêu cầu và trả lời nhanh các bộ đề trắc nghiệm kiến trúc chuyên sâu.

### Nội Dung Nổi Bật

#### Thử thách xử lý sự cố thực tế (Break/Fix)
- Hệ thống bị đưa vào các tình huống lỗi giả định (ví dụ: sập EC2, đứt kết nối mạng VPC, lỗi phân quyền IAM).
- Các đội phải nhanh chóng đọc log, khoanh vùng sự cố và khôi phục dịch vụ (Disaster Recovery) trong thời gian ngắn nhất để hệ thống hoạt động trở lại và không mất điểm.

#### Tối ưu hóa hệ thống (Optimization)
- Từ một kiến trúc cơ bản, các đội được yêu cầu scale up (mở rộng) hệ thống để chịu tải lớn khi lượng traffic tăng đột biến.
- Đưa ra quyết định lựa chọn dịch vụ phù hợp để vừa đảm bảo hiệu năng (Performance) vừa tối ưu chi phí (Cost).

#### Vượt ải các bộ đề tình huống kiến trúc (Architecture Quizzes)
- Trả lời chớp nhoáng các câu hỏi tình huống thực tế của doanh nghiệp để rà soát độ hiểu sâu về các Core Services của AWS.

### Những Gì Học Được

#### Tư Duy Nhạy Bén & Giải Quyết Vấn Đề
- Không hoảng loạn khi hệ thống báo lỗi. Áp dụng tư duy rà soát từng lớp (Network -> Security -> Compute -> Database) để tìm ra Root Cause (nguyên nhân gốc rễ).
- Học cách đưa ra quyết định nhanh chóng và chính xác dưới áp lực thời gian đếm ngược.

#### Kỹ Năng Làm Việc Nhóm (Teamwork)
- Phân chia công việc rõ ràng: Người check log, người cấu hình hạ tầng, người tra cứu tài liệu.
- Kỹ năng giao tiếp ngắn gọn, báo cáo tình trạng liên tục (sync-up) để cả đội cùng nắm bắt tiến độ và không dẫm chân lên nhau.

#### Củng cố kiến thức các dịch vụ AWS
- Phân biệt rõ ràng Use-case của từng loại dịch vụ (Khi nào dùng Relational DB, khi nào dùng NoSQL).
- Hiểu sâu hơn về cách cấu hình High Availability và Auto Scaling trong môi trường production.

### Trải nghiệm trong sự kiện

Tham gia sự kiện **“GameDay - 8 Đội Tranh Hùng”** là một trong những trải nghiệm bùng nổ và đáng nhớ nhất trong quá trình thực tập. Khác với việc tự học hay làm lab một mình, GameDay đẩy không khí lên mức cao trào với bảng xếp hạng điểm số (Leaderboard) thay đổi liên tục.

#### Cảm giác "căng não" nhưng cực kỳ phấn khích
- Việc tranh đua từng điểm số với đội còn lại đòi hỏi sự tập trung cao độ. Cảm giác khi cả đội cùng hò reo vì fix thành công một lỗi cấu hình mạng hóc búa thực sự rất tuyệt vời.

#### Đưa ra quyết định kiến trúc sắc bén
- Trải nghiệm đáng nhớ nhất là phần thi giải quyết các bộ đề tình huống. Bằng nền tảng kiến thức đã được rèn luyện, team có thể phân tích keyword cực nhanh. 
- Điển hình như tình huống ở **Bộ Đề 3**: Yêu cầu tìm kiếm một dịch vụ cơ sở dữ liệu phi quan hệ (non-relational database) linh hoạt, tốc độ cao và có khả năng mở rộng mạnh mẽ để đáp ứng traffic khó đoán cho một ứng dụng Mobile App của Startup. Dựa vào các từ khóa *"flexible"*, *"scalable non-relational database"*, đáp án chính xác **Amazon DynamoDB** được đưa ra ngay lập tức một cách đầy tự tin.

#### Một số hình ảnh khi tham gia sự kiện

*Hình ảnh đội thi đấu*

![Event GameDay](/images/4-EventParticipated/event3/event3-1.JPG)

*Minh chứng*
![Event GameDay](/images/4-EventParticipated/event3/event3-2.JPG)

> Tổng thể, sự kiện GameDay không chỉ là một cuộc thi, mà là một buổi diễn tập thực chiến hoàn hảo. Nó giúp tôi tự tin hơn rất nhiều vào khả năng vận hành AWS của bản thân và rèn luyện được tinh thần thép khi đối mặt với các sự cố hệ thống thực tế.