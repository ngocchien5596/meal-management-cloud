
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { calculateReportStats } from '../utils/reportUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        res.json({
            success: true,
            data: {
                summary: kpi,
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
            { header: 'Đã ăn', key: 'eaten', width: 15 },
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
                eaten: item.eaten,
                skipped: item.skipped,
                total: item.total
            });
        });

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
        const fontPath = path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf');
        const fontBoldPath = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');

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

        for (const review of reviews) {
            // Draw a horizontal line
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown();

            doc.fontSize(12).font('Roboto-Bold').text(`Ngày: ${review.mealEvent.mealDate.toLocaleDateString('vi-VN')} - Bữa: ${review.mealEvent.mealType === 'LUNCH' ? 'Trưa' : 'Tối'}`);
            doc.fontSize(10).font('Roboto').text(`Người gửi: ${review.isAnonymous ? 'Ẩn danh' : review.employee.fullName}`);
            doc.text(`Nội dung: ${review.comment}`);
            doc.moveDown(0.5);

            if (review.images && Array.isArray(review.images) && review.images.length > 0) {
                for (const imgUrl of review.images) {
                    try {
                        const response = await axios.get(imgUrl as string, { responseType: 'arraybuffer' });
                        doc.image(Buffer.from(response.data), { fit: [200, 200] });
                        doc.moveDown();
                    } catch (e) {
                        doc.fillColor('red').text(`[Không thể tải ảnh: ${imgUrl}]`).fillColor('black');
                    }
                }
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
