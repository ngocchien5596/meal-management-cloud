import { Router, Request, Response, NextFunction } from 'express';
import { MealType } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma';

const router: Router = Router();

const DEFAULT_CUTOFF_HOUR = 16;

/**
 * Check if a meal for a given date/time is still within the registration/cancellation window.
 * Rule: Before CUT_OFF_HOUR today, can register for tomorrow onwards.
 *       From CUT_OFF_HOUR today, can only register for the day after tomorrow onwards.
 */
// Export for testing
export const canModifyWithCutoff = (mealDate: Date, cutoffTime: string | number): boolean => {
    // 1. Get Vietnam Time parts reliably
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const vn: any = {};
    parts.forEach(p => { if (p.type !== 'literal') vn[p.type] = parseInt(p.value, 10); });

    // 2. Reconstruct "now" in Vietnam context
    const now = new Date(vn.year, vn.month - 1, vn.day, vn.hour, vn.minute, vn.second);
    const today = new Date(vn.year, vn.month - 1, vn.day);

    // 3. Normalize targetDate to 00:00 (of the target date)
    const targetDate = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());

    // 4. Difference in days
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    console.log(`[Cutoff Check] Now(VN): ${vn.hour}:${vn.minute}, Today(VN): ${vn.day}/${vn.month}, TargetDate: ${mealDate.getDate()}/${mealDate.getMonth() + 1}, diffDays: ${diffDays}`);

    if (diffDays < 1) return false; // Past or today: cannot modify
    if (diffDays === 1) {
        // Target is tomorrow: can only modify if before cutoffTime today (in VN time)
        let cutoffHour = 16;
        let cutoffMinute = 0;

        if (typeof cutoffTime === 'string' && cutoffTime.includes(':')) {
            const parts = cutoffTime.split(':');
            cutoffHour = parseInt(parts[0], 10);
            cutoffMinute = parseInt(parts[1], 10);
            if (isNaN(cutoffHour)) cutoffHour = 16;
            if (isNaN(cutoffMinute)) cutoffMinute = 0;
        } else {
            cutoffHour = typeof cutoffTime === 'number' ? cutoffTime : parseInt(cutoffTime as string, 10);
            if (isNaN(cutoffHour)) cutoffHour = 16;
        }

        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        console.log(`[Cutoff Check] Tomorrow logic: Current VN ${currentHour}:${currentMinute} vs Cutoff ${cutoffHour}:${cutoffMinute}`);

        const result = (currentHour < cutoffHour) || (currentHour === cutoffHour && currentMinute < cutoffMinute);
        console.log(`[Cutoff Check] Result: ${result ? 'ALLOWED' : 'BLOCKED'}`);
        return result;
    }
    return true; // Further in the future: can modify
};

export const canModify = async (mealDate: Date, userRole?: string): Promise<boolean> => {
    let cutoffValue: string | number = DEFAULT_CUTOFF_HOUR;
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: 'CUT_OFF_HOUR' }
        });
        if (config && config.value) {
            cutoffValue = config.value;
        }
    } catch (err) {
        console.error('Failed to get CUT_OFF_HOUR configuration', err);
    }
    return canModifyWithCutoff(mealDate, cutoffValue);
};

export const getCalendarHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { year, month } = req.params as any;
        const employeeId = (req as unknown as AuthRequest).user!.employeeId;

        const startDate = new Date(parseInt(year), parseInt(month), 1);
        const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);

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
                    where: { employeeId },
                    include: {
                        location: true
                    }
                },
                menuItems: {
                    select: {
                        catalog: { select: { name: true } }
                    }
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

export const toggleRegistrationHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { date, mealType, locationId } = req.body as any;
        const employeeId = (req as unknown as AuthRequest).user!.employeeId;
        const mealDate = new Date(date);

        const canMod = await canModify(mealDate, (req as unknown as AuthRequest).user!.role);
        if (!canMod) {
            return res.status(400).json({
                success: false,
                error: { message: 'Đã quá thời gian đăng ký/hủy cho ngày này (quá giờ chốt)', code: 'CUTOFF_EXCEEDED' }
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
                data: { mealEventId: mealEvent.id, employeeId, locationId: locationId || undefined }
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

export const updateLocationHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { date, mealType, locationId } = req.body as any;
        const employeeId = (req as unknown as AuthRequest).user!.employeeId;
        const mealDate = new Date(date);

        const canMod = await canModify(mealDate, (req as unknown as AuthRequest).user!.role);
        if (!canMod) {
            return res.status(400).json({
                success: false,
                error: 'Đã hết thời gian cho phép chỉnh sửa suất ăn này.'
            });
        }

        // Find the meal event
        const mealEvent = await prisma.mealEvent.findUnique({
            where: {
                mealDate_mealType: {
                    mealDate: mealDate,
                    mealType: mealType as MealType
                }
            }
        });

        if (!mealEvent) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bữa ăn.'
            });
        }

        // Find existing registration
        const registration = await prisma.registration.findUnique({
            where: {
                mealEventId_employeeId: {
                    mealEventId: mealEvent.id,
                    employeeId
                }
            }
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                error: 'Bạn chưa đăng ký bữa ăn này.'
            });
        }

        if (registration.isCancelled) {
            return res.status(400).json({
                success: false,
                error: 'Suất ăn đã bị nhà bếp hủy, không thể thay đổi địa điểm.'
            });
        }

        // Update location
        await prisma.registration.update({
            where: { id: registration.id },
            data: { locationId: locationId || null }
        });

        return res.json({
            success: true,
            data: { message: 'Cập nhật địa điểm thành công' }
        });

    } catch (error) {
        next(error);
    }
};

