import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/v1/departments - Get departments
router.get('/', authenticate, async (req, res, next) => {
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

// POST /api/v1/departments - Create department
router.post('/', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban là bắt buộc' } });
        if (name.length > 50) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban không được quá 50 ký tự' } });

        const existing = await prisma.department.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban đã tồn tại' } });

        const dept = await prisma.department.create({ data: { name } });
        res.json({ success: true, data: dept, message: 'Thêm phòng ban thành công' });
    } catch (error) {
        next(error);
    }
});

// PUT /api/v1/departments/:id - Update department
// Kept logic as is, but this should be PUT /:id or PATCH /:id.
router.put('/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban là bắt buộc' } });
        if (name.length > 50) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban không được quá 50 ký tự' } });

        // Check if name exists for other dept
        const existing = await prisma.department.findFirst({ where: { name, NOT: { id } } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Tên phòng ban đã tồn tại' } });

        const dept = await prisma.department.update({ where: { id }, data: { name } });
        res.json({ success: true, data: dept, message: 'Cập nhật phòng ban thành công' });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/v1/departments/:id - Delete department
router.delete('/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
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

export default router;
