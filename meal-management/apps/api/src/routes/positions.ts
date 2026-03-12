import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/v1/positions - Get positions
router.get('/', authenticate, async (req, res, next) => {
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

// POST /api/v1/positions - Create position
router.post('/', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length > 50) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ tối đa 50 ký tự và không được để trống' } });

        const existing = await prisma.position.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ đã tồn tại' } });

        const position = await prisma.position.create({ data: { name } });
        res.json({ success: true, data: position, message: 'Thêm chức vụ thành công' });
    } catch (error) {
        next(error);
    }
});

// PUT /api/v1/positions/:id - Update position
router.put('/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || name.trim().length > 50) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ tối đa 50 ký tự và không được để trống' } });

        const existing = await prisma.position.findFirst({ where: { name, NOT: { id } } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên chức vụ đã tồn tại' } });

        const position = await prisma.position.update({ where: { id }, data: { name } });
        res.json({ success: true, data: position, message: 'Cập nhật chức vụ thành công' });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/v1/positions/:id - Delete position
router.delete('/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
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
