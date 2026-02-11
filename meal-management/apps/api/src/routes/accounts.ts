import { Router } from 'express';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import { upload } from '../middleware/upload.js';
import prisma from '../lib/prisma.js';

const router: Router = Router();

// GET /api/accounts/template - Download Excel Template
router.get('/template', authenticate, authorize('ADMIN_SYSTEM', 'HR'), async (req, res, next) => {
    try {
        const departments = await prisma.department.findMany({ select: { name: true } });
        const positions = await prisma.position.findMany({ select: { name: true } });

        const workbook = new ExcelJS.Workbook();

        // 1. Template Sheet (Make it first so it's visible)
        const sheet = workbook.addWorksheet('Import Template');

        // 2. Data Sheet (Hidden) for Dropdowns
        const dataSheet = workbook.addWorksheet('Data');
        dataSheet.state = 'hidden';

        // Fill Departments (Col A)
        departments.forEach((d, i) => {
            dataSheet.getCell(`A${i + 1}`).value = d.name;
        });
        // Fill Positions (Col B)
        positions.forEach((p, i) => {
            dataSheet.getCell(`B${i + 1}`).value = p.name;
        });

        // Fill Roles (Col C) - defined in enum or static list
        const roles = ['EMPLOYEE', 'ADMIN_SYSTEM', 'ADMIN_KITCHEN', 'HR'];
        roles.forEach((r, i) => {
            dataSheet.getCell(`C${i + 1}`).value = r;
        });

        const deptCount = departments.length || 1;
        const posCount = positions.length || 1;
        const roleCount = roles.length;

        // Headers
        sheet.columns = [
            { header: 'Mã nhân viên (*)', key: 'code', width: 15 },
            { header: 'Họ và tên (*)', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Phòng ban (*)', key: 'department', width: 20 },
            { header: 'Chức vụ (*)', key: 'position', width: 20 },
            { header: 'Vai trò (ADMIN/EMPLOYEE)', key: 'role', width: 25 },
        ];

        // Style Header
        sheet.getRow(1).font = { bold: true };

        // Add Data Validation for Department (Col D -> 4)
        const deptColLetter = 'D';
        // Add Data Validation for Position (Col E -> 5)
        const posColLetter = 'E';
        // Add Data Validation for Role (Col F -> 6)
        const roleColLetter = 'F';

        for (let i = 2; i <= 100; i++) { // Apply to first 100 rows
            // Department
            sheet.getCell(`${deptColLetter}${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`=Data!$A$1:$A$${deptCount}`]
            };

            // Position
            sheet.getCell(`${posColLetter}${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`=Data!$B$1:$B$${posCount}`]
            };

            // Role
            sheet.getCell(`${roleColLetter}${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: [`=Data!$C$1:$C$${roleCount}`]
            };
        }

        // (Removed sample row to keep template clean)

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_accounts.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        next(error);
    }
});

// POST /api/accounts/import - Import from Excel
router.post('/import', authenticate, authorize('ADMIN_SYSTEM', 'HR'), upload.single('file'), async (req: any, res: any, next: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'Vui lòng tải lên file Excel' } });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.getWorksheet(1); // First sheet

        if (!worksheet) {
            return res.status(400).json({ success: false, error: { message: 'File Excel không hợp lệ hoặc rỗng' } });
        }

        const results = {
            total: 0,
            created: 0,
            updated: 0,
            failed: 0,
            errors: [] as { row: number, code?: string, name?: string, message: string }[],
            importedItems: [] as { code: string, name: string, status: 'CREATED' | 'UPDATED' }[],
        };

        // Skip header row (1), start from 2
        // Columns: A=EmployeeCode, B=FullName, C=Email, D=Department, E=Position, F=Role
        const rows: any[] = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const employeeCode = row.getCell(1).text?.toString().trim();
            const fullName = row.getCell(2).text?.toString().trim();
            const email = row.getCell(3).text?.toString().trim();
            const departmentName = row.getCell(4).text?.toString().trim();
            const positionName = row.getCell(5).text?.toString().trim();
            const roleStr = row.getCell(6).text?.toString().trim().toUpperCase();

            // Check if row is completely empty
            const isEmpty = !employeeCode && !fullName && !email && !departmentName && !positionName;
            if (isEmpty) return;

            results.total++;

            if (employeeCode && fullName && departmentName && positionName) {
                rows.push({
                    rowNumber,
                    employeeCode,
                    fullName,
                    email,
                    departmentName,
                    positionName,
                    roleStr
                });
            } else {
                results.failed++;
                results.errors.push({
                    row: rowNumber,
                    code: employeeCode,
                    name: fullName,
                    message: 'Thiếu thông tin bắt buộc (Mã NV, Tên, Phòng, Chức vụ)'
                });
            }
        });

        for (const row of rows) {
            try {
                let status: 'CREATED' | 'UPDATED' = 'CREATED';

                await prisma.$transaction(async (tx) => {
                    // 1. Get or Create Department
                    let dept = await tx.department.findUnique({ where: { name: row.departmentName } });
                    if (!dept) {
                        dept = await tx.department.create({ data: { name: row.departmentName } });
                    }

                    // 2. Get or Create Position
                    let pos = await tx.position.findUnique({ where: { name: row.positionName } });
                    if (!pos) {
                        pos = await tx.position.create({ data: { name: row.positionName } });
                    }

                    // 3. Upsert Employee
                    let employee = await tx.employee.findUnique({ where: { employeeCode: row.employeeCode } });
                    if (!employee) {
                        status = 'CREATED';
                        employee = await tx.employee.create({
                            data: {
                                employeeCode: row.employeeCode,
                                fullName: row.fullName,
                                email: row.email || null,
                                departmentId: dept.id,
                                positionId: pos.id,
                            }
                        });
                    } else {
                        status = 'UPDATED';
                        employee = await tx.employee.update({
                            where: { id: employee.id },
                            data: {
                                fullName: row.fullName,
                                departmentId: dept.id,
                                positionId: pos.id,
                            }
                        });
                    }

                    // 4. Upsert Account
                    let mappedRole = row.roleStr;
                    if (mappedRole === 'ADMIN') mappedRole = Role.ADMIN_SYSTEM;
                    const role = (Object.values(Role) as string[]).includes(mappedRole) ? mappedRole as Role : Role.EMPLOYEE;

                    const existingAccount = await tx.account.findUnique({ where: { employeeId: employee.id } });
                    if (!existingAccount) {
                        const passwordHash = await bcrypt.hash(row.employeeCode, 10);
                        const secretCode = Math.floor(100000 + Math.random() * 900000).toString();
                        await tx.account.create({
                            data: {
                                employeeId: employee.id,
                                passwordHash,
                                role,
                                secretCode,
                                isActive: true
                            }
                        });
                    } else {
                        await tx.account.update({
                            where: { id: existingAccount.id },
                            data: { role }
                        });
                    }
                });

                if (status === 'CREATED') results.created++;
                else results.updated++;

                results.importedItems.push({
                    code: row.employeeCode,
                    name: row.fullName,
                    status
                });

            } catch (err: any) {
                results.failed++;
                results.errors.push({
                    row: row.rowNumber,
                    code: row.employeeCode,
                    name: row.fullName,
                    message: err.message
                });
            }
        }

        const message = `Hoàn tất: Tạo mới ${results.created}, Cập nhật ${results.updated}, Thất bại ${results.failed}.`;

        res.json({
            success: (results.created + results.updated) > 0,
            data: results,
            message
        });

    } catch (error) {
        next(error);
    }
});


// Schemas
const createAccountSchema = z.object({
    employeeCode: z.string().min(1, 'Mã nhân viên là bắt buộc'),
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    departmentId: z.string().min(1, 'Phòng ban là bắt buộc'),
    positionId: z.string().min(1, 'Chức vụ là bắt buộc'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
    role: z.nativeEnum(Role).optional().default(Role.EMPLOYEE),
});

// GET /api/accounts - List all accounts
router.get('/', authenticate, authorize('ADMIN_SYSTEM', 'HR'), async (req, res, next) => {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                account: true,
                department: true,
                position: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const data = employees.map(emp => ({
            id: emp.id,
            employeeCode: emp.employeeCode,
            fullName: emp.fullName,
            email: emp.email,
            department: emp.department.name,
            position: emp.position.name,
            role: emp.account?.role || null,
            isActive: emp.account?.isActive ?? false, // Check account active status
            createdAt: emp.createdAt,
            hasAccount: !!emp.account,
        }));

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/accounts/:id - Get single account detail
router.get('/:id', authenticate, authorize('ADMIN_SYSTEM', 'HR'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                account: true,
                department: true,
                position: true,
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: { message: 'Không tìm thấy nhân viên', code: 'NOT_FOUND' },
            });
        }

        const data = {
            id: employee.id,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
            email: employee.email,
            department: employee.department.name,
            position: employee.position.name,
            departmentId: employee.departmentId,
            positionId: employee.positionId,
            role: employee.account?.role || null,
            isActive: employee.account?.isActive ?? false,
            createdAt: employee.createdAt,
            hasAccount: !!employee.account,
        };

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/accounts - Create new account
router.post('/', authenticate, authorize('ADMIN_SYSTEM', 'HR'), async (req: AuthRequest, res, next) => {
    try {
        const validation = createAccountSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: { message: validation.error.errors[0].message, code: 'VALIDATION_ERROR' },
            });
        }

        const { employeeCode, fullName, email, departmentId, positionId, password, role } = validation.data;

        // Check duplicate
        const existing = await prisma.employee.findUnique({
            where: { employeeCode },
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: { message: 'Mã nhân viên đã tồn tại', code: 'DUPLICATE_CODE' },
            });
        }

        // Validate Dept & Pos existence
        const dept = await prisma.department.findUnique({ where: { id: departmentId } });
        if (!dept) return res.status(400).json({ success: false, error: { message: 'Phòng ban không tồn tại' } });

        const pos = await prisma.position.findUnique({ where: { id: positionId } });
        if (!pos) return res.status(400).json({ success: false, error: { message: 'Chức vụ không tồn tại' } });

        // Default password if not provided
        const finalPassword = password || '123456';
        const passwordHash = await bcrypt.hash(finalPassword, 10);
        const secretCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            const newEmployee = await tx.employee.create({
                data: {
                    employeeCode,
                    fullName,
                    email: email || null,
                    departmentId,
                    positionId,
                },
            });

            const newAccount = await tx.account.create({
                data: {
                    employeeId: newEmployee.id,
                    passwordHash,
                    role,
                    secretCode,
                    isActive: true,
                },
            });

            return { ...newEmployee, account: newAccount };
        });

        res.json({
            success: true,
            data: result,
            message: 'Tạo tài khoản thành công',
        });

    } catch (error) {
        next(error);
    }
});

// PUT /api/accounts/:id - Update account
const updateAccountSchema = createAccountSchema.partial().extend({
    isActive: z.boolean().optional(),
});

router.put('/:id', authenticate, authorize('ADMIN_SYSTEM', 'HR'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const validation = updateAccountSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: { message: validation.error.errors[0].message, code: 'VALIDATION_ERROR' },
            });
        }

        const data = validation.data;

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: { account: true },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: { message: 'Nhân viên không tồn tại', code: 'NOT_FOUND' },
            });
        }

        // Check duplicate code if changed
        if (data.employeeCode && data.employeeCode !== employee.employeeCode) {
            const existing = await prisma.employee.findUnique({
                where: { employeeCode: data.employeeCode },
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Mã nhân viên đã tồn tại', code: 'DUPLICATE_CODE' },
                });
            }
        }

        // Transaction to update both tables
        const result = await prisma.$transaction(async (tx) => {
            // Update Employee
            const updatedEmployee = await tx.employee.update({
                where: { id },
                data: {
                    employeeCode: data.employeeCode,
                    fullName: data.fullName,
                    email: data.email,
                    departmentId: data.departmentId,
                    positionId: data.positionId,
                },
            });

            // Prepare Account update data
            const accountUpdateData: any = {};
            if (data.role) accountUpdateData.role = data.role;
            if (data.isActive !== undefined) accountUpdateData.isActive = data.isActive;
            if (data.password) {
                accountUpdateData.passwordHash = await bcrypt.hash(data.password, 10);
            }

            // Update or Create Account
            let updatedAccount;
            if (employee.account) {
                updatedAccount = await tx.account.update({
                    where: { employeeId: id },
                    data: accountUpdateData,
                });
            } else if (Object.keys(accountUpdateData).length > 0) {
                // Create account if not exists but we try to set role/password (edge case)
                updatedAccount = await tx.account.create({
                    data: {
                        employeeId: id,
                        passwordHash: accountUpdateData.passwordHash || await bcrypt.hash('123456', 10),
                        role: accountUpdateData.role || Role.EMPLOYEE,
                        secretCode: Math.floor(100000 + Math.random() * 900000).toString(),
                        isActive: accountUpdateData.isActive ?? true,
                    }
                });
            }

            return { ...updatedEmployee, account: updatedAccount };
        });

        res.json({
            success: true,
            data: result,
            message: 'Cập nhật thành công',
        });

    } catch (error) {
        next(error);
    }
});

// DELETE /api/accounts/:id - Delete account
router.delete('/:id', authenticate, authorize('ADMIN_SYSTEM', 'HR'), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: { account: true },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: { message: 'Nhân viên không tồn tại', code: 'NOT_FOUND' },
            });
        }

        // Transaction to delete both tables
        await prisma.$transaction(async (tx) => {
            // Delete account first (if exists) due to FK
            if (employee.account) {
                await tx.account.delete({
                    where: { employeeId: id },
                });
            }

            // Delete employee
            await tx.employee.delete({
                where: { id },
            });
        });

        res.json({
            success: true,
            message: 'Xóa tài khoản thành công',
        });

    } catch (error) {
        next(error);
    }
});

export default router;
