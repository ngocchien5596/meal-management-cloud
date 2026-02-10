# TECHNICAL DESIGN: SMART CACHING & OFFLINE MODE
*Giải pháp xử lý mất mạng cho thiết bị Check-in tại Bếp.*

## 1. Tư duy Kiến trúc (Local-First Architecture)
Thay vì mô hình truyền thống (Scan -> API -> Server -> Response), chúng ta chuyển sang mô hình **Local-First**:
1.  **Đầu ngày:** Tải toàn bộ danh sách được phép ăn về máy (Cache).
2.  **Check-in:** "Hỏi" Database trong máy (Local DB) -> Phản hồi tức thì <0.1s.
3.  **Background:** Âm thầm gửi log lên Server khi có mạng.

## 2. Công nghệ sử dụng
-   **Storage:** `IndexedDB` (thông qua thư viện `Dexie.js` cho dễ dùng) - Lưu trữ lượng lớn dữ liệu (>50MB) an toàn hơn localStorage.
-   **State:** `Tanstack Query` (React Query) - Quản lý trạng thái Server/Client.
-   **Network:** `Navigator.onLine` & `window.addEventListener('online')` - Lắng nghe sự kiện mạng.

## 3. Thiết kế Database (Client-side)
Sử dụng `Dexie` định nghĩa 2 bảng chính:

```typescript
// db/offlineStore.ts
import Dexie, { Table } from 'dexie';

export interface GuestLocal {
  id: string; // UserID hoặc BookingID
  fullName: string;
  department: string;
  qrCode: string;
  mealType: 'LUNCH' | 'DINNER';
  status: 'PENDING' | 'EATEN';
}

export interface OfflineLog {
  id?: number; // Auto-inc
  guestId: string;
  checkInTime: number; // Date.now()
  synced: boolean;
}

export class OfflineDatabase extends Dexie {
  guests!: Table<GuestLocal>;
  logs!: Table<OfflineLog>;

  constructor() {
    super('KitchenDB');
    this.version(1).stores({
      guests: 'id, qrCode, status', // Index để tìm nhanh
      logs: '++id, synced' 
    });
  }
}

export const db = new OfflineDatabase();
```

## 4. Logic Nghiệp vụ (Core Code)

### A. Tải dữ liệu đầu ngày (Pre-cache)
*Chạy khi bật máy hoặc ấn nút "Làm mới dữ liệu".*

```typescript
// hooks/useKitchenSync.ts
const syncDataToLocal = async () => {
  try {
    const response = await api.get('/today-bookings'); // Lấy 1000+ bản ghi
    
    await db.transaction('rw', db.guests, async () => {
      await db.guests.clear(); // Xóa dữ liệu cũ
      await db.guests.bulkAdd(response.data); // Thêm dữ liệu mới
    });
    
    toast.success("Đã tải dữ liệu offline thành công!");
  } catch (err) {
    toast.error("Lỗi đồng bộ! Vui lòng kiểm tra mạng.");
  }
};
```

### B. Xử lý Check-in Offline (The "Magic")
*Hàm xử lý khi Camera quét được mã QR.*

```typescript
// components/QRScanner.tsx
const handleScan = async (qrCode: string) => {
  // 1. Tìm trong Local DB trước (Bất kể có mạng hay không)
  const guest = await db.guests.where('qrCode').equals(qrCode).first();

  if (!guest) {
    playSound('ERROR'); // Không tìm thấy đăng ký
    return showDialog('Chưa đăng ký món!');
  }

  if (guest.status === 'EATEN') {
    playSound('WARNING');
    return showDialog('Đã ăn rồi!');
  }

  // 2. Nếu hợp lệ: Update Local ngay lập tức
  await db.guests.update(guest.id, { status: 'EATEN' });
  playSound('SUCCESS'); // Ting!
  showDialog(`Xin chào ${guest.fullName}`);

  // 3. Ghi log để sync sau
  await db.logs.add({
    guestId: guest.id,
    checkInTime: Date.now(),
    synced: false
  });

  // 4. Thử Sync ngay nếu có mạng (Fire & Forget)
  trySyncLogs(); 
};
```

### C. Cơ chế tự động đồng bộ (Background Sync)
*Chạy ngầm để đẩy dữ liệu lên Server.*

```typescript
// services/syncService.ts
const trySyncLogs = async () => {
  if (!navigator.onLine) return; // Mất mạng thì thôi

  const pendingLogs = await db.logs.where('synced').equals(false).toArray();
  if (pendingLogs.length === 0) return;

  try {
    // Gửi bulk request lên Server
    await api.post('/sync-checkin', { logs: pendingLogs });

    // Đánh dấu đã sync
    await db.logs.bulkDelete(pendingLogs.map(l => l.id));
    console.log(`Đã đồng bộ ${pendingLogs.length} lượt check-in.`);
  } catch (e) {
    console.log("Sync failed, retry later.");
  }
};

// Lắng nghe sự kiện có mạng lại
window.addEventListener('online', trySyncLogs);
// Hoặc setInterval 1 phút/lần
setInterval(trySyncLogs, 60000);
```

---

## 5. Kết luận
Giải pháp này đảm bảo:
1.  **Tốc độ:** Check-in không độ trễ do đọc DB máy.
2.  **Sẵn sàng:** Mất mạng 100% vẫn hoạt động bình thường.
3.  **Toàn vẹn:** Dữ liệu được queue lại và đồng bộ sau, không bị mất.
