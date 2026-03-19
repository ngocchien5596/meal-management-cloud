# Hướng dẫn Triển khai Meal Management lên VPS Ubuntu 24.04 (Docker Compose)

***Đã tùy chỉnh cho: Server 32GB RAM, Domain `nguoicpc.vn`, lấy code từ Github.***

---

## 1. Yêu cầu hệ thống & Kiến trúc triển khai

- **VPS**: 32GB RAM (Cấu hình cực mạnh, **KHÔNG CẦN** tạo Swap, xử lý Next.js build thoải mái).
- **Domain**: 
  - Frontend (Web): `nguoicpc.vn` và `www.nguoicpc.vn`
  - Backend (API): `api.nguoicpc.vn`
- **Database**: 
  - *Lưu ý quan trọng:* Mã nguồn hiện tại của dự án dùng `PostgreSQL` (xem file `prisma/schema.prisma`). Do đó tôi sẽ cấu hình một container **PostgreSQL** chạy hoàn toàn độc lập bên trong Docker. Nó **không hề xung đột** hay ảnh hưởng tới MariaDB hiện đang có sẵn trên VPS của bạn.
- **Source Code**: Kéo trực tiếp từ GitHub.

---

## 2. Các bước thực hiện chi tiết

### BƯỚC 1: Cấu hình VPS & Tên miền ban đầu
1. **Trỏ Tên Miền (DNS Manager):**
   Vào trang quản lý tên miền của bạn, tạo 3 bản ghi A trỏ về IP của VPS:
   - Host: `@` (chỉ `nguoicpc.vn`) -> IP VPS
   - Host: `www` (`www.nguoicpc.vn`) -> IP VPS
   - Host: `api` (`api.nguoicpc.vn`) -> IP VPS

2. **Cập nhật Ubuntu:**
   Mở terminal SSH vào VPS và chạy lệnh cập nhật:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

### BƯỚC 2: Cài đặt Docker, Nginx, Certbot
Chạy từng lệnh dưới đây để cài đặt các công cụ cần thiết:
```bash
# 1. Cài Nginx & Certbot (Để chạy Web Server và lấy HTTPS)
sudo apt install nginx certbot python3-certbot-nginx -y

# 2. Cài Docker Engine mới nhất
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Phân quyền cho User hiện tại dùng docker không cần gõ sudo (cần logout & login lại sau lệnh này)
sudo usermod -aG docker $USER
```

### BƯỚC 3: Tạo SSH Key để lấy code từ GitHub (Không cần pass)
```bash
# 1. Tạo SSH Key
ssh-keygen -t ed25519 -C "vps-deploy@nguoicpc.vn"
# Cứ bấm Enter liên tục cho đến khi xong

# 2. Xem và copy đoạn mã public key
cat ~/.ssh/id_ed25519.pub
```
*Lấy đoạn mã hiển thị ra, vào GitHub -> Setting (của tài khoản) -> SSH and GPG keys -> New SSH key -> Paste nó vào. Như vậy VPS đã được phép clone clone private của bạn.*

### BƯỚC 4: Clone Code và Cấu hình Môi trường
```bash
# 1. Clone code về máy (Sửa lại link repo của bạn)
git clone git@github.com:USERNAME/REPO_NAME.git qlsa
cd qlsa

# 2. Tạo file môi trường cho Backend
nano meal-management/apps/api/.env
```
*Gán nội dung sau vào file `.env` của thư mục api:*
```env
PORT=8000
NODE_ENV=production
# URL để Frontend có thể lấy API (cors)
FRONTEND_URL=https://nguoicpc.vn

# Lưu ý: Database URL này sẽ trỏ kết nối vào container DB trong cùng network
DATABASE_URL="postgresql://postgres:MatKhauSieuKho123@db:5432/meal_management?schema=public"
JWT_SECRET="ChuoiBiMatJWTNayCanSuaLaiChoAnToan"
```

```bash
# 3. Tạo file môi trường cho Frontend
nano meal-management/apps/web/.env
```
*Gán nội dung sau vào file `.env` của thư mục web:*
```env
NEXT_PUBLIC_API_URL=https://api.nguoicpc.vn
```


