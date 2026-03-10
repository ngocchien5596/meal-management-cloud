import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router: Router = Router();

// POST /api/v1/checkins - Create a new check-in
router.post('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const { method, mealEventId, employeeCode, secretCode, employeeId, guestId, qrToken } = req.body;

        if (!method) {
            return res.status(400).json({ success: false, error: 'Thiếu phương thức check-in (method)' });
        }

        // ---------------------------------------------------------
        // SELF_SCAN logic (Employee scanning Meal QR)
        // ---------------------------------------------------------
        if (method === 'SELF_SCAN') {
            const currentEmployeeId = req.user?.employeeId;
            if (!qrToken) return res.status(400).json({ success: false, error: 'Thiếu mã QR bữa ăn' });
            if (!currentEmployeeId) return res.status(401).json({ success: false, error: 'Không tìm thấy thông tin nhân viên đăng nhập' });

            let meal = await prisma.mealEvent.findUnique({ where: { qrToken } });
            if (!meal && qrToken.startsWith('MEAL-')) {
                const potentialId = qrToken.replace('MEAL-', '');
                meal = await prisma.mealEvent.findUnique({ where: { id: potentialId } });
            }

            if (!meal) return res.status(400).json({ success: false, error: 'Mã QR không hợp lệ hoặc bữa ăn đã bị hủy' });

            const now = new Date();
            const mDate = new Date(meal.mealDate);
            const isToday = mDate.getFullYear() === now.getFullYear() && mDate.getMonth() === now.getMonth() && mDate.getDate() === now.getDate();

            if (meal.status !== 'IN_PROGRESS' && meal.status !== 'COMPLETED' && !isToday) {
                return res.status(400).json({ success: false, error: 'Chỉ điểm danh được cho bữa ăn trong ngày hôm nay' });
            }

            const registration = await prisma.registration.findFirst({
                where: { mealEventId: meal.id, employeeId: currentEmployeeId, isCancelled: false },
                include: { employee: { select: { fullName: true, employeeCode: true } } }
            });
            if (!registration) return res.status(400).json({ success: false, error: 'Bạn chưa đăng ký suất ăn này' });

            const existingCheckin = await prisma.checkinLog.findUnique({
                where: { mealEventId_employeeId: { mealEventId: meal.id, employeeId: currentEmployeeId } }
            });
            if (existingCheckin) return res.status(400).json({ success: false, error: 'Bạn đã điểm danh rồi', employee: registration.employee });

            const checkin = await prisma.checkinLog.create({
                data: { mealEventId: meal.id, employeeId: currentEmployeeId, method: 'SELF_SCAN' },
                include: { employee: { select: { fullName: true, employeeCode: true } } }
            });

            const io = req.app.get('io');
            io.to(`meal-${meal.id}`).emit('new-checkin', checkin);

            return res.json({ success: true, data: checkin, meal: { mealType: meal.mealType, mealDate: meal.mealDate } });
        }

        // =========================================================
        // ADMIN KITCHEN REQUIRED BEYOND THIS POINT
        // =========================================================
        if (req.user?.role !== 'ADMIN_KITCHEN' && req.user?.role !== 'ADMIN_SYSTEM') {
            return res.status(403).json({ success: false, error: 'Không có quyền thực hiện' });
        }

        if (!mealEventId) {
            return res.status(400).json({ success: false, error: 'Thiếu ID bữa ăn' });
        }

        // ---------------------------------------------------------
        // MANUAL logic
        // ---------------------------------------------------------
        if (method === 'MANUAL') {
            if (!employeeCode || !secretCode) return res.status(400).json({ success: false, error: 'Thiếu thông tin check-in' });

            const account = await prisma.account.findFirst({
                where: { employee: { employeeCode }, secretCode, isActive: true },
                include: { employee: true }
            });
            if (!account) return res.status(400).json({ success: false, error: 'Mã nhân viên hoặc mã bí mật không chính xác' });

            const targetEmployeeId = account.employee.id;
            const meal = await prisma.mealEvent.findUnique({ where: { id: mealEventId } });
            if (!meal || meal.status !== 'IN_PROGRESS') return res.status(400).json({ success: false, error: 'Bữa ăn hiện không khả dụng' });

            const registration = await prisma.registration.findFirst({
                where: { mealEventId, employeeId: targetEmployeeId, isCancelled: false }
            });
            if (!registration) return res.status(400).json({ success: false, error: 'Nhân viên chưa đăng ký suất ăn này' });

            const existing = await prisma.checkinLog.findUnique({
                where: { mealEventId_employeeId: { mealEventId, employeeId: targetEmployeeId } }
            });
            if (existing) return res.status(400).json({ success: false, error: 'Nhân viên này đã điểm danh rồi' });

            const checkin = await prisma.checkinLog.create({
                data: { mealEventId, employeeId: targetEmployeeId, method: 'MANUAL' },
                include: { employee: { select: { fullName: true, employeeCode: true } } }
            });

            const io = req.app.get('io');
            io.to(`meal-${mealEventId}`).emit('new-checkin', checkin);
            return res.json({ success: true, data: checkin });
        }

        // ---------------------------------------------------------
        // QR SCAN logic (for Employee or Guest)
        // ---------------------------------------------------------
        if (method === 'QR_SCAN') {
            const meal = await prisma.mealEvent.findUnique({ where: { id: mealEventId } });
            if (!meal || meal.status !== 'IN_PROGRESS') return res.status(400).json({ success: false, error: 'Bữa ăn không khả dụng' });

            if (employeeId) {
                // Scan Employee
                const registration = await prisma.registration.findFirst({
                    where: { mealEventId, employeeId, isCancelled: false }
                });
                if (!registration) return res.status(400).json({ success: false, error: 'Nhân viên chưa đăng ký suất ăn này' });

                const existing = await prisma.checkinLog.findUnique({
                    where: { mealEventId_employeeId: { mealEventId, employeeId } }
                });
                if (existing) return res.status(400).json({ success: false, error: 'Nhân viên này đã điểm danh rồi' });

                const checkin = await prisma.checkinLog.create({
                    data: { mealEventId, employeeId, method: 'QR_SCAN' },
                    include: { employee: { select: { fullName: true, employeeCode: true } } }
                });

                const io = req.app.get('io');
                io.to(`meal-${mealEventId}`).emit('new-checkin', checkin);
                return res.json({ success: true, data: checkin });
            } else if (guestId) {
                // Scan Guest
                const guest = await prisma.guest.findUnique({ where: { id: guestId } });
                if (!guest) return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin khách mời' });
                if (guest.mealEventId !== mealEventId) return res.status(400).json({ success: false, error: 'Khách mời không thuộc bữa ăn này' });

                const existing = await prisma.checkinLog.findUnique({
                    where: { mealEventId_guestId: { mealEventId, guestId } }
                });
                if (existing) return res.status(400).json({ success: false, error: 'Khách mời này đã điểm danh rồi' });

                const checkin = await prisma.checkinLog.create({
                    data: { mealEventId, guestId, method: 'QR_SCAN' },
                    include: { guest: { select: { fullName: true } } }
                });

                const io = req.app.get('io');
                io.to(`meal-${mealEventId}`).emit('new-checkin', checkin);
                return res.json({ success: true, data: checkin });
            } else {
                return res.status(400).json({ success: false, error: 'Thiếu ID nhân viên hoặc khách (employeeId/guestId)' });
            }
        }

        return res.status(400).json({ success: false, error: 'Phương thức (method) không hợp lệ' });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
