# Kế hoạch Dọn dẹp CodeBase trước khi Deploy (Pre-flight Cleanup)

## 1. Mục tiêu (Objective)
Đảm bảo mã nguồn (Source Code) được tải lên GitHub và build trên VPS là "Sạch nhất", "Nhẹ nhất", và "An toàn nhất" (không lộ mật khẩu). Docker sẽ chạy mượt mà và không làm đầy rác ổ cứng server của bạn.

## 2. Những File/Thư mục CHUẨN BỊ XÓA (Hoặc đưa vào `.gitignore`)

### 2.1 Cấm tuyệt đối tải lên GitHub (Phải có trong `.gitignore`)
Những file này **CHẮC CHẮN 100% CẦN GIỮ Ở MÁY TÍNH CỦA BẠN**, nhưng **TUYỆT ĐỐI KHÔNG ĐƯỢC PUSH** lên mạng. File `.gitignore` hiện tại của bạn đã khá tốt, nhưng hãy kiểm tra lại xem có lọt sổ các hạng mục sau không:
- `node_modules/` (Rất nặng, hơn 1GB rác).
- Các file cấu hình bảo mật: `.env`, `.env.local`, `.env.production`.
- Thư mục build sinh ra (Docker sẽ tự chạy lại): `.next/`, `dist/`, `out/`.
- File cache của dev: `.turbo/`, `.eslintcache`, `*.tsbuildinfo`.

### 2.2 Rác Dữ liệu (Nên XÓA HẲN khỏi máy tính và Github)
Đây là các file thường do anh em Dev tạo ra trong lúc code/test nhưng quên xóa đi. Hãy rà soát lại project:
1. **Các file Database Dumps:** File `.sql` (VD: `backup.sql`, `dump_01.sql`) hoặc file database `.sqlite` (nếu có test thử). Đẩy file này lên VPS rất nguy hiểm.
2. **Thư mục Uploaded Files rác:** Bạn từng test up ảnh đại diện/chứng từ, giờ nó nằm lại ở ổ cứng. Hãy vào `apps/api/uploads/` hoặc `apps/web/public/uploads/` (nếu có) và xóa sạch các hình ảnh rác. Cứ giữ lại thư mục nhưng xóa ruột.
3. **Thư mục Seed Data cũ:** Các file `*.csv`, `*.xlsx` chứa thông tin import mẫu nhân sự đã cũ.
4. **Log files:** Các file lỗi `.log` như `npm-debug.log`, `error.log`. (File `.gitignore` của bạn đã chặn nó, nhưng bạn có thể xóa luôn cho sạch ổ cứng máy tính).
5. **Video / Hình ảnh test nặng:** Xóa bớt các video review, screenshot báo lỗi (dung lượng lớn vài chục MB) vứt lung tung trong mã nguồn.

## 3. Các bước thực hiện (Task Breakdown)

1. Mở Text Editor (VS Code).
2. Kiểm tra lại `.gitignore` ở thư mục gốc (Root `qlsa/`).
3. Chạy thử lệnh Git xem có đang "dính" thư mục nặng nào không:
   ```bash
   git status
   ```
4. Nếu lỡ vô tình đẩy `node_modules` hay `.env` lên Git từ trước, dùng lệnh này để gỡ nó ra khỏi Git (không mất file trên máy bạn):
   ```bash
   # Gỡ Node Modules
   git rm -r --cached node_modules
   
   # Gỡ file môi trường
   git rm --cached .env
   git rm --cached apps/api/.env
   git rm --cached apps/web/.env
   ```
5. Đẩy code lên GitHub:
   ```bash
   git add .
   git commit -m "chore: cleanup project for production deployment"
   git push origin main
   ```

## 4. Nghiệm thu (Verification)
Vào Github URL của dự án bạn, nhìn vào danh sách file:
- KHÔNG CÓ thư mục `node_modules`.
- KHÔNG CÓ file `.env`.
- Mã nguồn chỉ nhẹ loanh quanh khoảng `1 MB` đến `10 MB` tuỳ theo lượng hình public bạn giữ lại.
- Các thư mục chỉ toàn đuôi `ts`, `tsx`, `json`, `yml`, `prisma`. Đạt chuẩn!
