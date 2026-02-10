# GUIDE-mobile-testing

> **Goal**: Enable testing of the local development application on physical mobile devices (iOS/Android) connected to the same WiFi network.

## 1. Prerequisites
-   **PC/Laptop** running the project.
-   **Mobile Device** (iPhone or Android).
-   **Same WiFi Network**: Both devices MUST be connected to the exact same WiFi.

## 2. Step-by-Step Instructions

### Step 1: Find your PC's Local IP Address
You need the internal IP address of your computer assigned by the router.

*   **Windows**:
    1.  Open **Command Prompt** (cmd) or **PowerShell**.
    2.  Type `ipconfig` and press Enter.
    3.  Look for **IPv4 Address** under your active connection (Wi-Fi or Ethernet).
    4.  *Example*: `192.168.1.5` or `192.168.0.101`.

*   **macOS / Linux**:
    1.  Open Terminal.
    2.  Type `ifconfig | grep "inet " | grep -v 127.0.0.1`.
    3.  Look for the IP like `192.168.x.x`.

### Step 2: Configure Proxy URL (CRITICAL)
We have enabled a "Proxy Mode" so you only need to connect to port 3000.

1.  Open file: `apps/web/.env.local`
2.  Change `NEXT_PUBLIC_API_URL` to use your IP but with **PORT 3000** (Frontend Port).
    *   **Before**: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
    *   **After**: `NEXT_PUBLIC_API_URL=http://<YOUR_IP>:3000/api`
    *   *Example*: `NEXT_PUBLIC_API_URL=http://192.168.1.5:3000/api`

### Step 3: Run Servers on Network
1.  **Restart the server** (Ctrl+C then run again) for config changes to apply.
2.  Run: `npm run dev -- -H 0.0.0.0`
3.  Logs should show: `Ready on http://0.0.0.0:3000`

### Step 4: Enable Camera on Mobile (IMPORTANT)
Browsers block Camera access on HTTP sites (except localhost). Since you are using an IP address, it is treated as "Insecure".

**You MUST enable a flag to allow the Camera:**

*   **Android (Chrome)**:
    1.  Open Chrome on your phone.
    2.  Go to address: `chrome://flags`
    3.  Search for: `unsafely-treat-insecure-origin-as-secure`
    4.  Enable it and enter your IP URL: `http://192.168.1.5:3000` (Replace with your specific IP).
    5.  Relaunch Chrome.

*   **iOS (Safari)**:
    *   Safari is stricter. You usually cannot bypass this easily on local WiFi without HTTPS.
    *   **Workaround**: Use Chrome on iOS if possible, or you might need a tunneling tool like **ngrok** (`ngrok http 3000`) to get an HTTPS URL.

### Step 5: Access & Test
1.  Open browser on phone.
2.  Go to `http://192.168.1.5:3000`
3.  Try scanning QR. The browser should now ask for Camera permission.

---

# HƯỚNG DẪN-mobile-testing (Tiếng Việt)

> **Mục tiêu**: Hướng dẫn chạy test trên điện thoại thật.

## 1. Yêu cầu
-   Máy tính & Điện thoại cùng WiFi.

## 2. Hướng dẫn

### Bước 1: Tìm IP Máy tính
-   Windows: `ipconfig` -> Lấy IPv4 (VD: `192.168.1.5`).

### Bước 2: Cấu hình Proxy (file .env.local)
-   Sửa `NEXT_PUBLIC_API_URL` thành: `http://<IP_CỦA_BẠN>:3000/api`
-   **Lưu ý**: Dùng cổng **3000**.

### Bước 3: Chạy Server
-   Tắt server cũ, chạy lại: `npm run dev -- -H 0.0.0.0`
-   Đảm bảo Backend cũng đang chạy.

### Bước 4: Mở khóa Camera (QUAN TRỌNG NHẤT)
Điện thoại sẽ CHẶN camera vì web đang chạy HTTP (kém bảo mật). Bạn cần cho phép nó.

*   **Android (Chrome)**:
    1.  Vào trình duyệt Chrome trên điện thoại.
    2.  Gõ vào thanh địa chỉ: `chrome://flags`
    3.  Tìm kiếm từ khóa: `insecure`
    4.  Mục "Insecure origins treated as secure": Chọn **Enabled**.
    5.  Điền IP vào ô bên dưới: `http://192.168.1.5:3000` (Thay bằng IP máy bạn).
    6.  Bấm Relaunch để khởi động lại Chrome.

*   **iPhone (iOS)**:
    *   iOS bảo mật rất chặt, khó test Camera qua HTTP local.
    *   **Khuyên dùng**: Mượn máy Android để test chức năng Quét QR.
    *   Hoặc dùng phần mềm **ngrok** trên máy tính để tạo link HTTPS.

### Bước 5: Truy cập
-   Vào `http://192.168.1.5:3000` trên điện thoại.
-   Đăng nhập -> Bấm nút Quét QR -> Chọn "Cho phép" Camera.
