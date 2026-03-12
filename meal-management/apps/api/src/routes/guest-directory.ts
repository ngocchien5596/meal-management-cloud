import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// Get all directories (with search)
router.get('/', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM', 'CLERK'), async (req, res) => {
    try {
        const { search } = req.query;

        const where: any = {};
        if (search) {
            where.fullName = { contains: String(search), mode: 'insensitive' };
        }

        const directories = await prisma.guestDirectory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: { fullName: true }
                }
            }
        });

        res.json({
            success: true,
            data: directories
        });
    } catch (error) {
        console.error('Failed to get guest directories:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve guest directories' });
    }
});

// Create new directory
router.post('/', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM', 'CLERK'), async (req: AuthRequest, res) => {
    try {
        const { fullName, note, isActive, phoneNumber } = req.body;
        if (!fullName || fullName.trim().length > 100) {
            return res.status(400).json({ error: 'Họ tên không được để trống và tối đa 100 ký tự' });
        }
        if (phoneNumber && phoneNumber.trim().length > 20) {
            return res.status(400).json({ error: 'Số điện thoại tối đa 20 ký tự' });
        }
        if (note && note.trim().length > 255) {
            return res.status(400).json({ error: 'Ghi chú tối đa 255 ký tự' });
        }
        const newDirectory = await prisma.guestDirectory.create({
            data: {
                fullName: fullName.trim(),
                note: note?.trim().substring(0, 255),
                phoneNumber: phoneNumber?.trim().substring(0, 20),
                isActive: isActive ?? true,
                createdBy: req.user?.employeeId
            }
        });

        res.status(201).json({ success: true, data: newDirectory });
    } catch (error) {
        console.error('Failed to create guest directory:', error);
        res.status(500).json({ success: false, error: 'Failed to create guest directory' });
    }
});

// Update directory
router.put('/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM', 'CLERK'), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { fullName, note, isActive, phoneNumber } = req.body;

        // Ownership check for CLERK
        if (req.user?.role === 'CLERK') {
            const current = await prisma.guestDirectory.findUnique({
                where: { id },
                select: { createdBy: true }
            });

            if (!current || current.createdBy !== req.user.employeeId) {
                return res.status(403).json({
                    success: false,
                    error: 'Bạn không có quyền chỉnh sửa mục danh bạ này (chỉ được sửa mục do mình tạo).'
                });
            }
        }

        if (fullName && fullName.trim().length > 100) {
            return res.status(400).json({ error: 'Họ tên tối đa 100 ký tự' });
        }
        if (phoneNumber && phoneNumber.trim().length > 20) {
            return res.status(400).json({ error: 'Số điện thoại tối đa 20 ký tự' });
        }
        if (note && note.trim().length > 255) {
            return res.status(400).json({ error: 'Ghi chú tối đa 255 ký tự' });
        }

        const updated = await prisma.guestDirectory.update({
            where: { id },
            data: {
                ...(fullName && { fullName: fullName.trim() }),
                ...(note !== undefined && { note: note?.trim() }),
                ...(isActive !== undefined && { isActive }),
                ...(phoneNumber !== undefined && { phoneNumber: phoneNumber?.trim() })
            }
        });


        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Failed to update guest directory:', error);
        res.status(500).json({ success: false, error: 'Failed to update guest directory' });
    }
});

// Delete directory
router.delete('/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM', 'CLERK'), async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        // Ownership check for CLERK
        if (req.user?.role === 'CLERK') {
            const current = await prisma.guestDirectory.findUnique({
                where: { id },
                select: { createdBy: true }
            });

            if (!current || current.createdBy !== req.user.employeeId) {
                return res.status(403).json({
                    success: false,
                    error: 'Bạn không có quyền xóa mục danh bạ này (chỉ được xóa mục do mình tạo).'
                });
            }
        }

        await prisma.guestDirectory.delete({ where: { id } });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Failed to delete guest directory:', error);
        res.status(500).json({ success: false, error: 'Failed to delete guest directory' });
    }
});

export default router;
