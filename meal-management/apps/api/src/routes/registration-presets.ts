import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/v1/registration-presets - Get registration presets
router.get('/', authenticate, async (req, res, next) => {
    try {
        const presets = await prisma.registrationPreset.findMany({
            include: { location: true }
        });

        res.json({
            success: true,
            data: presets,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/v1/registration-presets/:id - Update registration preset
router.put('/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { locationId } = req.body;

        const preset = await prisma.registrationPreset.update({
            where: { id },
            data: { locationId },
            include: { location: true }
        });

        res.json({
            success: true,
            data: preset,
            message: 'Cập nhật mẫu đăng ký thành công',
        });
    } catch (error) {
        // e.g. record not found
        next(error);
    }
});

export default router;