// GET /api/registrations/calendar/:year/:month
router.get('/calendar/:year/:month', authenticate, getCalendarHandler);

// POST /api/registrations - Toggle registration
router.post('/', authenticate, toggleRegistrationHandler);

// PUT /api/registrations/location - Update location
router.put('/location', authenticate, updateLocationHandler);

// POST /api/registrations/preset
router.post('/preset', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { presetId, year, month, locationId } = req.body as any;
        const employeeId = (req as unknown as AuthRequest).user!.employeeId;

        // Define presets
        const presets: Record<string, { name: string, types: MealType[], days: number[] }> = {
            '0': { name: '', types: [], days: [] },                                   // Hủy tất cả đăng ký
            '1': { name: 'Hành chính – Trưa', types: [MealType.LUNCH], days: [1, 2, 3, 4, 5] },         // HC - Trưa: T2-T6
            '2': { name: 'Hành chính – Trưa+Tối', types: [MealType.LUNCH, MealType.DINNER], days: [1, 2, 3, 4, 5] }, // HC - Trưa+Tối: T2-T6
            '3': { name: 'Full tháng – Trưa', types: [MealType.LUNCH], days: [0, 1, 2, 3, 4, 5, 6] },    // Full - Trưa
            '4': { name: 'Full tháng – Trưa+Tối', types: [MealType.LUNCH, MealType.DINNER], days: [0, 1, 2, 3, 4, 5, 6] } // Full - Trưa+Tối
        };

        const presetInfo = presets[presetId as keyof typeof presets];
        if (!presetInfo) {
            return res.status(400).json({ success: false, error: { message: 'Preset không hợp lệ' } });
        }

        // Fetch preset record once to get its default locationId if not provided in body
        let resolvedLocationId = locationId || null;
        if (!resolvedLocationId && presetInfo.name) {
            const presetRecord = await prisma.registrationPreset.findUnique({
                where: { name: presetInfo.name }
            });
            resolvedLocationId = presetRecord?.locationId || null;
        }

        const daysInMonth = new Date(parseInt(year as string), parseInt(month as string) + 1, 0).getDate();
        const registrationsToCreate: any[] = [];

        // Get cutoff once for performance
        let cutoffValue: string | number = DEFAULT_CUTOFF_HOUR;
        try {
            const currentConfig = await prisma.systemConfig.findUnique({ where: { key: 'CUT_OFF_HOUR' } });
            if (currentConfig && currentConfig.value) {
                cutoffValue = currentConfig.value;
            }
        } catch (e) { }

        for (let day = 1; day <= daysInMonth; day++) {
            // Use 12:00 PM to ensure the date remains the same across all timezone offsets
            const date = new Date(parseInt(year as string), parseInt(month as string), day, 12, 0, 0);
            if (!canModifyWithCutoff(date, cutoffValue)) continue;

            const dayOfWeek = date.getDay();
            if (presetInfo.days.includes(dayOfWeek)) {
                for (const type of presetInfo.types) {
                    registrationsToCreate.push({ date, type });
                }
            }
        }

        const startDate = new Date(parseInt(year as string), parseInt(month as string), 1, 0, 0, 0);
        const endDate = new Date(parseInt(year as string), parseInt(month as string) + 1, 0, 23, 59, 59);

        // Apply bulk (Using transaction for safety)
        await prisma.$transaction(async (tx) => {
            // 1. CLEAR existing registrations for this month
            const existingRegs = await tx.registration.findMany({
                where: {
                    employeeId,
                    mealEvent: {
                        mealDate: { gte: startDate, lte: endDate }
                    }
                }
            });

            for (const reg of existingRegs) {
                const regEvent = await tx.mealEvent.findUnique({ where: { id: reg.mealEventId } });
                if (regEvent && canModifyWithCutoff(regEvent.mealDate, cutoffValue)) {
                    await tx.registration.delete({
                        where: { id: reg.id }
                    });
                }
            }

            // 2. APPLY new registrations
            for (const item of registrationsToCreate) {
                let event = await tx.mealEvent.findUnique({
                    where: { mealDate_mealType: { mealDate: item.date, mealType: item.type } }
                });

                if (!event) {
                    event = await tx.mealEvent.create({
                        data: { mealDate: item.date, mealType: item.type }
                    });
                }

                await tx.registration.upsert({
                    where: { mealEventId_employeeId: { mealEventId: event.id, employeeId } },
                    update: { isCancelled: false, cancelledAt: null, locationId: resolvedLocationId },
                    create: { mealEventId: event.id, employeeId, locationId: resolvedLocationId }
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
