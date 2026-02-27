import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { z } from 'zod';

const router: Router = Router();

// --- Helper: Ensure Legacy Price is Migrated ---
export const ensureLegacyPriceMigrated = async () => {
    try {
        const count = await prisma.mealPriceConfig.count();
        if (count > 0) return; // Already data exists

        console.log('🔄 Migrating legacy meal price to history...');

        // Fetch legacy price
        const legacyConfig = await prisma.systemConfig.findUnique({
            where: { key: 'MEAL_PRICE' }
        });

        if (legacyConfig) {
            const price = parseFloat(legacyConfig.value);
            if (!isNaN(price)) {
                await prisma.mealPriceConfig.create({
                    data: {
                        price: price,
                        startDate: new Date('2020-01-01'), // Long past date
                        endDate: null, // Valid forever until new price added
                    }
                });
                console.log('✅ Legacy price migrated successfully.');
            }
        }
    } catch (error) {
        console.error('❌ Failed to migrate legacy price:', error);
    }
};

// --- Routes ---

// GET / - Get Price History
router.get('/', authenticate, async (req, res) => {
    try {
        // Find all prices, ordered by start date desc
        const prices = await prisma.mealPriceConfig.findMany({
            orderBy: { startDate: 'desc' }
        });
        res.json({ success: true, data: prices });
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ error: `Failed to fetch price history: ${(error as any)?.message || error}` });
    }
});

// GET /effective - Get effective price for a date (or today)
router.get('/effective', authenticate, async (req, res) => {
    try {
        const dateStr = req.query.date as string;
        const targetDate = dateStr ? new Date(dateStr) : new Date();

        if (dateStr && isNaN(targetDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const effectiveConfig = await prisma.mealPriceConfig.findFirst({
            where: {
                startDate: { lte: targetDate },
                OR: [
                    { endDate: null },
                    { endDate: { gte: targetDate } }
                ]
            },
            orderBy: { startDate: 'desc' }
        });

        if (!effectiveConfig) {
            // Fallback to legacy check or default zero if absolutely nothing found (shouldn't happen after migration)
            return res.json({ success: true, data: { price: 0, source: 'default' } });
        }

        res.json({ success: true, data: effectiveConfig });
    } catch (error) {
        console.error('Error fetching effective price:', error);
        res.status(500).json({ error: 'Failed to fetch effective price' });
    }
});

// POST / - Add New Future Price
router.post('/', authenticate, authorize('ADMIN_SYSTEM'), async (req, res) => {
    try {
        const schema = z.object({
            price: z.number().min(0),
            startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
        });

        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors[0].message });
        }

        const { price, startDate: startDateStr } = result.data;
        const newStartDate = new Date(startDateStr);

        // Normalize time to 00:00:00 to avoid timezone confusion for dates
        newStartDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // STRICT VALIDATION: Start Date must be TOMORROW to ensure continuity with "Old End = Today"
        if (newStartDate.getTime() !== tomorrow.getTime()) {
            return res.status(400).json({
                error: 'Ngày bắt đầu giá mới phải là ngày mai (để đảm bảo tính liên tục với giá cũ kết thúc hôm nay).'
            });
        }

        // Transaction to ensure integrity
        await prisma.$transaction(async (tx) => {
            // 1. Find the current active price (endDate is null)
            const latestPrice = await tx.mealPriceConfig.findFirst({
                orderBy: { startDate: 'desc' },
            });

            if (latestPrice) {
                // Double check if we are indeed after the latest price (though "Tomorrow" should always be > if latest is active)
                if (newStartDate <= latestPrice.startDate) {
                    // This could happen if someone added a price for tomorrow, then tries to add another?
                    // But latestPrice would be that one. Use basic logic.
                    throw new Error('Ngày bắt đầu giá mới phải sau ngày bắt đầu của giá hiện tại.');
                }

                // 2. Close the previous price
                // Requirement: "Endate của giá cũ là ngày tạo giá mới" -> Today
                const newEndDateForPrevious = new Date(today);

                // Update specific record
                await tx.mealPriceConfig.update({
                    where: { id: latestPrice.id },
                    data: { endDate: newEndDateForPrevious }
                });
            }

            // 3. Create new price
            await tx.mealPriceConfig.create({
                data: {
                    price,
                    startDate: newStartDate,
                    endDate: null
                }
            });

            // 4. Also update SystemConfig for backward compatibility (optional but safe)
            // But we decided to move away. Let's keep it sync just in case legacy read?
            // No, let's force usage of this new table. If we sync, old logic works but might be confusing.
            // Let's UPDATE it so if any old code reads it, it sees the "future" price (or current). 
            // Actually, updating SystemConfig with current active price is safest for backwards compat without breaking.
            // But 'newStartDate' might be in future. So SystemConfig would be wrong "now".
            // Decision: Do NOT update SystemConfig. Legacy code must be refactored or we rely on the Migration to have populated it,
            // and we leave SystemConfig stale.
        });

        res.json({ success: true, message: 'Thêm cấu hình giá thành công' });
    } catch (error: any) {
        console.error('Error creating price:', error);
        res.status(400).json({ error: error.message || 'Failed to create price' });
    }
});

// PUT /:id - Update Price Config
router.put('/:id', authenticate, authorize('ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const schema = z.object({
            price: z.number().min(0).optional(),
            startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }).optional(),
        });

        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors[0].message });
        }

        const { price, startDate: startDateStr } = result.data;

        await prisma.$transaction(async (tx) => {
            const targetConfig = await tx.mealPriceConfig.findUnique({
                where: { id }
            });

            if (!targetConfig) {
                throw new Error('Không tìm thấy cấu hình giá');
            }

            // RESTRICTION: Do not allow editing past/closed prices
            if (targetConfig.endDate !== null) {
                throw new Error('Không thể sửa cấu hình giá cũ (đã kết thúc). Chỉ được sửa giá đang áp dụng hiện tại.');
            }

            const updateData: any = {};
            if (price !== undefined) updateData.price = price;

            // Handle Start Date Update
            if (startDateStr) {
                // Only allow updating start date if it's the LATEST active record
                if (targetConfig.endDate !== null) {
                    throw new Error('Chỉ có thể sửa ngày bắt đầu của cấu hình giá hiện tại (đang áp dụng).');
                }

                const newStartDate = new Date(startDateStr);
                newStartDate.setHours(0, 0, 0, 0);

                // Find the previous record to adjust its endDate
                const prevConfig = await tx.mealPriceConfig.findFirst({
                    where: {
                        startDate: { lt: targetConfig.startDate }, // Find one before the CURRENT target start date
                        id: { not: id }
                    },
                    orderBy: { startDate: 'desc' }
                });

                if (prevConfig) {
                    if (newStartDate <= prevConfig.startDate) {
                        throw new Error('Ngày bắt đầu mới phải sau ngày bắt đầu của giá trước đó.');
                    }

                    // Update previous config end date
                    const newPrevEndDate = new Date(newStartDate);
                    newPrevEndDate.setDate(newPrevEndDate.getDate() - 1);

                    await tx.mealPriceConfig.update({
                        where: { id: prevConfig.id },
                        data: { endDate: newPrevEndDate }
                    });
                }

                updateData.startDate = newStartDate;
            }

            await tx.mealPriceConfig.update({
                where: { id },
                data: updateData
            });
        });

        res.json({ success: true, message: 'Cập nhật giá thành công' });
    } catch (error: any) {
        console.error('Error updating price:', error);
        res.status(400).json({ error: error.message || 'Failed to update price' });
    }
});

export default router;
