
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { calculateReportStats } from '../utils/reportUtils.js';
import path from 'path';

const router: Router = Router();
// MEAL_PRICE removed, using dynamic history

// GET /api/reports/summary
router.get('/summary', authenticate, authorize('ADMIN_KITCHEN', 'HR', 'ADMIN_SYSTEM'), async (req, res) => {
    console.log('📨 GET /api/reports/summary hit!', req.query);
    try {
        const { startDate, endDate, search, departmentId } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
        }

        const start = startOfDay(parseISO(startDate as string));
        const end = endOfDay(parseISO(endDate as string));
        const searchTerm = search ? (search as string).toLowerCase() : undefined;

        // Fetch employees with their registrations and checkins within the range
        // We filter employees based on search term if provided
        const whereEmployee: any = {};
        if (searchTerm) {
            whereEmployee.OR = [
                { fullName: { contains: searchTerm, mode: 'insensitive' } },
                { employeeCode: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }
        if (departmentId) {
            whereEmployee.departmentId = departmentId as string;
        }

        // We need:
        // 1. All employees (filtered by search)
        // 2. Their registrations in the date range (Active only)
        // 3. Their checkins in the date range

        // Fetch only employees with accounts
        const employees = await prisma.employee.findMany({
            where: {
                ...whereEmployee,
                account: { isNot: null }
            },
            include: {
                department: true,
                registrations: {
                    where: {
                        isCancelled: false,
                        mealEvent: {
                            mealDate: {
                                gte: start,
                                lte: end
                            }
                        }
                    },
                    include: {
                        mealEvent: true
                    }
                },
                checkins: {
                    where: {
                        mealEvent: {
                            mealDate: {
                                gte: start,
                                lte: end
                            }
                        }
                    },
                    include: {
                        mealEvent: true
                    }
                }
            },
            orderBy: { employeeCode: 'asc' }
        });

        // Fetch Price History
        const priceConfigs = await prisma.mealPriceConfig.findMany({
            orderBy: { startDate: 'desc' }
        });

        console.log(`📊 Found ${employees.length} employees and ${priceConfigs.length} price configs`);

        // 1. Calculate Individual Stats
        const reportData = employees.map(emp => {
            return calculateReportStats(emp, emp.checkins, emp.registrations, priceConfigs);
        });

        // 2. Calculate Total Ingredient Cost for Completed Meals
        const completedMeals = await prisma.mealEvent.findMany({
            where: {
                status: 'COMPLETED',
                mealDate: {
                    gte: start,
                    lte: end
                }
            },
            include: {
                ingredients: true
            }
        });

        const totalIngredientCost = completedMeals.reduce((sum, meal) => {
            return sum + meal.ingredients.reduce((mSum, ing) => mSum + ing.totalPrice, 0);
        }, 0);

        // 3. Calculate Totals for Top Cards
        const totalRegistered = reportData.reduce((acc, curr) => acc + curr.meals, 0);
        const totalEaten = reportData.reduce((acc, curr) => acc + curr.eaten, 0);
        const totalSkipped = reportData.reduce((acc, curr) => acc + curr.skipped, 0);
        const totalMealPriceCost = reportData.reduce((acc, curr) => acc + curr.total, 0);
        const totalWasteCost = reportData.reduce((acc, curr) => acc + (curr as any).wasteCost, 0);

        const kpi = {
            totalMeals: totalRegistered,
            totalEaten: totalEaten,
            totalSkipped: totalSkipped,
            totalCost: totalMealPriceCost, // Total money (Price * Registered)
            wasteCost: Math.round(totalWasteCost),
            attendanceRate: totalRegistered > 0 ? Math.round((totalEaten / totalRegistered) * 100) : 0,
            avgPerDay: 0
        };

        // Determine unique days in range roughly
        const uniqueDays = new Set(
            employees.flatMap(e => e.registrations.map(r => r.mealEvent.mealDate.toISOString().split('T')[0]))
        ).size;

        kpi.avgPerDay = uniqueDays > 0 ? Math.round(kpi.totalMeals / uniqueDays) : 0;

        // 4. Calculate Guest Statistics
        const visitorMeals = await prisma.mealEvent.findMany({
            where: {
                mealDate: { gte: start, lte: end }
            },
            include: {
                guests: true,
                checkins: {
                    where: { guestId: { not: null } }
                }
            }
        });

        let totalGuestMeals = 0;
        let totalGuestEaten = 0;
        let totalGuestCost = 0;

        visitorMeals.forEach(meal => {
            const guestCount = meal.guests.length;
            const checkinCount = meal.checkins.length;

            totalGuestMeals += guestCount;
            totalGuestEaten += checkinCount;

            // Find price for this meal date
            const validConfig = priceConfigs.find(cfg => {
                const s = new Date(cfg.startDate);
                s.setHours(0, 0, 0, 0);
                const e = cfg.endDate ? new Date(cfg.endDate) : null;
                if (e) e.setHours(23, 59, 59, 999);
                return s <= meal.mealDate && (!e || e >= meal.mealDate);
            });

            const price = validConfig ? validConfig.price : 0;
            totalGuestCost += guestCount * price;
        });

        const guestSummary = {
            totalMeals: totalGuestMeals,
            totalEaten: totalGuestEaten,
            totalCost: totalGuestCost
        };

        res.json({
            success: true,
            data: {
                summary: kpi,
                guestSummary,
                details: reportData
            }
        });

    } catch (error) {
        console.error('Report summary error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/reports/export
router.get('/export', authenticate, authorize('ADMIN_KITCHEN', 'HR', 'ADMIN_SYSTEM'), async (req, res) => {
    console.log('📨 GET /api/reports/export hit!', req.query);
    try {
        const { startDate, endDate, search, departmentId } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, error: 'startDate and endDate are required' });
        }

        const start = startOfDay(parseISO(startDate as string));
        const end = endOfDay(parseISO(endDate as string));
        const searchTerm = search ? (search as string).toLowerCase() : undefined;

        const whereEmployee: any = {
            account: { isNot: null }
        };
        if (searchTerm) {
            whereEmployee.OR = [
                { fullName: { contains: searchTerm, mode: 'insensitive' } },
                { employeeCode: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }
        if (departmentId) {
            whereEmployee.departmentId = departmentId as string;
        }

        const employees = await prisma.employee.findMany({
            where: whereEmployee,
            include: {
                department: true,
                registrations: {
                    where: {
                        isCancelled: false,
                        mealEvent: {
                            mealDate: { gte: start, lte: end }
                        }
                    },
                    include: { mealEvent: true }
                },
                checkins: {
                    where: {
                        mealEvent: {
                            mealDate: { gte: start, lte: end }
                        }
                    },
                    include: { mealEvent: true }
                }
            },
            orderBy: { employeeCode: 'asc' }
        });

        const priceConfigs = await prisma.mealPriceConfig.findMany({
            orderBy: { startDate: 'desc' }
        });

        const reportData = employees.map(emp => {
            return calculateReportStats(emp, emp.checkins, emp.registrations, priceConfigs);
        });

        // 1. Calculate Guest Statistics if requested
        const includeGuests = req.query.includeGuests === 'true';
        let guestRow: any = null;

        if (includeGuests) {
            const visitorMeals = await prisma.mealEvent.findMany({
                where: { mealDate: { gte: start, lte: end } },
                include: {
                    guests: true,
                    checkins: { where: { guestId: { not: null } } }
                }
            });

            let totalGuestMeals = 0;
            let totalGuestEaten = 0;
            let totalGuestCost = 0;

            visitorMeals.forEach(meal => {
                const guestCount = meal.guests.length;
                const checkinCount = meal.checkins.length;
                totalGuestMeals += guestCount;
                totalGuestEaten += checkinCount;

                const validConfig = priceConfigs.find(cfg => {
                    const s = new Date(cfg.startDate);
                    s.setHours(0, 0, 0, 0);
                    const e = cfg.endDate ? new Date(cfg.endDate) : null;
                    if (e) e.setHours(23, 59, 59, 999);
                    return s <= meal.mealDate && (!e || e >= meal.mealDate);
                });
                const price = validConfig ? validConfig.price : 0;
                totalGuestCost += guestCount * price;
            });

            if (totalGuestMeals > 0) {
                guestRow = {
                    stt: reportData.length + 1,
                    empCode: 'GUEST',
                    name: 'KHÁCH',
                    department: 'Vãng lai',
                    eaten: `${totalGuestEaten}/${totalGuestMeals}`,
                    skipped: Math.max(0, totalGuestMeals - totalGuestEaten),
                    total: totalGuestCost
                };
            }
        }

        // Create Excel Workbook
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.default.Workbook();
        const worksheet = workbook.addWorksheet('Bao Cao Suat An');

        // Headers
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 10 },
            { header: 'Mã NV', key: 'empCode', width: 15 },
            { header: 'Họ và tên', key: 'name', width: 30 },
            { header: 'Phòng ban', key: 'department', width: 25 },
            { header: 'Đã ăn/Đăng ký', key: 'eaten', width: 15 },
            { header: 'Bỏ lỡ', key: 'skipped', width: 15 },
            { header: 'Tổng tiền (VNĐ)', key: 'total', width: 20 },
        ];

        // Style Header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Add Data
        reportData.forEach((item, idx) => {
            worksheet.addRow({
                stt: idx + 1,
                empCode: item.empCode,
                name: item.name,
                department: item.department,
                eaten: `${item.eaten}/${item.meals}`,
                skipped: item.skipped,
                total: item.total
            });
        });

        // Add Guest row if available
        if (guestRow) {
            const r = worksheet.addRow(guestRow);
            r.font = { bold: true };
            r.getCell('name').font = { bold: true, color: { argb: 'FF10B981' } }; // Use a custom color for emphasis?
        }

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        const dStart = (startDate as string).split('-').reverse().join('-');
        const dEnd = (endDate as string).split('-').reverse().join('-');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Bao-cao-suat-an-${dStart}-${dEnd}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Report export error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/reports/costs
router.get('/costs', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { startDate, endDate, search } = req.query;
        const start = startOfDay(parseISO(startDate as string));
        const end = endOfDay(parseISO(endDate as string));

        const meals = await prisma.mealEvent.findMany({
            where: {
                mealDate: { gte: start, lte: end },
                ingredients: { some: {} }
            },
            include: {
                ingredients: true,
                registrations: { where: { isCancelled: false } },
                guests: true,
                checkins: true
            },
            orderBy: { mealDate: 'desc' }
        });

        const totalIngredientCost = meals.reduce((sum, meal) => {
            return sum + meal.ingredients.reduce((mSum, ing) => mSum + ing.totalPrice, 0);
        }, 0);

        const ingredientMap = new Map<string, number>();
        meals.forEach(meal => {
            meal.ingredients.forEach(ing => {
                const current = ingredientMap.get(ing.name) || 0;
                ingredientMap.set(ing.name, current + ing.totalPrice);
            });
        });

        let topIngredient = 'N/A';
        let maxCost = 0;
        ingredientMap.forEach((cost, name) => {
            if (cost > maxCost) {
                maxCost = cost;
                topIngredient = name;
            }
        });

        // Calculate total billable meals:
        // For each meal event: (Active Registrations) + (Guests) + (Checkins without registration)
        const totalBillableMeals = meals.reduce((acc, meal) => {
            const regEmpIds = new Set(meal.registrations.map(r => r.employeeId));
            const guestsCount = meal.guests.length;
            const regCount = meal.registrations.length;

            // Checkins from employees NOT in registration (vãng lai)
            const extraCheckins = meal.checkins.filter(c => c.employeeId && !regEmpIds.has(c.employeeId)).length;

            return acc + regCount + guestsCount + extraCheckins;
        }, 0);

        const kpi = {
            totalCost: totalIngredientCost,
            avgCostPerMeal: totalBillableMeals > 0 ? Math.round(totalIngredientCost / totalBillableMeals) : 0,
            totalMeals: totalBillableMeals,
            topIngredient
        };

        res.json({
            success: true,
            data: {
                data: meals,
                summary: kpi
            }
        });
    } catch (error) {
        console.error('Costs report error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/reports/costs/export
router.get('/costs/export', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startOfDay(parseISO(startDate as string));
        const end = endOfDay(parseISO(endDate as string));

        const meals = await prisma.mealEvent.findMany({
            where: { mealDate: { gte: start, lte: end }, ingredients: { some: {} } },
            include: { ingredients: true },
            orderBy: { mealDate: 'asc' }
        });

        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.default.Workbook();
        const worksheet = workbook.addWorksheet('Chi phi nguyen lieu');

        worksheet.columns = [
            { header: 'Ngày', key: 'date', width: 15 },
            { header: 'Bữa ăn', key: 'type', width: 15 },
            { header: 'Tên nguyên vật liệu', key: 'name', width: 30 },
            { header: 'Số lượng', key: 'quantity', width: 12 },
            { header: 'Đơn vị', key: 'unit', width: 10 },
            { header: 'Đơn giá (VNĐ)', key: 'price', width: 15 },
            { header: 'Thành tiền (VNĐ)', key: 'total', width: 20 },
        ];

        worksheet.getRow(1).font = { bold: true };

        meals.forEach(meal => {
            meal.ingredients.forEach(ing => {
                worksheet.addRow({
                    date: meal.mealDate.toLocaleDateString('vi-VN'),
                    type: meal.mealType === 'LUNCH' ? 'Bữa trưa' : 'Bữa tối',
                    name: ing.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    price: ing.unitPrice,
                    total: ing.totalPrice
                });
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Bao-cao-chi-phi-${startDate}-${endDate}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Costs export error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/reports/reviews
router.get('/reviews', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startOfDay(parseISO(startDate as string));
        const end = endOfDay(parseISO(endDate as string));

        const reviews = await prisma.mealReview.findMany({
            where: {
                createdAt: { gte: start, lte: end }
            },
            include: {
                mealEvent: true,
                employee: { select: { fullName: true, employeeCode: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
            : 0;
        const withImages = reviews.filter(r => r.images && r.images.length > 0).length;
        const anonymousCount = reviews.filter(r => r.isAnonymous).length;

        // Get total employee checkins in period for response rate (excluding guests)
        const totalEmployeeCheckins = await prisma.checkinLog.count({
            where: {
                employeeId: { not: null },
                mealEvent: {
                    mealDate: { gte: start, lte: end }
                }
            }
        });

        const kpi = {
            totalReviews,
            avgRating,
            withImages,
            anonymousCount,
            responseRate: totalEmployeeCheckins > 0 ? Math.round((totalReviews / totalEmployeeCheckins) * 100) : 0
        };

        res.json({
            success: true,
            data: {
                summary: kpi,
                data: reviews
            }
        });
    } catch (error) {
        console.error('Reviews report error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET /api/reports/reviews/export
router.get('/reviews/export', authenticate, authorize('ADMIN_KITCHEN', 'ADMIN_SYSTEM'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startOfDay(parseISO(startDate as string));
        const end = endOfDay(parseISO(endDate as string));

        const reviews = await prisma.mealReview.findMany({
            where: { createdAt: { gte: start, lte: end } },
            include: {
                mealEvent: true,
                employee: { select: { fullName: true, employeeCode: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        const PDFDocument = await import('pdfkit');
        const axios = (await import('axios')).default;
        const doc = new (PDFDocument.default)();

        // Register Fonts to support Vietnamese
        const fontPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Regular.ttf');
        const fontBoldPath = path.join(process.cwd(), 'src/assets/fonts/Roboto-Bold.ttf');

        doc.registerFont('Roboto', fontPath);
        doc.registerFont('Roboto-Bold', fontBoldPath);
        doc.font('Roboto');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Bao-cao-danh-gia-${startDate}-${endDate}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('BÁO CÁO ĐÁNH GIÁ BỮA ĂN', { align: 'center' });
        doc.fontSize(12).text(`Từ ngày: ${startDate} đến ngày: ${endDate}`, { align: 'center' });
        doc.moveDown();

        // Group reviews by meal
        const groups: Record<string, {
            meal: any;
            reviews: any[];
            avgRating: string;
        }> = {};

        reviews.forEach(review => {
            const mealId = review.mealEvent.id;
            if (!groups[mealId]) {
                groups[mealId] = {
                    meal: review.mealEvent,
                    reviews: [],
                    avgRating: '0'
                };
            }
            groups[mealId].reviews.push(review);
        });

        const sortedGroups = Object.values(groups).map(group => ({
            ...group,
            avgRating: (group.reviews.reduce((acc, r) => acc + r.rating, 0) / group.reviews.length).toFixed(1)
        })).sort((a, b) => new Date(b.meal.mealDate).getTime() - new Date(a.meal.mealDate).getTime());

        for (const group of sortedGroups) {
            // Meal Group Header
            doc.rect(50, doc.y, 500, 25).fill('#f1f5f9').stroke('#e2e8f0');
            doc.fillColor('#0f172a').font('Roboto-Bold').fontSize(12)
                .text(`${group.meal.mealDate.toLocaleDateString('vi-VN')} - Bữa: ${group.meal.mealType === 'LUNCH' ? 'Trưa' : 'Tối'} (${group.avgRating}/5 sao)`, 60, doc.y - 18);
            doc.moveDown(0.5);

            for (const review of group.reviews) {
                // Check if we need a new page
                if (doc.y > 700) doc.addPage();

                doc.fontSize(10).font('Roboto-Bold').fillColor('#334155').text(`Người gửi: ${review.isAnonymous ? 'Ẩn danh' : review.employee.fullName} - Đánh giá: ${review.rating}/5 sao`);
                doc.font('Roboto').fillColor('#475569').text(`Nhận xét: ${review.comment}`);

                if (review.adminReply) {
                    doc.moveDown(0.2);
                    doc.font('Roboto-Bold').fillColor('#059669').text(`Phản hồi từ Bếp: `, { continued: true })
                        .font('Roboto').fillColor('#065f46').text(review.adminReply);
                }

                if (review.images && Array.isArray(review.images) && review.images.length > 0) {
                    doc.moveDown(0.5);
                    for (const imgUrl of review.images) {
                        try {
                            const response = await axios.get(imgUrl as string, { responseType: 'arraybuffer' });
                            const imgWidth = 150;
                            // Check for page overflow before adding image
                            if (doc.y + imgWidth > 750) doc.addPage();
                            doc.image(Buffer.from(response.data), { fit: [imgWidth, imgWidth] });
                            doc.moveDown();
                        } catch (e) {
                            doc.fillColor('red').text(`[Không thể tải ảnh: ${imgUrl}]`).fillColor('black');
                        }
                    }
                }
                doc.moveDown();
                doc.moveTo(70, doc.y).lineTo(530, doc.y).strokeColor('#f1f5f9').stroke().moveDown(0.5);
            }
            doc.moveDown();
        }

        doc.end();
    } catch (error) {
        console.error('Reviews export error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
