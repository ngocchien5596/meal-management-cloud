import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/config/server-time - Get current server time
router.get('/server-time', async (req, res) => {
    res.json({
        success: true,
        data: {
            serverTime: new Date().toISOString(),
            timezone: 'Asia/Ho_Chi_Minh'
        }
    });
});

// GET /api/config - Get all configs
router.get('/', authenticate, async (req, res, next) => {
    try {
        const configs = await prisma.systemConfig.findMany();

        const configMap: Record<string, string> = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });

        res.json({
            success: true,
            data: configMap,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/config/:key - Update config
router.put('/:key', authenticate, authorize('ADMIN_SYSTEM'), async (req: AuthRequest, res, next) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (!value) {
            return res.status(400).json({
                success: false,
                error: { message: 'Value is required', code: 'VALIDATION_ERROR' },
            });
        }

        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { value, updatedBy: req.user!.id },
            create: { key, value, updatedBy: req.user!.id },
        });

        res.json({
            success: true,
            data: config,
            message: 'Cập nhật cấu hình thành công',
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/config/presets - Get registration presets
router.get('/presets', authenticate, async (req, res, next) => {
    try {
        const presets = await prisma.registrationPreset.findMany();

        res.json({
            success: true,
            data: presets,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/config/departments - Get departments
router.get('/departments', authenticate, async (req, res, next) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { employees: true } } }, // Include employee count
        });

        res.json({
            success: true,
            data: departments,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/config/departments - Create department
router.post('/departments', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban là bắt buộc' } });

        const existing = await prisma.department.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban đã tồn tại' } });

        const dept = await prisma.department.create({ data: { name } });
        res.json({ success: true, data: dept, message: 'Thêm phòng ban thành công' });
    } catch (error) {
        next(error);
    }
});

// PUT /api/config/departments/:id - Update department
router.put('/departments/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban là bắt buộc' } });

        // Check if name exists for other dept
        const existing = await prisma.department.findFirst({ where: { name, NOT: { id } } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban đã tồn tại' } });

        const dept = await prisma.department.update({ where: { id }, data: { name } });
        res.json({ success: true, data: dept, message: 'Cập nhật phòng ban thành công' });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/config/departments/:id - Delete department
router.delete('/departments/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if in use
        const inUse = await prisma.employee.findFirst({ where: { departmentId: id } });
        if (inUse) return res.status(400).json({ success: false, error: { message: 'Không thể xóa phòng ban đang có nhân viên' } });

        await prisma.department.delete({ where: { id } });
        res.json({ success: true, message: 'Xóa phòng ban thành công' });
    } catch (error) {
        next(error);
    }
});

// GET /api/config/positions - Get positions
router.get('/positions', authenticate, async (req, res, next) => {
    try {
        const positions = await prisma.position.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { employees: true } } },
        });

        res.json({
            success: true,
            data: positions,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/config/positions - Create position
router.post('/positions', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ là bắt buộc' } });

        const existing = await prisma.position.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ đã tồn tại' } });

        const position = await prisma.position.create({ data: { name } });
        res.json({ success: true, data: position, message: 'Thêm chức vụ thành công' });
    } catch (error) {
        next(error);
    }
});

// PUT /api/config/positions/:id - Update position
router.put('/positions/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ là bắt buộc' } });

        const existing = await prisma.position.findFirst({ where: { name, NOT: { id } } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ đã tồn tại' } });

        const position = await prisma.position.update({ where: { id }, data: { name } });
        res.json({ success: true, data: position, message: 'Cập nhật chức vụ thành công' });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/config/positions/:id - Delete position
router.delete('/positions/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const inUse = await prisma.employee.findFirst({ where: { positionId: id } });
        if (inUse) return res.status(400).json({ success: false, error: { message: 'Không thể xóa chức vụ đang có nhân viên' } });

        await prisma.position.delete({ where: { id } });
        res.json({ success: true, message: 'Xóa chức vụ thành công' });
    } catch (error) {
        next(error);
    }
});

export default router;