### BƯỚC 5: Tạo `Dockerfile` và `docker-compose.yml`
*(Ghi chú: Nếu trong mã nguồn chưa có 3 file này, bạn tạo trực tiếp trên VPS bằng lệnh `nano`)*

**File 1: `meal-management/apps/api/Dockerfile`**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY meal-management/apps/api/package*.json ./meal-management/apps/api/
RUN npm install
COPY meal-management/apps/api ./meal-management/apps/api
WORKDIR /app/meal-management/apps/api
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/meal-management/apps/api/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/meal-management/apps/api/dist ./dist
COPY --from=builder /app/meal-management/apps/api/prisma ./prisma
RUN npx prisma generate
EXPOSE 8000
CMD ["npm", "start"]
```

**File 2: `meal-management/apps/web/Dockerfile`**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY meal-management/apps/web/package*.json ./meal-management/apps/web/
RUN npm install
COPY meal-management/apps/web ./meal-management/apps/web
WORKDIR /app/meal-management/apps/web
ENV NEXT_PUBLIC_API_URL=https://api.nguoicpc.vn
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/meal-management/apps/web/package.json ./
RUN npm install --omit=dev  
COPY --from=builder /app/meal-management/apps/web/.next ./.next
COPY --from=builder /app/meal-management/apps/web/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

**File 3: `docker-compose.yml` (Đặt ở thư mục gốc của dự án `qlsa`)**
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: qlsa_db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: MatKhauSieuKho123
      POSTGRES_DB: meal_management
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - qlsa-net

  api:
    build:
      context: .
      dockerfile: meal-management/apps/api/Dockerfile
    container_name: qlsa_api
    restart: always
    env_file:
      - meal-management/apps/api/.env
    ports:
      - "8000:8000"
    depends_on:
      - db
    networks:
      - qlsa-net

  web:
    build:
      context: .
      dockerfile: meal-management/apps/web/Dockerfile
    container_name: qlsa_web
    restart: always
    env_file:
      - meal-management/apps/web/.env
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - qlsa-net

networks:
  qlsa-net:
    driver: bridge

volumes:
  postgres_data:
```

### BƯỚC 6: Chạy Dự Án
Khi đã có đủ file cấu hình, chạy cụm lệnh sau:
```bash
# 1. Build và chạy các container ở chế độ ngầm (detached)
docker compose up -d --build

# 2. Kiểm tra container xem có cái nào bị lỗi thoát ra không
docker ps

# 3. Tạo schema cơ sở dữ liệu (Push database lên con Postgres)
docker exec -it qlsa_api npx prisma db push
```

### BƯỚC 7: Cấu hình Web Server Nginx & Xin chứng chỉ (HTTPS)
Đây là cấu hình để user gõ `nguoicpc.vn` sẽ vào Web 3000, gõ `api.nguoicpc.vn` sẽ vào API 8000.

**Cấu hình Frontend (Web)**
Mở file config mới: `sudo nano /etc/nginx/sites-available/nguoicpc.vn`
```nginx
server {
    server_name nguoicpc.vn www.nguoicpc.vn;
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

**Cấu hình Backend (API)**
Mở file config mới: `sudo nano /etc/nginx/sites-available/api.nguoicpc.vn`
```nginx
server {
    server_name api.nguoicpc.vn;

    # Backend API logic
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Cho phép upload file lớn nén (nếu có tính năng import Excel)
        client_max_body_size 50M; 
    }
}
```

**Kích hoạt Cấu Hình Nginx và Lấy SSL (HTTPS)**
```bash
# Link cấu hình vừa tạo giúp Nginx nhận diện
sudo ln -s /etc/nginx/sites-available/nguoicpc.vn /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.nguoicpc.vn /etc/nginx/sites-enabled/

# Reload Nginx để áp dụng thay đổi
sudo systemctl reload nginx

# Xin chứng chỉ bảo mật tự động của Let's Encrypt (Certbot)
sudo certbot --nginx -d nguoicpc.vn -d www.nguoicpc.vn
sudo certbot --nginx -d api.nguoicpc.vn
```
*Certbot sẽ hỏi bạn cờ khai báo email, cứ chọn Yes và Accept là xong. Website đã chính thức hoạt động tại `https://nguoicpc.vn`.*
