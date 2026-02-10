import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n🚀 Bắt đầu dọn dẹp dữ liệu lỗi tháng 02/2026...');
    console.log('--------------------------------------------');

    const startDate = new Date('2026-02-01T00:00:00Z');
    const endDate = new Date('2026-02-28T23:59:59Z');

    // Tìm các bản ghi đăng ký bị hủy (isCancelled: true) trong tháng 2 
    // mà không có người thực hiện (cancelledBy: null) - đây là các bản ghi bị lỗi do Preset logic cũ.

    const targetRegistrations = await prisma.registration.findMany({
        where: {
            isCancelled: true,
            cancelledBy: null,
            mealEvent: {
                mealDate: {
                    gte: startDate,
                    lte: endDate
                }
            }
        }
    });

    console.log(`🔍 Tìm thấy ${targetRegistrations.length} bản ghi lỗi cần xóa.`);

    if (targetRegistrations.length === 0) {
        console.log('✨ Không có dữ liệu lỗi nào cần xử lý.');
        return;
    }

    const deleteResult = await prisma.registration.deleteMany({
        where: {
            id: {
                in: targetRegistrations.map(r => r.id)
            }
        }
    });

    console.log(`✅ Đã xóa thành công ${deleteResult.count} bản ghi đăng ký lỗi.`);
    console.log('✨ Hoàn tất dọn dẹp dữ liệu.');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi trong quá trình dọn dẹp:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
