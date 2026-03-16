# Kế hoạch triển khai Endpoint Health Check

## 1. Mục tiêu
Tạo một endpoint siêu nhẹ (lightweight) cho backend (chạy trên Render) để các ping monitoring service (như UptimeRobot) có thể ping định kỳ (ví dụ mỗi 5-10 phút). Việc này giúp giữ cho Web Service trên Render luôn ở trạng thái Awake, tránh tình trạng cold start gây chậm trễ (idle spindown mất 30s - 1 phút) khi có thiết bị hay người dùng thực sự truy cập.

## 2. Chi tiết Triển khai (Thiết kế Endpoint)
**Yêu cầu kỹ thuật:**
- **Đường dẫn**: Dùng `/health` ở root (hoặc `/api/health`).
- **Phản hồi**: Trả về `HTTP 200 OK` cực kỳ nhanh.
- **Payload**: JSON đơn giản. Ví dụ: `{"status": "UP", "timestamp": "2026-...", "uptime": 120.5}`. Không gian phản hồi (Header + Body) càng gọn càng tốt.
- **Cấm thao tác nặng**: 
  - **Không** truy vấn database (chậm lại & hao tệp connection pool).
  - **Không** gửi/nhận request qua API khác.
  - **Không** sử dụng logic nào khác ngoài `process.uptime()` và `new Date()`.
- **Bảo mật**: Endpoint public, không nằm dưới guard middleware authentication (để UptimeRobot có thể truy cập mà không cần Token hoặc API Key).

## 3. Các bước thực hiện (Task Breakdown)

### Thêm route Health Check vào file gốc `index.ts`
Chỉnh sửa file `apps/api/src/index.ts`. Đặt đoạn mã ngay sau các middleware cơ bản (như CORS/helmet) nhưng **trước** các route có logic xác thực:
```typescript
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

### Triển khai (Deployment) và Cấu hình UptimeRobot
- **Render**: Deploy lên Production / Preview.
- **UptimeRobot / BetterUptime**: 
  - Thêm Monitor type: HTTP(s)
  - URL (Ví dụ): `https://<ten-domain-backend-render.onrender.com>/health`
  - Interval (Chu kỳ): 5 hoặc 10 phút.
  - Timeout: Có thể setup cảnh báo nếu endpoint mất quá `2000ms` để phản hồi.

## 4. Kiểm thử (Verification Plan)
- Giả lập test trên local.
- Sử dụng lệnh `curl http://localhost:8000/health`. Đo lường xem thời gian phản hồi (TTFB) là bao nhiêu millisecond. Khuyến nghị thời gian này phải < `10ms`.
- Lắng nghe server trong quá trình ping, nếu phát hiện leak memory/cpu spike thì điều chỉnh. (Tuy nhiên logic rất nhỏ gọn nên tỷ lệ rủi ro bằng 0).
