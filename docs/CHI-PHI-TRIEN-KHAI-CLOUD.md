# BÁO CÁO DỰ TOÁN KINH PHÍ HẠ TẦNG CLOUD
(Dự kiến vận hành cho hệ thống Quản lý suất ăn - 2026)

Hệ thống được thiết kế theo kiến trúc hiện đại, tách biệt Frontend, Backend và Database để đảm bảo tốc độ và khả năng mở rộng. Dưới đây là dự toán kinh phí cho các gói dịch vụ "Production" (Chạy chính thức - không bị ngủ đông).

## 1. Bảng tổng hợp chi phí hàng tháng

| Nền tảng | Dịch vụ | Gói đề xuất | Chi phí (USD) | Chi phí (VNĐ) | Ghi chú |
|----------|---------|-------------|---------------|---------------|---------|
| **Vercel** | Giao diện (Frontend) | Pro Plan | $20 / tháng | ~500.000đ | Không giới hạn băng thông, bảo mật cao |
| **Render** | Xử lý (Backend API) | Standard | $20 / tháng | ~500.000đ | RAM 1GB, CPU 1 nhân, chạy 24/7 |
| **Neon** | Database (PostgreSQL) | Launch | ~$5 - $10 / tháng | ~125 - 250.000đ | Thanh toán theo lưu lượng sử dụng thực tế |
| **TỔNG CỘNG** | | | **~$45 - $50** | **~1.125.000 - 1.250.000đ** | |

---

## 2. Chi tiết các gói dịch vụ

### a. Vercel Pro (Dành cho Frontend Next.js)
- **Lý do chọn**: Vercel là "cha đẻ" của Next.js, giúp trang web load cực nhanh tại Việt Nam. Gói Pro là bắt buộc nếu dùng cho mục đích thương mại/doanh nghiệp.
- **Ưu điểm**: Tự động tối ưu hóa hình ảnh, bảo mật DDoS, không bao giờ bị chậm hay "treo" server.

### b. Render Standard (Dành cho Node.js API)
- **Lý do chọn**: Đảm bảo API luôn sẵn sàng 24/7. Các gói Free sẽ bị "ngủ" sau 15 phút không dùng, khiến nhân viên phải đợi 30s mới quét được mã QR lần đầu trong ngày. Gói Standard giúp phản hồi quét mã ngay lập tức (<1 giây).
- **Cấu hình**: 1GB RAM là mức an toàn để xử lý hàng trăm yêu cầu cùng lúc khi nhân viên tập trung ăn trưa.

### c. Neon Launch (Dành cho Database)
- **Lý do chọn**: Neon cực kỳ mạnh mẽ với khả năng "Autoscaling" (tự mở rộng khi đông người và thu nhỏ khi vắng).
- **Chi phí**: Bạn chỉ trả tiền khi có người truy cập dữ liệu. Với quy mô công ty, chi phí thường không quá $10/tháng.

---

## 3. Phân tích Hiệu quả & Rủi ro (ROI vs Risk)

- **Tại sao không dùng gói miễn phí (Free Tier)?**
    *   **Rủi ro**: Gói Free sẽ khiến hệ thống bị trễ (Cold Start). Nhân viên đứng xếp hàng quét mã mà phải đợi 30s để server "tỉnh dậy" sẽ gây ùn tắc và ức chế tại nhà ăn.
    *   **Dữ liệu**: Gói Free của database thường giới hạn dung lượng và thời gian lưu trữ (Ví dụ Neon free chỉ lưu trữ 500MB).

- **Hiệu quả**: 
    *   Với mức phí **~1.2 triệu/tháng**, hệ thống hoạt động ổn định như một phần mềm chuyên nghiệp của các tập đoàn lớn. 
    *   So với số tiền tiết kiệm được (**~14 triệu/tháng**), chi phí hạ tầng này chỉ chiếm chưa đầy **10%** tổng giá trị làm lợi.

## 4. Ghi chú thanh toán
- Các dịch vụ này yêu cầu thẻ thanh toán quốc tế (Visa/Mastercard).
- Hóa đơn (Invoice) được gửi hàng tháng qua Email, có thể dùng để làm chứng từ thanh toán nội bộ.
