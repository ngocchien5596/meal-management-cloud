import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router: Router = Router();
const prisma = new PrismaClient();

// Get all menu items catalog
router.get('/catalog', authenticate, async (req, res) => {
    try {
        const { search } = req.query;
        const catalog = await prisma.menuItemCatalog.findMany({
            where: search ? {
                name: { contains: search as string, mode: 'insensitive' }
            } : {},
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: catalog });
    } catch (error) {
        console.error('Get menu catalog error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Create menu item catalog
router.post('/catalog', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { name } = req.body;

        // Check if exists
        const existing = await prisma.menuItemCatalog.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Tên món ăn đã tồn tại trong từ điển' });
        }

        const item = await prisma.menuItemCatalog.create({
            data: { name }
        });
        res.json({ success: true, data: item });
    } catch (error) {
        console.error('Create menu catalog error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Update menu item catalog
router.patch('/catalog/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const item = await prisma.menuItemCatalog.update({
            where: { id },
            data: { name }
        });
        res.json({ success: true, data: item });
    } catch (error) {
        console.error('Update menu catalog error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Delete menu item catalog
router.delete('/catalog/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if in use
        const inUse = await prisma.menuItem.findFirst({
            where: { catalogId: id }
        });

        if (inUse) {
            return res.status(400).json({
                success: false,
                error: 'Không thể xóa món ăn này vì đang được sử dụng trong các thực đơn thực tế'
            });
        }

        await prisma.menuItemCatalog.delete({ where: { id } });
        res.json({ success: true, message: 'Deleted from catalog' });
    } catch (error) {
        console.error('Delete menu catalog error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
