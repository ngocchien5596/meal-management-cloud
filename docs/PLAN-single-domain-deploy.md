# Kế hoạch Triển khai VPS với 1 Domain duy nhất (Single Domain Routing)

## 1. Vấn đề (Context)
- Server: Ubuntu 24.04, RAM 32GB, Docker Compose.
- Bạn chỉ có duy nhất 1 tên miền là `nguoicpc.vn` (không có subdomain `api.nguoicpc.vn`).
- Yêu cầu: Cả Frontend (Next.js) và Backend (Express + Socket.io + Uploads) phải chạy chung trên 1 tên miền `nguoicpc.vn`.

## 2. Giải pháp (Solution)
Sử dụng **Nginx làm Reverse Proxy Router** dựa trên đường dẫn (Path-based routing):
- Truy cập `nguoicpc.vn/api/*` => Chuyển vào Backend (Cổng 8000).
- Truy cập `nguoicpc.vn/socket.io/*` => Chuyển vào Backend (Cổng 8000).
- Truy cập `nguoicpc.vn/health` => Chuyển vào Backend (Cổng 8000).
- Truy cập `nguoicpc.vn/static/uploads/*` => Chuyển vào Backend (Cổng 8000).
- Truy xuất các đường dẫn còn lại (Ví dụ: `nguoicpc.vn/`, `nguoicpc.vn/dashboard`) => Chuyển vào Frontend (Cổng 3000).

## 3. Các thay đổi cụ thể (Task Breakdown)

### 3.1 Cập nhật File `.env` của Frontend
Biến môi trường API URL của Next.js sẽ tự trỏ về chính tên miền gốc kèm theo hậu tố `/api/v1`:
```env
# meal-management/apps/web/.env
NEXT_PUBLIC_API_URL=https://nguoicpc.vn/api/v1
```

### 3.2 Cập nhật file cấu hình Nginx
File `/etc/nginx/sites-available/nguoicpc.vn` sẽ gom tất cả logic vào 1 block server duy nhất, không tách làm 2 file nữa:

```nginx
server {
    server_name nguoicpc.vn www.nguoicpc.vn;

    # 1. API Backend
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M; # Cho phép upload hình ảnh / excel
    }

    # 2. API Health Check
    location /health {
        proxy_pass http://localhost:8000/health;
    }

    # 3. Static Uploads (Hình ảnh, QRCode đã tạo...)
    location /static/uploads/ {
        proxy_pass http://localhost:8000/static/uploads/;
    }

    # 4. Web Socket (Dùng cho realtime quét QR mã code)
    location /socket.io/ {
        proxy_pass http://localhost:8000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 5. Frontend Next.js (Xử lý BẤT KỲ ĐƯỜNG DẪN NÀO CÒN LẠI)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.3 Thiết lập SSL qua Certbot
Sau khi Nginx đã nhận diện, chỉ cần chạy 1 lệnh quét chứng chỉ duy nhất:
```bash
sudo certbot --nginx -d nguoicpc.vn -d www.nguoicpc.vn
```

## 4. Kiểm thử
1. Truy cập `https://nguoicpc.vn/health` -> Phải thấy JSON báo `"status": "UP"`.
2. Đăng nhập hệ thống tại `https://nguoicpc.vn` -> Fetch API không bị lỗi CORS (vì Backend và Frontend cùng chung 1 tên miền tuyệt đối).
3. Thử quét QR -> Test tính năng gọi điện thoại qua socket realtime `wss://nguoicpc.vn/socket.io/`.
