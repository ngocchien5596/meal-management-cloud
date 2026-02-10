import { Router } from 'express';
import { MealType } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

const CUTOFF_HOUR = 16;

/**
 * Check if a meal for a given date/time is still within the registration/cancellation window.
 * Rule: Before 16:00 today, can register for tomorrow onwards.
 *       From 16:00 today, can only register for the day after tomorrow onwards.
 */
// Export for testing
export const canModify = (mealDate: Date): boolean => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Normalize targetDate to 00:00 LOCAL
    const targetDate = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());

    // Difference in days (using simplified comparison)
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return false; // Past or today: cannot modify
    if (diffDays === 1) {
        // Target is tomorrow: can only modify if before 16:00 today
        return now.getHours() < CUTOFF_HOUR;
    }
    return true; // Further in the future: can modify
};

export const getCalendarHandler = async (req: any, res: any, next: any) => {
    try {
        const { year, month } = req.params;
        const employeeId = req.user!.employeeId;

        const startDate = new Date(parseInt(year), parseInt(month), 1, 0, 0, 0);
        const endDate = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59);

        // Fetch all meal events for the month
        const mealEvents = await prisma.mealEvent.findMany({
            where: {
                mealDate: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                registrations: {
                    where: { employeeId }
                },
                checkins: {
                    where: { employeeId }
                }
            }
        });

        res.json({
            success: true,
            data: mealEvents
        });
    } catch (error) {
        next(error);
    }
};

export const toggleRegistrationHandler = async (req: any, res: any, next: any) => {
    try {
        const { date, mealType } = req.body;
        const employeeId = req.user!.employeeId;
        const mealDate = new Date(date);

        if (!canModify(mealDate)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Đã quá thời gian đăng ký/hủy cho ngày này (sau 16:00 ngày hôm trước)', code: 'CUTOFF_EXCEEDED' }
            });
        }

        // Find or create meal event
        let mealEvent = await prisma.mealEvent.findUnique({
            where: { mealDate_mealType: { mealDate, mealType } }
        });

        if (!mealEvent) {
            mealEvent = await prisma.mealEvent.create({
                data: { mealDate, mealType }
            });
        }

        // Check if existing registration
        const registration = await prisma.registration.findUnique({
            where: { mealEventId_employeeId: { mealEventId: mealEvent.id, employeeId } }
        });

        if (registration) {
            // New logic: 
            // 1. If it was a normal active registration, DELETE it (Un-register)
            // 2. If it was a CANCELLED registration (Kitchen override), reactive it (isCancelled: false)
            if (!registration.isCancelled) {
                // User un-registers: Delete the record
                await prisma.registration.delete({
                    where: { id: registration.id }
                });

                return res.json({
                    success: true,
                    data: {
                        message: 'Hủy đăng ký thành công',
                        action: 'un-registered'
                    }
                });
            } else {
                // Was cancelled by kitchen (isCancelled: true)
                // FR-MEAL-004: Kitchen-mandated skips cannot be reactivated by the user
                return res.status(400).json({
                    success: false,
                    error: 'Suất ăn đã bị nhà bếp hủy, không thể đăng ký lại.'
                });
            }
        } else {
            // Create new active registration
            await prisma.registration.create({
                data: { mealEventId: mealEvent.id, employeeId }
            });
            return res.json({
                success: true,
                data: { message: 'Đăng ký thành công', action: 'registered' }
            });
        }

    } catch (error) {
        next(error);
    }
};

// GET /api/registrations/calendar/:year/:month
router.get('/calendar/:year/:month', authenticate, getCalendarHandler);

// POST /api/registrations - Toggle registration
router.post('/', authenticate, toggleRegistrationHandler);

// POST /api/registrations/preset
router.post('/preset', authenticate, async (req, res, next) => {
    try {
        const { presetId, year, month } = req.body;
        const employeeId = (req as AuthRequest).user!.employeeId;

        // Define presets
        const presets: Record<string, { types: MealType[], days: number[] }> = {
            '0': { types: [], days: [] },                                   // Hủy tất cả đăng ký
            '1': { types: [MealType.LUNCH], days: [1, 2, 3, 4, 5] },         // HC - Trưa: T2-T6
            '2': { types: [MealType.LUNCH, MealType.DINNER], days: [1, 2, 3, 4, 5] }, // HC - Trưa+Tối: T2-T6
            '3': { types: [MealType.LUNCH], days: [0, 1, 2, 3, 4, 5, 6] },    // Full - Trưa
            '4': { types: [MealType.LUNCH, MealType.DINNER], days: [0, 1, 2, 3, 4, 5, 6] } // Full - Trưa+Tối
        };

        const preset = presets[presetId as keyof typeof presets];
        if (!preset) {
            return res.status(400).json({ success: false, error: { message: 'Preset không hợp lệ' } });
        }

        const daysInMonth = new Date(parseInt(year as string), parseInt(month as string) + 1, 0).getDate();
        const registrationsToCreate: any[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            // Use 12:00 PM to ensure the date remains the same across all timezone offsets
            const date = new Date(parseInt(year as string), parseInt(month as string), day, 12, 0, 0);
            if (!canModify(date)) continue;

            const dayOfWeek = date.getDay();
            if (preset.days.includes(dayOfWeek)) {
                for (const type of preset.types) {
                    registrationsToCreate.push({ date, type });
                }
            }
        }

        const startDate = new Date(parseInt(year as string), parseInt(month as string), 1, 0, 0, 0);
        const endDate = new Date(parseInt(year as string), parseInt(month as string) + 1, 0, 23, 59, 59);

        // Apply bulk (Using transaction for safety)
        await prisma.$transaction(async (tx) => {
            // 1. CLEAR existing registrations for this month (mark as cancelled)
            // This ensures we don't have leftover registrations that don't belong to the new preset
            const existingRegs = await tx.registration.findMany({
                where: {
                    employeeId,
                    mealEvent: {
                        mealDate: { gte: startDate, lte: endDate }
                    }
                }
            });

            for (const reg of existingRegs) {
                // Only delete if it can be modified (it's in the future and before cutoff)
                const regEvent = await tx.mealEvent.findUnique({ where: { id: reg.mealEventId } });
                if (regEvent && canModify(regEvent.mealDate)) {
                    await tx.registration.delete({
                        where: { id: reg.id }
                    });
                }
            }

            // 2. APPLY new preset
            for (const item of registrationsToCreate) {
                // ... Ensure MealEvent exists
                let event = await tx.mealEvent.findUnique({
                    where: { mealDate_mealType: { mealDate: item.date, mealType: item.type } }
                });

                if (!event) {
                    event = await tx.mealEvent.create({
                        data: { mealDate: item.date, mealType: item.type }
                    });
                }

                // ... Upsert registration (set isCancelled: false)
                await tx.registration.upsert({
                    where: { mealEventId_employeeId: { mealEventId: event.id, employeeId } },
                    update: { isCancelled: false, cancelledAt: null },
                    create: { mealEventId: event.id, employeeId }
                });
            }
        });

        res.json({
            success: true,
            data: { message: 'Áp dụng mẫu đăng ký thành công' }
        });

    } catch (error) {
        next(error);
    }
});

export default router;
