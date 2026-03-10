import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/v1/configs - Get all configs
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

// PATCH /api/v1/configs/:key - Update config
router.patch('/:key', authenticate, authorize('ADMIN_SYSTEM'), async (req: AuthRequest, res, next) => {
    try {
        let { key } = req.params;
        const { value } = req.body;

        if (!value) {
            return res.status(400).json({
                success: false,
                error: { message: 'Value is required', code: 'VALIDATION_ERROR' },
            });
        }

        // Map kebab-case from URL to UPPER_SNAKE_CASE for DB
        if (key === 'cut-off-hour') {
            key = 'CUT_OFF_HOUR';
        } else if (key === 'meal-price') { // Example if there are others
            key = 'MEAL_PRICE';
        }

        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { value: value.toString(), updatedBy: req.user!.id },
            create: { key, value: value.toString(), updatedBy: req.user!.id },
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

export default router;
