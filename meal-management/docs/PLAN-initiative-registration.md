# ĐƠN ĐĂNG KÝ SÁNG KIẾN CẢI TIẾN (BM.01)

**Kính gửi:** Hội đồng Sáng kiến Công ty

---

## I. THÔNG TIN CHUNG
1.  **Tên sáng kiến:** Hệ thống số hóa và quản lý tập trung suất ăn công nghiệp tích hợp QR Code & Quản lý khách đoàn.
2.  **Tác giả sáng kiến:** [Tên của bạn/Bộ phận IT & HCNS]
3.  **Đơn vị áp dụng:** Toàn công ty.
4.  **Ngày đăng ký:** 06/02/2026.
5.  **Lĩnh vực áp dụng:** Chuyển đổi số, Quản lý hành chính, Tối ưu vận hành.

## II. MÔ TẢ GIẢI PHÁP
### 1. Thực trạng trước khi áp dụng (Vấn đề)
-   **Quy trình thủ công:** Việc đăng ký suất ăn thực hiện qua Zalo/Excel rời rạc. Đặc biệt việc đón khách đoàn phải nhập tay thủ công danh sách, tốn 3-4 giờ/tuần.
-   **Thiếu kiểm soát:** Không có công cụ đối soát thực tế tại nhà bếp (ai đã ăn, ai chưa), dẫn đến thất thoát hoặc lãng phí thực phẩm (dư thừa 3-5%).
-   **Quản trị lỏng lẻo:** Khó theo dõi nhân sự Active/Inactive theo thời gian thực để cấp/cắt suất ăn.
-   **Báo cáo chậm:** Mất 2-3 ngày cuối tháng để tổng hợp số liệu kế toán.

### 2. Nội dung sáng kiến (Giải pháp mới)
Xây dựng hệ thống **Meal Management System** tập trung với các tính năng đã hoàn thiện:

#### A. Phân hệ Quản lý & Khách (Guest Ops)
-   **Import Excel Khách đoàn:** Tính năng cho phép Upload danh sách khách hàng loạt (Batch Processing).
    -   *Cơ chế:* Tự động Validate dữ liệu, phát hiện trùng lặp (Duplicate Check) và bỏ qua các bản ghi lỗi.
    -   *Hiệu quả:* Giảm thời gian nhập liệu từ 3 giờ xuống 5 phút.
-   **KPI Dashboard:** Màn hình giám sát sức khỏe hệ thống dành cho Admin.
    -   *Chỉ số:* Tổng nhân sự, Đang hoạt động, Ngưng hoạt động, Nhân sự mới.
    -   *Tác dụng:* Phát hiện và xử lý ngay các tài khoản ảo/đã nghỉ việc.

#### B. Phân hệ Nhân viên & Bếp
-   **Mobile Web App:** Nhân viên tự đăng ký/huỷ suất ăn, xem thực đơn.
-   **QR Code Check-in:** Mã định danh cá nhân/khách mời. Quét 1 giây để nhận suất.
-   **Kitchen Board (Real-time):** Màn hình tại bếp hiển thị số lượng suất ăn (Mặn/Chay) cập nhật từng giây.

### 3. Tính mới và sáng tạo
-   Áp dụng công nghệ **Real-time Socket** để cập nhật số liệu cho bếp không độ trễ.
-   Sử dụng thuật toán **xử lý file Excel client-side** (SheetJS) giúp xử lý danh sách lớn mượt mà.
-   Giao diện thiết kế chuẩn **Viettel Design System**, trải nghiệm cao cấp (Premium UX).

## III. HIỆU QUẢ KINH TẾ - XÃ HỘI
### 1. Giá trị làm lợi bằng tiền (Ước tính/Năm)
| Hạng mục tiết kiệm | Diễn giải | Giá trị (VNĐ) |
| :--- | :--- | :---: |
| **Nhân công hành chính** | Giảm 56 giờ/tháng (Báo cáo + Nhập khách) x 100k/h | 67.200.000 |
| **Lãng phí thực phẩm** | Giảm dư thừa từ 5% xuống <1% (Tiết kiệm 30 suất/ngày) | 120.000.000 |
| **Tổng cộng** | | **187.200.000** |

### 2. Hiệu quả phi tài chính (Định tính)
-   **Chính xác 100%:** Loại bỏ hoàn toàn sai sót do nhập liệu thủ công.
-   **Minh bạch:** Mọi giao dịch ăn/hủy đều có log hệ thống, dễ dàng tra soát.
-   **Văn minh:** Xây dựng hình ảnh chuyên nghiệp khi đón tiếp khách đoàn (Check-in QR).
-   **Ra quyết định nhanh:** Lãnh đạo xem báo cáo chi phí tức thì (Real-time dashboard).

## IV. KẾT LUẬN
Dự án đã hoàn thành triển khai và sẵn sàng đưa vào vận hành thực tế. Đề nghị Hội đồng xem xét nghiệm thu và nhân rộng mô hình.

---
**Người viết đơn**
*(Ký tên)*
