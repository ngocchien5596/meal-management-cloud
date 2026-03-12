PHỤ LỤC: ĐỀ XUẤT GÓI HẠ TẦNG CLOUD THEO NĂM
Dự án: Hệ thống Quản trị Suất ăn thông minh (Quy mô 100+ người dùng đồng thời)

Kính gửi: Tổng Giám đốc

Căn cứ vào nhu cầu vận hành thực tế cho quy mô 100 nhân viên điểm danh cùng lúc tại nhà ăn, bộ phận kỹ thuật đề xuất phương án mua các gói dịch vụ theo năm để tối ưu chi phí và đảm bảo hiệu năng xử lý.

I. BẢNG TỔNG HỢP CHI PHÍ VÀ CẤU HÌNH THEO NĂM
(Tỷ giá tạm tính: 1 USD = 25.000 VNĐ)

| Dịch vụ | Nhà cung cấp | Gói đề xuất | Cấu hình chi tiết | Chi phí (Năm) | Tiết kiệm |
|:---|:---|:---|:---|:---|:---|
| **Frontend** | **Vercel** | **Pro (Annual)** | - 1TB Băng thông/tháng<br>- 1.000.000 Serverless Invocations<br>- Hỗ trợ 30.000 yêu cầu đồng thời | ~$240.00<br>(~6.000.000đ) | Tối ưu bảo mật doanh nghiệp |
| **Backend** | **Render** | **Standard (Annual)** | - 01 CPU chuyên dụng (Dedicated)<br>- 1GB RAM High-performance<br>- Băng thông 500GB/tháng | ~$192.00<br>(~4.800.000đ) | Giảm 20% so với trả tháng |
| **Cơ sở dữ liệu** | **Neon** | **Scale Plan** | - Tự động mở rộng (Autoscaling) lên 16 CU<br>- Ổ cứng SSD tốc độ cao 0.35$/GB<br>- Sao lưu dữ liệu tức thời | ~$120.00<br>(~3.000.000đ) | Thanh toán theo sử dụng thực tế* |
| **TỔNG CỘNG** | | | | **~13.800.000đ** | **Tiết kiệm ~3.000.000đ** |

(*) Lưu ý: Database Neon thanh toán theo thực tế sử dụng nên con số trên là ước tính tối đa.

II. PHÂN TÍCH KHẢ NĂNG ĐÁP ỨNG (CHO 100 NGƯỜI DÙNG)
Cấu hình đề xuất trên được lựa chọn dựa trên bài toán 100 nhân viên cùng quét mã QR trong khung giờ cao điểm (11h30 - 12h00):

1. Khả năng xử lý của Vercel (Frontend):
- Với giới hạn 30.000 yêu cầu đồng thời, hệ thống có thể đáp ứng gấp 300 lần nhu cầu hiện tại. Đảm bảo website không bao giờ bị treo dù toàn bộ công ty cùng truy cập.

2. Khả năng của Render Standard (Backend):
- Cấu hình 1GB RAM và CPU chuyên dụng đủ sức xử lý các thuật toán check-in, đối chiếu ghi danh và đẩy thông báo Real-time mà không có độ trễ. 
- Việc mua theo năm giúp duy trì server "Always-On", đảm bảo nhân viên quét mã là nhận diện ngay lập tức.

3. Khả năng của Neon Scale (Database):
- Cơ chế Autoscaling giúp database tự động tăng sức mạnh khi 100 người cùng ghi dữ liệu điểm danh và tự động thu nhỏ khi vắng khách để tiết kiệm tiền cho công ty.

III. LỢI ÍCH KHI MUA THEO NĂM
- Tiết kiệm tài chính: Giảm khoảng 20% tổng chi phí so với việc thanh toán từng tháng lẻ.
- Quản trị hóa đơn: Chỉ cần thực hiện thủ tục tạm ứng và quyết toán 01 lần duy nhất trong năm, giảm bớt thủ tục hành chính cho phòng kế toán.
- Tính ổn định: Tránh rủi ro hệ thống bị ngắt quãng do quên thanh toán hàng tháng hoặc sự cố thẻ tín dụng.

IV. KIẾN NGHỊ
Kính trình Tổng giám đốc phê duyệt gói đầu tư theo năm để hệ thống vận hành trơn tru và nhận được sự hỗ trợ kỹ thuật ưu tiên (Priority Support) từ các nhà cung cấp quốc tế.

Người lập đề xuất
(Ký và ghi rõ họ tên)
