import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/meals - List all meal events with optional date filtering
router.get('/', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { startDate, endDate, search, status } = req.query;

        const where: any = {};

        // Status filter
        if (status && status !== 'ALL') {
            where.status = status;
        }

        // Search filter (by Menu Item name)
        if (search) {
            where.menuItems = {
                some: {
                    catalog: {
                        name: { contains: search as string, mode: 'insensitive' }
                    }
                }
            };
        }

        // Date filtering logic
        if (startDate) {
            // Adjust start date by +12h to handle timezone boundaries (e.g. GMT+7 Midnight is 17:00 UTC Prev Day)
            // This ensures we land on the correct UTC 'Day' for the @db.Date column comparison
            const adjustedStart = new Date(new Date(startDate as string).getTime() + 12 * 60 * 60 * 1000);
            where.mealDate = { ...where.mealDate, gte: adjustedStart };
        }

        if (endDate) {
            where.mealDate = { ...where.mealDate, lte: new Date(endDate as string) };
        }

        // Apply default range if no filters are present
        if (!startDate && !endDate && !search) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const plusTwoDays = new Date(today);
            plusTwoDays.setDate(today.getDate() + 2);
            plusTwoDays.setHours(23, 59, 59, 999);

            where.mealDate = {
                gte: yesterday,
                lte: plusTwoDays
            };
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
                        catalog: { select: { name: true } }
                    }
                }
            },
            orderBy: [
                { mealDate: 'asc' },
                { mealType: 'desc' } // LUNCH (12) comes after DINNER (4) alphabetically, so 'desc' puts LUNCH first
            ]
        });

        // Debug log to verify sort order in server logs
        if (meals.length > 0) {
            console.log(`[DEBUG] First meal: ${meals[0].mealDate.toISOString().split('T')[0]} ${meals[0].mealType}`);
            console.log(`[DEBUG] Last meal: ${meals[meals.length - 1].mealDate.toISOString().split('T')[0]} ${meals[meals.length - 1].mealType}`);
        }

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

