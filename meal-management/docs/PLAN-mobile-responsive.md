# PLAN-mobile-responsive

> **Goal**: Optimize the Mobile Web experience primarily for **QR Code Scanning**, while guaranteeing **ZERO changes** to the existing Desktop Web layout.

## 1. Core Philosophy: "Desktop Isolation"
To prevent any impact on the current desktop UI, we will use an **Additive Mobile-First Strategy** (in reverse constraint):

*   **Current State**: The code currently enforces desktop sizing (e.g., `w-[1440px]`).
*   **New State**: We will **NOT** change the default behavior to mobile. Instead, we will wrap existing desktop classes in `lg:` (Large Screen) modifiers and add `hidden md:block` guards where strictly necessary.
*   **Rule**: `Desktop View` = `Exact Current State`. Mobile adjustments will only trigger on screens `< 1024px`.

## 2. Target Scope (Prioritized)

### Priority 1: QR Code Access (Mobile Main Use Case)
Mobile users primarily use the app to check-in or present their Meal QR.
*   **The Problem**: Currently, the QR code might be too small, off-screen, or hard to access on phones.
*   **The Fix**:
    *   **QR Page**: Ensure the QR code scales to `w-full` or `max-w-[300px]` on mobile, centered vertically.
    *   **Navigation**: Add a prominent "My QR" floating button or bottom tab on mobile for instant access.
    *   **Brightness**: (Optional) Add a "Bright Mode" toggle for QR readability.

### Priority 2: Navigation & Shell
*   **Sidebar**: On desktop, it's fixed. On mobile, it must collapse into a **Hamburger Menu** or **Bottom Bar** to save space.
*   **Header**: Reduce height and hide non-essential elements (like full profile name) on mobile.

### Priority 3: Registration Flow
*   **Calendar**: Switch to a **Vertical List View** on mobile. The grid view is too dense for phone screens.

## 3. Implementation Strategy (Risk-Free)

### Step 1: The "Desktop Lock"
Before changing any file, we verify the `lg:` breakpoint covers the current layout.
*   *Current*: `<div className="w-[300px] sidebar">`
*   *Refactor*: `<div className="w-full lg:w-[300px] sidebar">`
*   *Result*: Desktop sees `300px` (Unchanged). Mobile sees `w-full`.

### Step 2: The Mobile QR Optimization
Focus on `MealDetail` or `MyQR` component.
*   Make the QR container responsive: `w-[200px] lg:w-[300px]`.
*   Ensure high contrast and padding for scanning reliability.

### Step 3: Global Navigation
*   Implement a `MobileNav` component that is `lg:hidden` (Hidden on Desktop).
*   Add `hidden lg:flex` to the Desktop Sidebar (Hidden on Mobile).
*   **Result**: Two distinct navigation experiences that do not interfere with each other.

## 4. Verification Checklist
*   [ ] **Desktop Regression Test**: Open app on 1440px+ screen. Does it look PIXEL-PERFECT identical to before? (Critical Pass/Fail).
*   [ ] **Mobile QR Scan**:
    *   Open on iPhone/Android.
    *   Is QR Code visible without scrolling?
    *   Is it scannable by another device?
*   [ ] **Touch Targets**: Are buttons at least 44px height on mobile?

---

# KẾ HOẠCH-mobile-responsive (Tiếng Việt)

> **Mục tiêu**: Tối ưu hóa trải nghiệm Mobile Web chủ yếu cho **Quét Mã QR**, đồng thời đảm bảo **KHÔNG THAY ĐỔI** bố cục Desktop Web hiện tại.

## 1. Triết lý Cốt lõi: "Cô lập Desktop"
Để ngăn chặn mọi ảnh hưởng đến giao diện Desktop hiện tại, chúng ta sẽ sử dụng **Chiến lược Cộng gộp**:

*   **Hiện trạng**: Code hiện tại đang ép cứng kích thước desktop (ví dụ: `w-[1440px]`).
*   **Trạng thái mới**: Chúng ta sẽ **KHÔNG** đổi cấu trúc mặc định thành mobile. Thay vào đó, chúng ta sẽ bọc các class desktop hiện có trong modifier `lg:` (Màn hình lớn).
*   **Quy tắc**: `Giao diện Desktop` = `Trạng thái hiện tại tuyệt đối`. Các điều chỉnh Mobile chỉ kích hoạt trên màn hình `< 1024px`.

## 2. Phạm vi Mục tiêu (Đã ưu tiên)

### Ưu tiên 1: Truy cập Mã QR (Tính năng chính trên Mobile)
Người dùng mobile chủ yếu dùng app để check-in hoặc đưa mã QR suất ăn.
*   **Vấn đề**: Hiện tại mã QR có thể quá nhỏ, bị lệch hoặc khó tìm trên điện thoại.
*   **Giải pháp**:
    *   **Trang QR**: Đảm bảo mã QR co giãn `w-full` hoặc tối đa `300px` trên mobile, căn giữa màn hình.
    *   **Điều hướng**: Thêm nút nổi "QR Của Tôi" hoặc thanh menu dưới cùng (Bottom Bar) trên mobile để truy cập tức thì.
    *   **Độ sáng**: (Tùy chọn) Thêm nền trắng sáng xung quanh QR để dễ quét.

### Ưu tiên 2: Khung & Điều hướng
*   **Thanh bên (Sidebar)**: Trên desktop đang cố định. Trên mobile, nó phải thu gọn vào **Hamburger Menu** hoặc **Bottom Bar** để tiết kiệm diện tích.
*   **Tiêu đề (Header)**: Giảm chiều cao và ẩn các phần tử không cần thiết (như tên đầy đủ) trên mobile.

### Ưu tiên 3: Luồng Đăng ký
*   **Lịch**: Chuyển sang **Dạng Danh sách Dọc** trên mobile. Dạng lưới (Grid) quá dày đặc cho màn hình điện thoại.

## 3. Chiến lược Triển khai (Không rủi ro)

### Bước 1: "Khóa Desktop"
Trước khi sửa bất kỳ file nào, xác minh điểm ngắt `lg:` bao phủ bố cục hiện tại.
*   *Hiện tại*: `<div className="w-[300px] sidebar">`
*   *Refactor*: `<div className="w-full lg:w-[300px] sidebar">`
*   *Kết quả*: Desktop vẫn thấy `300px` (Không đổi). Mobile thấy `w-full` (Toàn màn hình).

### Bước 2: Tối ưu QR Mobile
Tập trung vào component `MealDetail` hoặc trang `MyQR`.
*   Làm container QR phản hồi: `w-[200px] lg:w-[300px]`.
*   Đảm bảo độ tương phản cao và padding đủ rộng để máy quét dễ đọc.

### Bước 3: Điều hướng Toàn cục
*   Thực hiện component `MobileNav` có thuộc tính `lg:hidden` (Ẩn trên Desktop).
*   Thêm `hidden lg:flex` vào Sidebar Desktop hiện tại (Ẩn trên Mobile).
*   **Kết quả**: Hai trải nghiệm điều hướng tách biệt, không can thiệp lẫn nhau.

## 4. Danh sách kiểm tra xác minh
*   [ ] **Test Hồi quy Desktop**: Mở app trên màn hình 1440px+. Nó có giống hệt 100% so với trước không? (Tiêu chí bắt buộc).
*   [ ] **Quét QR Mobile**:
    *   Mở trên iPhone/Android.
    *   Mã QR có thấy ngay mà không cần cuộn không?
    *   Máy khác có quét được không?
*   [ ] **Điểm chạm**: Các nút có đạt chiều cao tối thiểu 44px trên mobile không?
