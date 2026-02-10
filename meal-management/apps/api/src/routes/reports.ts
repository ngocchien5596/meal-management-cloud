
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { calculateReportStats } from '../utils/reportUtils.js';

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
        const kpi = {
            totalMeals: reportData.reduce((acc, curr) => acc + (curr.eaten + curr.skipped), 0),
            totalSkipped: reportData.reduce((acc, curr) => acc + curr.skipped, 0),
            totalCost: totalIngredientCost,
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

export default router;
