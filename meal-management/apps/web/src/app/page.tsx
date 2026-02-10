import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">
                    🍽️ Quản lý Suất Ăn
                </h1>
                <p className="text-muted-foreground mb-8">
                    Hệ thống quản lý suất ăn cho doanh nghiệp
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    Đăng nhập
                </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <div className="p-6 rounded-lg border bg-card">
                    <h3 className="font-semibold mb-2">📅 Đăng ký lịch ăn</h3>
                    <p className="text-sm text-muted-foreground">
                        Nhân viên đăng ký bữa ăn theo ngày hoặc sử dụng preset
                    </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                    <h3 className="font-semibold mb-2">📱 Check-in QR</h3>
                    <p className="text-sm text-muted-foreground">
                        Xác nhận vào ăn bằng quét QR hoặc nhập mã thủ công
                    </p>
                </div>
                <div className="p-6 rounded-lg border bg-card">
                    <h3 className="font-semibold mb-2">📊 Báo cáo</h3>
                    <p className="text-sm text-muted-foreground">
                        Tổng hợp số liệu và xuất Excel cho HR/Kế toán
                    </p>
                </div>
            </div>
        </main>
    );
}
