# Kế hoạch dự án: Triển khai Cloud Ubuntu cho Meal Management (Full Docker)

**Mục tiêu**: Triển khai toàn bộ ứng dụng Quản lý suất ăn (Meal Management) lên Server Cloud Ubuntu bằng Docker, bao gồm cả Frontend, Backend và Cơ sở dữ liệu PostgreSQL.

---

## 1. Kiểm tra bối cảnh (Giai đoạn -1)
- **Công nghệ**: Next.js (Frontend), Node.js (API/Backend), Prisma ORM, PNPM Monorepo.
- **Môi trường Server**: Ubuntu đã cài đặt sẵn Docker.
- **Chiến lược hạ tầng**: 
    - **Cơ sở dữ liệu**: Chạy trong container Docker (PostgreSQL image).
    - **Ứng dụng**: Đóng gói container qua Docker (các container Web và API).
    - **Mạng lưới**: Sử dụng Docker Network để các container kết nối nội bộ an toàn.
    - **Reverse Proxy**: Nginx (cài đặt trên host) để quản lý SSL và điều hướng tên miền.
- **Bảo mật**: Dữ liệu Postgres được lưu trữ qua Docker Volumes để tránh mất dữ liệu.

---

## 2. Phân công Agent
- **`@[backend-specialist]`**: Cấu hình Docker Compose cho cụm API + Postgres, thiết lập volume dữ liệu và migrate Prisma.
- **`@[frontend-specialist]`**: Docker hóa ứng dụng Next.js và cấu hình kết nối API URL.
- **`@[orchestrator]`**: Hướng dẫn người dùng các lệnh terminal để khởi chạy Docker Compose.

---

## 3. Phân rã nhiệm vụ

### Giai đoạn 1: Chuẩn bị Môi trường & Nginx
- [ ] Cài đặt Nginx trên máy chủ Ubuntu.
- [ ] Cấu hình tên miền trỏ về cổng 80/443 của Nginx.
- [ ] Cấu hình `ufw` tường lửa.

### Giai đoạn 2: Cấu hình Docker Compose (Full Stack) [x]
- [x] Tạo `Dockerfile` cho API và Web.
- [x] Xây dựng file `docker-compose.prod.yml` bao gồm:
    - **Dịch vụ `db`**: PostgreSQL image, cấu hình Volume lưu trữ.
    - **Dịch vụ `api`**: Backend Node.js, phụ thuộc vào `db`.
    - **Dịch vụ `web`**: Frontend Next.js.
- [x] Thiết lập Docker Network nội bộ.

### Giai đoạn 3: Cấu hình Biến môi trường [x]
- [x] Chuẩn bị `.env.production.example` cho API và Web.

### Giai đoạn 4: Thực thi triển khai
- [ ] Chạy `docker-compose up -d --build`.
- [ ] Thực hiện Prisma Migrate bên trong container API.
- [ ] Cài đặt SSL Certbot trên host Ubuntu để bảo mật Nginx.

---

## 4. Danh sách kiểm tra xác minh
- [ ] Kiểm tra các container đang chạy (`docker ps`).
- [ ] Kiểm tra kết nối từ API tới Database Docker.
- [ ] Xác minh dữ liệu được lưu persist qua Volume (thử tắt và bật lại container db).
- [ ] Website và API truy cập được qua HTTPS.

---

## Các bước tiếp theo:
- Xem lại kế hoạch tại [PLAN-ubuntu-deployment.md](file:///g:/Source-code/qlsa/meal-management/docs/PLAN-ubuntu-deployment.md)
- Nếu đã ổn, hãy nhắn **"Start"** để mình bắt đầu viết Dockerfile và Docker Compose.
