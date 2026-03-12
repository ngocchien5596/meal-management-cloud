import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router: Router = Router();
const prisma = new PrismaClient();

// GET /api/ingredients/catalog - List all dictionary items
router.get('/catalog', authenticate, async (req, res) => {
    try {
        const { search } = req.query;
        const catalog = await prisma.ingredientCatalog.findMany({
            where: search ? {
                name: { contains: search as string, mode: 'insensitive' }
            } : {},
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: catalog });
    } catch (error) {
        console.error('Fetch catalog error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/ingredients/catalog - Add new dictionary item
router.post('/catalog', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { name, defaultUnit } = req.body;

        if (!name || name.trim().length > 100) {
            return res.status(400).json({ success: false, error: 'Tên nguyên liệu không được để trống và tối đa 100 ký tự' });
        }
        if (!defaultUnit || defaultUnit.trim().length > 50) {
            return res.status(400).json({ success: false, error: 'Đơn vị tính không được để trống và tối đa 50 ký tự' });
        }

        const existing = await prisma.ingredientCatalog.findUnique({ where: { name } });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Ingredient already exists in catalog' });
        }

        const item = await prisma.ingredientCatalog.create({
            data: { name, defaultUnit }
        });

        res.status(201).json({ success: true, data: item });
    } catch (error) {
        console.error('Create catalog item error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// PATCH /api/ingredients/catalog/:id - Update dictionary item
router.patch('/catalog/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, defaultUnit } = req.body;

        if (name && name.trim().length > 100) {
            return res.status(400).json({ success: false, error: 'Tên nguyên liệu tối đa 100 ký tự' });
        }
        if (defaultUnit && defaultUnit.trim().length > 50) {
            return res.status(400).json({ success: false, error: 'Đơn vị tính tối đa 50 ký tự' });
        }

        const item = await prisma.ingredientCatalog.update({
            where: { id },
            data: {
                ...(name && { name: name.trim() }),
                ...(defaultUnit && { defaultUnit: defaultUnit.trim() })
            }
        });

        res.json({ success: true, data: item });
    } catch (error) {
        console.error('Update catalog item error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// DELETE /api/ingredients/catalog/:id - Delete dictionary item
router.delete('/catalog/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ingredient is being used
        const usageCount = await prisma.ingredient.count({ where: { catalogId: id } });
        if (usageCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete: Ingredient is being used in existing meals'
            });
        }

        await prisma.ingredientCatalog.delete({ where: { id } });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Delete catalog item error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/ingredients/catalog/:id/price-history - Fetch price history for a specific ingredient
router.get('/catalog/:id/price-history', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const where: any = { catalogId: id };

        if (startDate || endDate) {
            where.mealEvent = {
                mealDate: {}
            };
            if (startDate) where.mealEvent.mealDate.gte = new Date(startDate as string);
            if (endDate) where.mealEvent.mealDate.lte = new Date(endDate as string);
        }

        const history = await prisma.ingredient.findMany({
            where,
            include: {
                mealEvent: {
                    select: {
                        mealDate: true,
                        mealType: true
                    }
                }
            },
            orderBy: {
                mealEvent: {
                    mealDate: 'asc'
                }
            }
        });

        // Map data for chart
        const data = history.map(item => ({
            id: item.id,
            date: item.mealEvent.mealDate,
            mealType: item.mealEvent.mealType,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            unit: item.unit
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Fetch price history error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
