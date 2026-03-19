# Kế hoạch Triển khai VPS: Phân luồng Code Mới & Cũ qua Subdomain

## 1. Mục tiêu (Objective)
Triển khai thành công hệ thống Quản lý suất ăn (Next.js, Express, Postgres) chạy song song với mã nguồn cũ trên cùng 1 con VPS Ubuntu 24.04 (32GB RAM).
Giải pháp sử dụng: **Subdomain Routing qua Nginx**. Mã nguồn cũ tiếp tục chiếm giữ domain chính `nguoicpc.vn`, mã nguồn mới sẽ chạy hoàn toàn trên subdomain `qlsa.nguoicpc.vn`.

## 2. Yêu cầu chuẩn bị (Prerequisites)
1. **Tạo Subdomain**: Đăng nhập vào trang quản lý Tên Mền (DNS). Tạo 1 bản ghi `A` với tên `qlsa` và trỏ IP về địa chỉ IPv4 của VPS.
2. **Setup Subdomain cho API**: (Tùy chọn) Tạo thêm 1 bản ghi `A` với tên `api.qlsa` trỏ về cùng IP VPS nếu muốn API tách biệt hoàn toàn. Tuy nhiên, dễ nhất là cấu hình Nginx bắt các request gửi tới `qlsa.nguoicpc.vn/api/` và đẩy vào Backend giống như kế hoạch cũ. Trong tài liệu này, ta sẽ dùng phương án gộp chung vào 1 subdomain `qlsa.nguoicpc.vn`.

---

## 3. Các bước thực hiện chi tiết (Step-by-Step Task Breakdown)

### Bước 3.1: Đăng nhập vào VPS và Chuẩn bị Thư mục
Kết nối SSH vào VPS của bạn và cài hệ thống môi trường:
```bash
# 1. Đăng nhập vào VPS (Thay user và IP)
ssh ubuntu@ip-cua-vps

# 2. Cấp quyền tạo folder (Giả sử bạn để code ở /home/ubuntu)
cd /home/ubuntu
mkdir qlsa-project
cd qlsa-project

# 3. Kéo code về từ Github (Nếu bạn đã setup khóa Github theo hướng dẫn CI/CD)
git clone git@github.com:USERNAME/REPO_NAME.git .
```

### Bước 3.2: Thiết lập Biến môi trường (.env)
Bạn cần tạo các file `.env` chứa mật khẩu database, app secrets. Không nên commit các file này lên GitHub.

**1. Tạo `.env` cho Backend (API):**
```bash
nano /home/ubuntu/qlsa-project/meal-management/apps/api/.env
```
Copy dán nội dung sau (Sau đó bấm `Ctrl + O` -> Enter -> `Ctrl + X` để lưu):
```env
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://qlsa.nguoicpc.vn

# Postgres SQL Database URL (Tự động liên kết vào Container tên db)
DATABASE_URL="postgresql://postgres:MatKhauSieuKho@db:5432/meal_management?schema=public"
JWT_SECRET="NenThayDoiChuoiNayThanhChuoiNgangNhien"
```

**2. Tạo `.env` cho Frontend (Web):**
```bash
nano /home/ubuntu/qlsa-project/meal-management/apps/web/.env
```
Copy dán nội dung sau:
```env
# Phải trùng khớp với URL của Subdomain phân luồng
NEXT_PUBLIC_API_URL=https://qlsa.nguoicpc.vn/api/v1
```

### Bước 3.3: Lệnh Khởi chạy Docker Compose (Build và Up)
Khởi động hệ thống (Nó sẽ tự động tách biệt Postgres mới, không đụng chạm tới MariaDB đang chạy):
```bash
cd /home/ubuntu/qlsa-project

# Dừng toàn bộ các container cũ nếu có
docker compose down

# Xóa các image cũ bị lửng do code cũ
docker image prune -a -f

# Bắt đầu Build Next.js và Express, tự tải image Postgres (Sẽ mất khoảng 2-5 phút tùy sức mạnh CPU)
docker compose up -d --build

# Kiểm tra xem 3 container (Web, API, DB) đã lên xanh chưa
docker ps
```

### Bước 3.4: Đồng bộ DB và Nạp Dữ Liệu mồi (Seed)
Khi các container đã chạy, bạn phải ra lệnh cho Prisma tạo cấu trúc Database vào Postgres:
```bash
# Đẩy cấu trúc Data
docker exec -it qlsa_api npx prisma db push

# (Tùy chọn) Chạy seed để tạo Data Mẫu nếu cần
docker exec -it qlsa_api npm run seed
```

### Bước 3.5: Cấu hình Nginx Subdomain (Reverse Proxy)
Khai báo cho Nginx biết rằng các máy khách truy cập `qlsa.nguoicpc.vn` sẽ chuyển xuống các container Docker này, thay vì vào code cũ của bạn.

Mở file cấu hình mới:
```bash
sudo nano /etc/nginx/sites-available/qlsa.nguoicpc.vn
```
Dán cấu hình dưới đây:
```nginx
server {
    server_name qlsa.nguoicpc.vn;

    # Backend: /api/ -> Bắn vào Express 8000
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M; 
    }

    # Backend: Các dịch vụ đính kèm
    location /health { proxy_pass http://localhost:8000/health; }
    location /static/uploads/ { proxy_pass http://localhost:8000/static/uploads/; }
    
    # Real-time Web Socket (QR)
    location /socket.io/ {
        proxy_pass http://localhost:8000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Frontend: Bất kỳ URL nào khác -> Bắn vào Next.js 3000
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

### Bước 3.6: Kích hoạt Nginx và Lấy chứng chỉ SSL
Đẩy file vừa tạo vào danh sách file "đang hoạt động" của Nginx:
```bash
# Tạo biểu tượng liên kết (symlink)
sudo ln -s /etc/nginx/sites-available/qlsa.nguoicpc.vn /etc/nginx/sites-enabled/

# Kiểm tra xem cấu hình Nginx có gõ sai dòng nào không
sudo nginx -t

# Báo Nginx chạy lại kịch bản
sudo systemctl reload nginx
```
Xin chứng nhận HTTPS miễn phí từ Let's Encrypt riêng cho Subdomain này:
```bash
sudo certbot --nginx -d qlsa.nguoicpc.vn
```
*(Certbot sẽ quét trong file config vừa tạo và cấp quyền https tự động).*

---

## 4. Nghiệm thu (Verification)
1. **Dự án cũ**: Truy cập `https://nguoicpc.vn` -> Hoạt động bình thường, không bị sập hay lag. (Do có 32GB RAM).
2. **Dự án mới**: Truy cập `https://qlsa.nguoicpc.vn` -> Giao diện Next.js tải thành công.
3. **API Routing**: Truy cập `https://qlsa.nguoicpc.vn/health` -> Nhận JSON `{"status": "UP"}` từ con Express.
4. **Bảo vệ Database**: MariaDB của web cũ vẫn nguyên vẹn. Postgres của web mới chạy an toàn và tự động restart nếu có sự cố thông qua Docker.
