import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create departments
    const departments = await Promise.all([
        prisma.department.upsert({
            where: { name: 'Ban Giám đốc' },
            update: {},
            create: { name: 'Ban Giám đốc' },
        }),
        prisma.department.upsert({
            where: { name: 'Phòng Nhân sự' },
            update: {},
            create: { name: 'Phòng Nhân sự' },
        }),
        prisma.department.upsert({
            where: { name: 'Phòng Kế toán' },
            update: {},
            create: { name: 'Phòng Kế toán' },
        }),
        prisma.department.upsert({
            where: { name: 'Phòng Sản xuất' },
            update: {},
            create: { name: 'Phòng Sản xuất' },
        }),
        prisma.department.upsert({
            where: { name: 'Nhà bếp' },
            update: {},
            create: { name: 'Nhà bếp' },
        }),
    ]);

    console.log('✅ Departments created');

    // Create positions
    const positions = await Promise.all([
        prisma.position.upsert({
            where: { name: 'Giám đốc' },
            update: {},
            create: { name: 'Giám đốc' },
        }),
        prisma.position.upsert({
            where: { name: 'Trưởng phòng' },
            update: {},
            create: { name: 'Trưởng phòng' },
        }),
        prisma.position.upsert({
            where: { name: 'Nhân viên' },
            update: {},
            create: { name: 'Nhân viên' },
        }),
        prisma.position.upsert({
            where: { name: 'Bếp trưởng' },
            update: {},
            create: { name: 'Bếp trưởng' },
        }),
    ]);

    console.log('✅ Positions created');

    // Create system config
    await Promise.all([
        prisma.systemConfig.upsert({
            where: { key: 'MEAL_PRICE' },
            update: {},
            create: { key: 'MEAL_PRICE', value: '25000' },
        }),
        prisma.systemConfig.upsert({
            where: { key: 'CUT_OFF_HOUR' },
            update: {},
            create: { key: 'CUT_OFF_HOUR', value: '16' },
        }),
    ]);

    console.log('✅ System config created');

    // Create locations
    const locations = await Promise.all([
        prisma.mealLocation.upsert({
            where: { name: 'Nhà ăn' },
            update: {},
            create: { name: 'Nhà ăn', isDefault: true },
        }),
        prisma.mealLocation.upsert({
            where: { name: 'Văn phòng' },
            update: {},
            create: { name: 'Văn phòng', isDefault: false },
        }),
    ]);

    console.log('✅ Meal locations created');

    // Create presets
    await Promise.all([
        prisma.registrationPreset.upsert({
            where: { name: 'Hành chính – Trưa' },
            update: {},
            create: { name: 'Hành chính – Trưa', mealType: 'LUNCH', weekdays: '1,2,3,4,5', locationId: locations[0].id },
        }),
        prisma.registrationPreset.upsert({
            where: { name: 'Hành chính – Trưa+Tối' },
            update: {},
            create: { name: 'Hành chính – Trưa+Tối', mealType: 'LUNCH,DINNER', weekdays: '1,2,3,4,5', locationId: locations[0].id },
        }),
        prisma.registrationPreset.upsert({
            where: { name: 'Full tháng – Trưa' },
            update: {},
            create: { name: 'Full tháng – Trưa', mealType: 'LUNCH', weekdays: '0,1,2,3,4,5,6', locationId: locations[0].id },
        }),
        prisma.registrationPreset.upsert({
            where: { name: 'Full tháng – Trưa+Tối' },
            update: {},
            create: { name: 'Full tháng – Trưa+Tối', mealType: 'LUNCH,DINNER', weekdays: '0,1,2,3,4,5,6', locationId: locations[0].id },
        }),
    ]);

    console.log('✅ Registration presets created');

    // Create admin accounts
    const passwordHash = await bcrypt.hash('Admin@123', 10);

    // Admin System
    const adminEmployee = await prisma.employee.upsert({
        where: { employeeCode: 'ADMIN001' },
        update: {},
        create: {
            employeeCode: 'ADMIN001',
            fullName: 'Admin Hệ thống',
            email: 'admin@company.com',
            departmentId: departments[1].id, // Phòng Nhân sự
            positionId: positions[1].id, // Trưởng phòng
        },
    });

    await prisma.account.upsert({
        where: { employeeId: adminEmployee.id },
        update: {},
        create: {
            employeeId: adminEmployee.id,
            passwordHash,
            secretCode: '123456',
            role: Role.ADMIN_SYSTEM,
        },
    });

    // Admin Kitchen
    const kitchenEmployee = await prisma.employee.upsert({
        where: { employeeCode: 'KITCHEN001' },
        update: {},
        create: {
            employeeCode: 'KITCHEN001',
            fullName: 'Bếp trưởng',
            email: 'kitchen@company.com',
            departmentId: departments[4].id, // Nhà bếp
            positionId: positions[3].id, // Bếp trưởng
        },
    });

    await prisma.account.upsert({
        where: { employeeId: kitchenEmployee.id },
        update: {},
        create: {
            employeeId: kitchenEmployee.id,
            passwordHash,
            secretCode: '654321',
            role: Role.ADMIN_KITCHEN,
        },
    });

    // Sample employees
    const sampleEmployees = [
        { code: 'NV001', name: 'Nguyễn Văn A', dept: 3, pos: 2 },
        { code: 'NV002', name: 'Trần Thị B', dept: 2, pos: 2 },
        { code: 'NV003', name: 'Lê Văn C', dept: 3, pos: 2 },
    ];

    for (const emp of sampleEmployees) {
        const employee = await prisma.employee.upsert({
            where: { employeeCode: emp.code },
            update: {},
            create: {
                employeeCode: emp.code,
                fullName: emp.name,
                departmentId: departments[emp.dept].id,
                positionId: positions[emp.pos].id,
            },
        });

        await prisma.account.upsert({
            where: { employeeId: employee.id },
            update: {},
            create: {
                employeeId: employee.id,
                passwordHash: await bcrypt.hash('123456', 10),
                secretCode: Math.floor(100000 + Math.random() * 900000).toString(),
                role: Role.EMPLOYEE,
            },
        });
    }

    console.log('✅ Sample employees created');
    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('');
    console.log('📋 Default accounts:');
    console.log('   Admin System: ADMIN001 / Admin@123');
    console.log('   Admin Kitchen: KITCHEN001 / Admin@123');
    console.log('   Employee: NV001, NV002, NV003 / 123456');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
