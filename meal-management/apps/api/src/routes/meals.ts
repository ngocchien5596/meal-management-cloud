import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/meals - List all meal events with optional date filtering
router.get('/', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where: any = {};

        // Date filtering logic
        if (startDate) {
            // Adjust start date by +12h to handle timezone boundaries (e.g. GMT+7 Midnight is 17:00 UTC Prev Day)
            // This ensures we land on the correct UTC 'Day' for the @db.Date column comparison
            const adjustedStart = new Date(new Date(startDate as string).getTime() + 12 * 60 * 60 * 1000);
            where.mealDate = { ...where.mealDate, gte: adjustedStart };
        }

        if (endDate) {
            where.mealDate = { ...where.mealDate, lte: new Date(endDate as string) };
        } else {
            // Default: Show history + Up to Tomorrow (Hide future beyond tomorrow)
            // "Chỉ hiển thị các bữa trong quá khứ và của ngày mai"
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);

            where.mealDate = { ...where.mealDate, lte: tomorrow };
        }

        const meals = await prisma.mealEvent.findMany({
            where,
            include: {
                _count: {
                    select: {
                        registrations: { where: { isCancelled: false } },
                        guests: true
                    }
                },
                menuItems: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { mealDate: 'desc' }
        });

        res.json({ success: true, data: meals });
    } catch (error) {
        console.error('Fetch meals error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/meals - Create a new meal event
router.post('/', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { mealDate, mealType } = req.body;

        if (!mealDate || !mealType) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const date = new Date(mealDate);

        // Check for existing meal
        const existing = await prisma.mealEvent.findFirst({
            where: {
                mealDate: date,
                mealType
            }
        });

        if (existing) {
            // Meal already exists (likely created by registration)
            // Just return it so the user can proceed to manage it
            return res.json({ success: true, data: existing });
        }

        const meal = await prisma.mealEvent.create({
            data: {
                mealDate: date,
                mealType,
                status: 'DRAFT'
            }
        });

        res.json({ success: true, data: meal });
    } catch (error) {
        console.error('Create meal error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/meals/registrations/:id/toggle - Admin toggle registration cancellation
router.post('/registrations/:id/toggle', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await prisma.registration.findUnique({
            where: { id },
            include: { mealEvent: true }
        });

        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        // Only allow modification if meal is IN_PROGRESS (as per FR-MEAL-004 Checkbox logic) or DRAFT
        // Actually FR says: "Trạng thái Đang diễn ra: Cho tích checkbox 'Hủy đăng ký'"
        // So we might restrict it, but for flexibility let's allow it if not COMPLETED
        if (registration.mealEvent.status === 'COMPLETED') {
            return res.status(400).json({ success: false, error: 'Cannot modify completed meal' });
        }

        const updated = await prisma.registration.update({
            where: { id },
            data: {
                isCancelled: !registration.isCancelled,
                cancelledAt: !registration.isCancelled ? new Date() : null
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Toggle registration error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/meals/current - Get current active meal for display board
router.get('/current', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // First, look for an IN_PROGRESS meal
        let meal = await prisma.mealEvent.findFirst({
            where: {
                status: 'IN_PROGRESS',
                mealDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                ingredients: true,
                menuItems: true,
                guests: true,
                _count: { select: { reviews: true } },
                reviews: {
                    include: {
                        employee: { select: { fullName: true, employeeCode: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                checkins: {
                    include: {
                        employee: { select: { fullName: true, employeeCode: true } },
                        guest: { select: { fullName: true } }
                    },
                    orderBy: { checkinTime: 'desc' }
                },
                registrations: {
                    include: {
                        employee: {
                            include: { department: true, position: true }
                        }
                    },
                    orderBy: { employee: { employeeCode: 'asc' } }
                }
            }
        });

        // If no active meal, look for ANY meal today (latest one)
        if (!meal) {
            meal = await prisma.mealEvent.findFirst({
                where: {
                    mealDate: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                include: {
                    ingredients: true,
                    menuItems: true,
                    guests: true,
                    _count: { select: { reviews: true } },
                    reviews: {
                        include: {
                            employee: { select: { fullName: true, employeeCode: true } }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    checkins: {
                        include: {
                            employee: { select: { fullName: true, employeeCode: true } },
                            guest: { select: { fullName: true } }
                        },
                        orderBy: { checkinTime: 'desc' }
                    },
                    registrations: {
                        include: {
                            employee: {
                                include: { department: true, position: true }
                            }
                        },
                        orderBy: { employee: { employeeCode: 'asc' } }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (!meal) {
            return res.json({ success: true, data: null });
        }

        res.json({ success: true, data: meal });
    } catch (error) {
        console.error('Fetch current meal error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/meals/:id - Get detailed meal event information
router.get('/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] GET /api/meals/${id} requested`);

        const meal = await prisma.mealEvent.findUnique({
            where: { id },
            include: {
                ingredients: true,
                menuItems: true,
                guests: true,
                _count: {
                    select: {
                        reviews: true
                    }
                },
                reviews: {
                    include: {
                        employee: {
                            select: {
                                fullName: true,
                                employeeCode: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                checkins: {
                    include: {
                        employee: {
                            select: {
                                fullName: true,
                                employeeCode: true
                            }
                        },
                        guest: {
                            select: {
                                fullName: true
                            }
                        }
                    },
                    orderBy: {
                        checkinTime: 'desc'
                    }
                },
                registrations: {
                    // Fetch all registrations so we can manage cancellations in IN_PROGRESS mode
                    include: {
                        employee: {
                            include: {
                                department: true,
                                position: true
                            }
                        }
                    },
                    orderBy: {
                        employee: {
                            employeeCode: 'asc'
                        }
                    }
                }
            }
        });

        if (!meal) {
            return res.status(404).json({ success: false, error: 'Meal not found' });
        }

        res.json({ success: true, data: meal });
    } catch (error) {
        console.error('Fetch meal detail error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// PATCH /api/meals/:id - Update meal event details
// PATCH /api/meals/:id - Update meal event details
router.patch('/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { mealDate, mealType } = req.body;

        // 1. Get current meal to merge missing fields
        const currentMeal = await prisma.mealEvent.findUnique({
            where: { id },
            select: { mealDate: true, mealType: true }
        });

        if (!currentMeal) {
            return res.status(404).json({ success: false, error: 'Meal not found' });
        }

        const targetDate = mealDate ? new Date(mealDate) : currentMeal.mealDate;
        const targetType = mealType || currentMeal.mealType;

        // 2. Check for duplicates (excluding current ID) using Day Range
        // We want to ensure no other meal of the same type exists on the SAME DAY
        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const duplicate = await prisma.mealEvent.findFirst({
            where: {
                id: { not: id },
                mealType: targetType,
                mealDate: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        if (duplicate) {
            return res.status(400).json({
                success: false,
                error: 'Bữa ăn này đã tồn tại trong hệ thống (trùng ngày và loại bữa).'
            });
        }

        const updateData: any = {};
        if (mealDate) updateData.mealDate = new Date(mealDate); // Keep strict input for update
        if (mealType) updateData.mealType = mealType;

        const meal = await prisma.mealEvent.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, data: meal });
    } catch (error: any) {
        console.error('Update meal error:', error);

        // Handle Prisma Unique Constraint Violation specifically
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                error: 'Bữa ăn này đã tồn tại trong hệ thống.'
            });
        }

        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/meals/:id/start - Start the meal (Status -> IN_PROGRESS)
router.post('/:id/start', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const meal = await prisma.mealEvent.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                qrToken: `MEAL-${id}-${Date.now()}`,
                qrGeneratedAt: new Date()
            }
        });
        res.json({ success: true, data: meal });
    } catch (error) {
        console.error('Start meal error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST /api/meals/:id/end - End the meal (Status -> COMPLETED)
router.post('/:id/end', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const meal = await prisma.mealEvent.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                endedAt: new Date()
            }
        });
        res.json({ success: true, data: meal });
    } catch (error) {
        console.error('End meal error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// --- Ingredients Management ---

router.post('/:id/ingredients', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, unit, unitPrice } = req.body;
        const ingredient = await prisma.ingredient.create({
            data: {
                mealEventId: id,
                name,
                quantity: parseFloat(quantity),
                unit,
                unitPrice: parseFloat(unitPrice),
                totalPrice: parseFloat(quantity) * parseFloat(unitPrice)
            }
        });
        res.json({ success: true, data: ingredient });
    } catch (error) {
        console.error('Create ingredient error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.patch('/ingredients/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, unit, unitPrice } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
        if (unit) updateData.unit = unit;
        if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);

        // Re-calculate total price if needed
        if (quantity !== undefined || unitPrice !== undefined) {
            const current = await prisma.ingredient.findUnique({ where: { id } });
            if (current) {
                const q = quantity !== undefined ? parseFloat(quantity) : current.quantity;
                const p = unitPrice !== undefined ? parseFloat(unitPrice) : current.unitPrice;
                updateData.totalPrice = q * p;
            }
        }

        const ingredient = await prisma.ingredient.update({
            where: { id },
            data: updateData
        });
        res.json({ success: true, data: ingredient });
    } catch (error) {
        console.error('Update ingredient error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/ingredients/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.ingredient.delete({ where: { id } });
        res.json({ success: true, message: 'Ingredient deleted' });
    } catch (error) {
        console.error('Delete ingredient error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// --- Menu Items Management ---

router.post('/:id/menu-items', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const menuItem = await prisma.menuItem.create({
            data: { mealEventId: id, name }
        });
        res.json({ success: true, data: menuItem });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/menu-items/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.menuItem.delete({ where: { id } });
        res.json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// --- Guests Management ---

router.post('/:id/guests', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, note } = req.body;
        const guest = await prisma.guest.create({
            data: {
                mealEventId: id,
                fullName,
                note,
                qrToken: `GUEST-${id}-${Date.now()}` // Basic generator, can be improved
            }
        });
        res.json({ success: true, data: guest });
    } catch (error) {
        console.error('Create guest error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.patch('/guests/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, note } = req.body;

        const updateData: any = {};
        if (fullName) updateData.fullName = fullName;
        if (note !== undefined) updateData.note = note;

        const guest = await prisma.guest.update({
            where: { id },
            data: updateData
        });
        res.json({ success: true, data: guest });
    } catch (error) {
        console.error('Update guest error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/guests/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.guest.delete({ where: { id } });
        res.json({ success: true, message: 'Guest deleted' });
    } catch (error) {
        console.error('Delete guest error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
