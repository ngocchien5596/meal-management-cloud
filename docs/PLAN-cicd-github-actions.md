# Kế hoạch Thiết lập CI/CD (Triển khai Tự động) Chi tiết A-Z

## 1. Mục tiêu (Objective)
Tự động hóa quá trình triển khai:
- Kỹ sư đẩy mã nguồn (Push code) lên nhánh `main` ở GitHub.
- GitHub tự động dùng SSH kết nối vào con VPS Ubuntu của bạn.
- GitHub kéo code mới nhất về (`git pull`).
- GitHub tự động thông báo Docker khởi động lại app với code mới (`docker compose up --build`).
- Không cần thao tác thủ công, tiết kiệm thời gian tuyệt đối.

---

## 2. Chuẩn bị VPS (Tạo kết nối SSH an toàn)

Quá trình này chỉ phải làm **một lần duy nhất** để cho phép GitHub giả lập làm người dùng đăng nhập vào VPS của bạn mà không cần nhập mật khẩu.

### Bước 2.1: Tạo cặp khóa SSH Key riêng cho tự động hóa (trên VPS của bạn)
Mở terminal kết nối vào VPS của bạn, chạy các lệnh sau:
```bash
# Tạo khóa SSH mới (không đặt mật khẩu, cứ nhấn Enter khi được hỏi)
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_key

# Nối Public Key vừa tạo vào danh sách thiết bị được phép đăng nhập (authorized_keys)
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# In Private Key ra màn hình để tí nữa copy lên GitHub
cat ~/.ssh/github_actions_key
```

Khi màn hình in ra đoạn văn bản bắt đầu bằng `-----BEGIN OPENSSH PRIVATE KEY-----` và kết thúc bằng `-----END OPENSSH PRIVATE KEY-----`, hãy **COPY** toàn bộ đoạn đó lại.

---

## 3. Cấu hình trên trang GitHub

### Bước 3.1: Nhập khóa bảo mật (Secrets) vào GitHub
Truy cập vào kho (Repo) dự án của bạn trên trình duyệt web GitHub.
Đường dẫn: `Settings` ➔ (Bên trái) `Secrets and variables` ➔ `Actions`.

Nhấn nút **New repository secret** và thêm lần lượt 3 biến sau:

1. Trọng trường `Name`: **VPS_HOST**
   - Trọng trường `Secret`: Điền địa chỉ IP của con VPS Ubuntu (Ví dụ: `103.xxx.yyy.zzz`).
2. Trọng trường `Name`: **VPS_USERNAME**
   - Trọng trường `Secret`: Tên người dùng mà bạn dùng để SSH vào VPS. (Thường là `ubuntu` hoặc `root`).
3. Trọng trường `Name`: **VPS_SSH_KEY**
   - Trọng trường `Secret`: Dán (Paste) toạn bộ đoạn Private Key dài loằng ngoằng vừa copy ở Bước 2.1 vào đây.

Bấm **Add secret** cho mỗi biến. Xong bước này là GitHub đã đủ thẩm quyền vào Server của bạn.

---

## 4. Viết kịch bản tự động hóa (Trong Source Code)

### Bước 4.1: Tạo file cấu hình GitHub Actions
Trở về máy tính làm việc cục bộ của bạn (hoặc trực tiếp trên IDE VS Code). Tạo cấu trúc thư mục `.github/workflows` (Lưu ý có dấu chấm đầu thư mục).

Tạo một file mới đường dẫn là: **`.github/workflows/deploy.yml`**

Dán đoạn mã (script) tự động hóa sau:

```yaml
name: Deploy Meal Management to Ubuntu VPS

on:
  push:
    branches:
      - main # Hành động này chỉ cháy khi tính năng được đẩy lên nhánh main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Kiểm tra trạng thái Checkout 
        uses: actions/checkout@v3

      - name: Deploy qua SSH lên VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            # 1. Đi tới thư mục chứa mã nguồn dự án trên server
            # LƯU Ý: Vui lòng sửa lại đường dẫn này cho đúng thư mục code của bạn trên VPS
            cd /home/ubuntu/qlsa
            
            # 2. Bắt buộc lấy code mới tinh kể cả khi có xung đột
            git fetch --all
            git reset --hard origin/main
            
            # 3. Kéo code gốc về máy chủ
            git pull origin main
            
            # 4. Yêu cầu Docker buid và khởi chạy ngầm lại toàn bộ Services
            docker compose up -d --build
            
            # 5. Dọn dẹp rác, phế liệu docker dư thừa tự động để tránh đầy ổ cứng VPS
            docker image prune -af
```

---

## 5. Nghiệm thu (Verification)

1. Lưu toàn bộ code có chứa thư mục `.github/workflows/` vừa tạo.
2. Commit và Push lên nhánh `main`.
3. Lên trình duyệt GitHub, nhấn vào Tab **Actions** (cạnh tab Pull requests). Bạn vòng tròn màu vàng đang xoay, bấm vào đó để xem GitHub đang gõ lệnh gì trên máy chủ của bạn trực tiếp theo thời gian thực (Real-time logs).
4. Thấy dấu Tick xanh ✅ là xong! Website trên domain `qlsa.nguoicpc.vn` đã có những thay đổi mới nhất mà không cần bạn ngó ngàng tới terminal máy chủ!