// GET /api/v1/meals/active - Get current active meal for display board
router.get('/active', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
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
                        guest: { select: { fullName: true } },
                        registration: { include: { location: true } }
                    },
                    orderBy: { checkinTime: 'desc' }
                },
                registrations: {
                    include: {
                        location: true,
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
                            guest: { select: { fullName: true } },
                            registration: { include: { location: true } }
                        },
                        orderBy: { checkinTime: 'desc' }
                    },
                    registrations: {
                        include: {
                            location: true,
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
                ingredients: { include: { catalog: true } },
                menuItems: { include: { catalog: true } },
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
                        },
                        registration: { include: { location: true } }
                    },
                    orderBy: {
                        checkinTime: 'desc'
                    }
                },
                registrations: {
                    // Fetch all registrations so we can manage cancellations in IN_PROGRESS mode
                    include: {
                        location: true,
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

// PATCH /api/v1/meals/:id - Update meal event details
router.patch('/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { mealDate, mealType, status } = req.body;

        // 1. Get current meal to merge missing fields
        const currentMeal = await prisma.mealEvent.findUnique({
            where: { id },
            select: { mealDate: true, mealType: true, status: true }
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
        if (status && status !== currentMeal.status) {
            updateData.status = status;
            if (status === 'IN_PROGRESS') {
                updateData.startedAt = new Date();
                updateData.qrToken = `MEAL-${id}`;
                updateData.qrGeneratedAt = new Date();
            } else if (status === 'COMPLETED') {
                updateData.endedAt = new Date();
            }
        }

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

// --- Ingredients Management ---

router.post('/:id/ingredients', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, unit, unitPrice, catalogId } = req.body;

        let finalCatalogId = catalogId;

        // "Quick Add" logic or auto-linking
        if (!finalCatalogId && name) {
            const catalogItem = await prisma.ingredientCatalog.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                    defaultUnit: unit
                }
            });
            finalCatalogId = catalogItem.id;
        }

        const q = parseFloat(quantity) || 0;
        const p = parseFloat(unitPrice) || 0;

        const ingredient = await prisma.ingredient.create({
            data: {
                mealEventId: id,
                catalogId: finalCatalogId,
                quantity: q,
                unit,
                unitPrice: p,
                totalPrice: q * p
            },
            include: { catalog: true }
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
        const { name, quantity, unit, unitPrice, catalogId } = req.body;

        const updateData: any = {};
        if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
        if (unit) updateData.unit = unit;
        if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);
        if (catalogId) updateData.catalogId = catalogId;

        // Re-calculate total price if needed
        if (quantity !== undefined || unitPrice !== undefined) {
            const current = await prisma.ingredient.findUnique({ where: { id } });
            if (current) {
                const q = quantity !== undefined ? (parseFloat(quantity) || 0) : current.quantity;
                const p = unitPrice !== undefined ? (parseFloat(unitPrice) || 0) : current.unitPrice;
                updateData.totalPrice = q * p;

                // Update numeric fields in updateData as well to ensure they are parsed numbers
                if (quantity !== undefined) updateData.quantity = q;
                if (unitPrice !== undefined) updateData.unitPrice = p;
            }
        }

        const ingredient = await prisma.ingredient.update({
            where: { id },
            data: updateData,
            include: { catalog: true }
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
        const { name, catalogId } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Tên món ăn không được để trống' });
        }

        const trimmedName = name.trim();
        let finalCatalogId = catalogId;

        // Quick Add or Auto-link
        if (!finalCatalogId) {
            const catalogItem = await prisma.menuItemCatalog.upsert({
                where: { name: trimmedName },
                update: {},
                create: { name: trimmedName }
            });
            finalCatalogId = catalogItem.id;
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                mealEventId: id,
                catalogId: finalCatalogId
            },
            include: { catalog: true }
        });
        res.json({ success: true, data: menuItem });
    } catch (error: any) {
        console.error('Create menu item error:', error);
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi hệ thống khi tạo món ăn'
        });
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

router.patch('/menu-items/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, catalogId } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, error: 'Tên món ăn không được để trống' });
        }

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                catalogId
            },
            include: { catalog: true }
        });

        res.json({ success: true, data: menuItem });
    } catch (error: any) {
        console.error('Update menu item error:', error);
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi hệ thống khi cập nhật món ăn'
        });
    }
});

// --- Guests Management ---

router.post('/:id/guests', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, note, directoryId } = req.body;

        if (!fullName || fullName.trim() === '') {
            return res.status(400).json({ success: false, error: 'Tên khách mời không được để trống' });
        }

        const trimmedName = fullName.trim();
        let finalDirectoryId = directoryId;

        // Quick Add or Auto-link
        if (!finalDirectoryId) {
            const guestDir = await prisma.guestDirectory.findFirst({
                where: { fullName: trimmedName }
            });

            if (guestDir) {
                finalDirectoryId = guestDir.id;
            } else {
                const newDir = await prisma.guestDirectory.create({
                    data: {
                        fullName: trimmedName,
                        note: note || ''
                    }
                });
                finalDirectoryId = newDir.id;
            }
        }

        const guest = await prisma.guest.create({
            data: {
                mealEventId: id,
                fullName: trimmedName,
                note,
                directoryId: finalDirectoryId,
                qrToken: `GUEST-${id}-${Date.now()}` // Basic generator, can be improved
            },
            include: { directory: true }
        });
        res.json({ success: true, data: guest });
    } catch (error: any) {
        console.error('Create guest error:', error);
        res.status(500).json({
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Lỗi hệ thống khi tạo khách mời'
        });
    }
});

router.patch('/guests/:id', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, note, directoryId } = req.body;

        const updateData: any = {};
        if (fullName) updateData.fullName = fullName.trim();
        if (note !== undefined) updateData.note = note;
        if (directoryId !== undefined) updateData.directoryId = directoryId;

        const guest = await prisma.guest.update({
            where: { id },
            data: updateData,
            include: { directory: true }
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
