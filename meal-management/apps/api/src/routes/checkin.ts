import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router: Router = Router();

// POST /api/checkin/manual - Manual checkin by Admin
router.post('/manual', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { mealEventId, employeeCode, secretCode } = req.body;

        if (!mealEventId || !employeeCode || !secretCode) {
            return res.status(400).json({ success: false, error: 'Thiếu thông tin check-in' });
        }

        // 1. Verify Employee & Secret Code
        const account = await prisma.account.findFirst({
            where: {
                employee: { employeeCode },
                secretCode,
                isActive: true
            },
            include: { employee: true }
        });

        if (!account) {
            return res.status(400).json({ success: false, error: 'Mã nhân viên hoặc mã bí mật không chính xác' });
        }

        const employee = account.employee;
        const employeeId = employee.id;

        // 2. Verify Meal Status
        const meal = await prisma.mealEvent.findUnique({ where: { id: mealEventId } });
        if (!meal || meal.status !== 'IN_PROGRESS') {
            return res.status(400).json({
                success: false,
                error: 'Bữa ăn hiện không trong thời gian check-in',
                employee: { fullName: employee.fullName, employeeCode: employee.employeeCode }
            });
        }

        // 3. Verify Registration
        const registration = await prisma.registration.findFirst({
            where: { mealEventId, employeeId, isCancelled: false }
        });

        if (!registration) {
            return res.status(400).json({
                success: false,
                error: 'Nhân viên chưa đăng ký suất ăn này',
                employee: { fullName: employee.fullName, employeeCode: employee.employeeCode }
            });
        }

        // 4. Check for Duplicate Check-in
        const existingCheckin = await prisma.checkinLog.findUnique({
            where: {
                mealEventId_employeeId: { mealEventId, employeeId }
            }
        });

        if (existingCheckin) {
            return res.status(400).json({
                success: false,
                error: 'Nhân viên này đã điểm danh rồi',
                employee: { fullName: employee.fullName, employeeCode: employee.employeeCode }
            });
        }

        // 5. Create CheckinLog
        const checkin = await prisma.checkinLog.create({
            data: {
                mealEventId,
                employeeId,
                method: 'MANUAL'
            },
            include: {
                employee: {
                    select: { fullName: true, employeeCode: true }
                }
            }
        });

        // Notify via Socket
        const io = req.app.get('io');
        io.to(`meal-${mealEventId}`).emit('new-checkin', checkin);

        res.json({ success: true, data: checkin });
    } catch (error) {
        console.error('Manual checkin error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/checkin/scan-employee - Employee scan QR (token processed by Admin/Scanner)
router.post('/scan-employee', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { mealEventId, employeeId } = req.body;

        if (!mealEventId || !employeeId) {
            return res.status(400).json({ success: false, error: 'Thiếu thông tin quét mã' });
        }

        // 0. Fetch Employee Early for better error reporting
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { fullName: true, employeeCode: true }
        });

        if (!employee) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy nhân viên' });
        }

        // 1. Verify Meal Status
        const meal = await prisma.mealEvent.findUnique({ where: { id: mealEventId } });
        if (!meal || meal.status !== 'IN_PROGRESS') {
            return res.status(400).json({
                success: false,
                error: 'Bữa ăn không khả dụng',
                employee
            });
        }

        // 2. Verify Registration
        const registration = await prisma.registration.findFirst({
            where: { mealEventId, employeeId, isCancelled: false }
        });

        if (!registration) {
            return res.status(400).json({
                success: false,
                error: 'Nhân viên chưa đăng ký suất ăn này',
                employee
            });
        }

        // 3. Check for Duplicate Check-in
        const existingCheckin = await prisma.checkinLog.findUnique({
            where: {
                mealEventId_employeeId: { mealEventId, employeeId }
            }
        });

        if (existingCheckin) {
            return res.status(400).json({
                success: false,
                error: 'Nhân viên này đã điểm danh rồi',
                employee
            });
        }

        // 4. Log Check-in
        const checkin = await prisma.checkinLog.create({
            data: {
                mealEventId,
                employeeId,
                method: 'QR_SCAN'
            },
            include: {
                employee: {
                    select: { fullName: true, employeeCode: true }
                }
            }
        });

        const io = req.app.get('io');
        io.to(`meal-${mealEventId}`).emit('new-checkin', checkin);

        res.json({ success: true, data: checkin });
    } catch (error) {
        console.error('Scan employee error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/checkin/scan-guest - Guest scan QR
router.post('/scan-guest', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { mealEventId, guestId } = req.body;

        if (!mealEventId || !guestId) {
            return res.status(400).json({ success: false, error: 'Thiếu thông tin quét mã khách' });
        }

        // 0. Fetch Guest Early
        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            select: { fullName: true, mealEventId: true }
        });

        if (!guest) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin khách mời' });
        }

        if (guest.mealEventId !== mealEventId) {
            return res.status(400).json({ success: false, error: 'Khách mời không thuộc bữa ăn này' });
        }

        // 1. Verify Meal Status
        const meal = await prisma.mealEvent.findUnique({ where: { id: mealEventId } });
        if (!meal || meal.status !== 'IN_PROGRESS') {
            return res.status(400).json({
                success: false,
                error: 'Bữa ăn không khả dụng',
                guest: { fullName: guest.fullName }
            });
        }

        // 2. Check for Duplicate Check-in
        const existingCheckin = await prisma.checkinLog.findUnique({
            where: {
                mealEventId_guestId: { mealEventId, guestId }
            }
        });

        if (existingCheckin) {
            return res.status(400).json({
                success: false,
                error: 'Khách mời này đã điểm danh rồi',
                guest: { fullName: guest.fullName }
            });
        }

        // 3. Log Check-in
        const checkin = await prisma.checkinLog.create({
            data: {
                mealEventId,
                guestId,
                method: 'QR_SCAN'
            },
            include: {
                guest: {
                    select: { fullName: true }
                }
            }
        });

        const io = req.app.get('io');
        io.to(`meal-${mealEventId}`).emit('new-checkin', checkin);

        res.json({ success: true, data: checkin });
    } catch (error) {
        console.error('Scan guest error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/checkin/self-scan - Employee self-scan meal QR
router.post('/self-scan', authenticate, async (req: AuthRequest, res) => {
    try {
        const { qrToken } = req.body;
        const employeeId = req.user?.employeeId;

        if (!qrToken) {
            return res.status(400).json({ success: false, error: 'Thiếu mã QR bữa ăn' });
        }

        if (!employeeId) {
            return res.status(401).json({ success: false, error: 'Không tìm thấy thông tin nhân viên đăng nhập' });
        }

        // 1. Find Meal by QR Token & Check Status
        const meal = await prisma.mealEvent.findUnique({
            where: { qrToken }
        });

        if (!meal || meal.status !== 'IN_PROGRESS') {
            return res.status(400).json({ success: false, error: 'Mã QR không hợp lệ hoặc bữa ăn đã kết thúc' });
        }

        const mealEventId = meal.id;

        // 2. Verify Employee Registration
        const registration = await prisma.registration.findFirst({
            where: {
                mealEventId,
                employeeId,
                isCancelled: false
            },
            include: {
                employee: {
                    select: { fullName: true, employeeCode: true }
                }
            }
        });

        if (!registration) {
            return res.status(400).json({
                success: false,
                error: 'Bạn chưa đăng ký suất ăn này'
            });
        }

        const { employee } = registration;

        // 3. Check for Duplicate Check-in
        const existingCheckin = await prisma.checkinLog.findUnique({
            where: {
                mealEventId_employeeId: { mealEventId, employeeId }
            }
        });

        if (existingCheckin) {
            return res.status(400).json({
                success: false,
                error: 'Bạn đã điểm danh suất ăn này rồi',
                employee
            });
        }

        // 4. Create CheckinLog
        const checkin = await prisma.checkinLog.create({
            data: {
                mealEventId,
                employeeId,
                method: 'SELF_SCAN'
            },
            include: {
                employee: {
                    select: { fullName: true, employeeCode: true }
                }
            }
        });

        // 5. Emit Event for Real-time Kitchen Dashboard
        const io = req.app.get('io');
        io.to(`meal-${mealEventId}`).emit('new-checkin', checkin);

        res.json({
            success: true,
            data: checkin,
            meal: {
                mealType: meal.mealType,
                mealDate: meal.mealDate
            }
        });
    } catch (error) {
        console.error('Self-scan error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
