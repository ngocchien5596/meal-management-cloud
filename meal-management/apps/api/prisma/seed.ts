import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with premium sample data...');

    // 1. Clean existing data (Optional, but good for a fresh start)
    // await prisma.checkinLog.deleteMany();
    // await prisma.registration.deleteMany();
    // await prisma.guest.deleteMany();
    // await prisma.mealEvent.deleteMany();
    // await prisma.account.deleteMany();
    // await prisma.employee.deleteMany();

    // 2. Create departments
    const deptNames = [
        'Ban Kiểm soát',
        'Ban Tổng Giám đốc',
        'Phân xưởng Cơ điện',
        'Phân xưởng Khai thác',
        'Phân xưởng Lò nung',
        'Phân xưởng Nghiền liệu',
        'Phân xưởng Nghiền xi và Đóng bao',
        'Phòng Chiến lược kinh doanh',
        'Phòng Chính trị - Nhân sự',
        'Phòng Công nghệ thông tin',
        'Phòng Kỹ thuật công nghệ',
        'Phòng Quản lý chất lượng',
        'Phòng Tài chính Kế toán',
        'Phòng Đầu tư và Quản lý tài sản',
        'Văn phòng'
    ];
    const departments = await Promise.all(
        deptNames.map(name =>
            prisma.department.upsert({
                where: { name },
                update: {},
                create: { name }
            })
        )
    );
    console.log(`✅ ${departments.length} Departments created`);

    // 3. Create positions
    const posNames = [
        'Tổng Giám đốc',
        'Phó Tổng Giám đốc',
        'Trưởng phòng',
        'Phó trường phòng',
        'Chuyên viên',
        'Nhân viên'
    ];
    const positions = await Promise.all(
        posNames.map(name =>
            prisma.position.upsert({
                where: { name },
                update: {},
                create: { name }
            })
        )
    );
    console.log(`✅ ${positions.length} Positions created`);

    // 4. Create system config
    await prisma.systemConfig.upsert({
        where: { key: 'MEAL_PRICE' },
        update: {},
        create: { key: 'MEAL_PRICE', value: '25000' },
    });
    await prisma.systemConfig.upsert({
        where: { key: 'CUT_OFF_HOUR' },
        update: {},
        create: { key: 'CUT_OFF_HOUR', value: '16:30' },
    });
    console.log('✅ System config created');

    // 5. Create locations
    const locations = await Promise.all([
        prisma.mealLocation.upsert({
            where: { name: 'Nhà ăn chính' },
            update: {},
            create: { name: 'Nhà ăn chính', isDefault: true },
        }),
        prisma.mealLocation.upsert({
            where: { name: 'Văn phòng lầu 1' },
            update: {},
            create: { name: 'Văn phòng lầu 1', isDefault: false },
        }),
        prisma.mealLocation.upsert({
            where: { name: 'Xưởng sản xuất A' },
            update: {},
            create: { name: 'Xưởng sản xuất A', isDefault: false },
        }),
    ]);
    console.log('✅ Meal locations created');

    // 6. Create admin accounts
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const empPasswordHash = await bcrypt.hash('123456', 10);

    // Admin System
    const sysAdmin = await prisma.employee.upsert({
        where: { employeeCode: 'ADMIN001' },
        update: {},
        create: {
            employeeCode: 'ADMIN001',
            fullName: 'Admin Hệ Thống',
            phoneNumber: '0901234567',
            email: 'admin@company.com',
            departmentId: departments[8].id, // Phòng Chính trị - Nhân sự
            positionId: positions[2].id, // Trưởng phòng
        },
    });
    await prisma.account.upsert({
        where: { employeeId: sysAdmin.id },
        update: {},
        create: {
            employeeId: sysAdmin.id,
            passwordHash,
            secretCode: '111222',
            role: Role.ADMIN_SYSTEM,
        },
    });

    // 7. Sample employees from user list
    const sampleEmployeesData = [
        { code: '480190', name: 'Bùi Ngọc Chiến', phone: '0975788609', deptIdx: 9, posIdx: 5 },
        { code: '478139', name: 'Bùi Đức Hoàng', phone: '0981392368', deptIdx: 9, posIdx: 5 },
        { code: '478169', name: 'Nguyễn Hoàng Dương', phone: '0325330803', deptIdx: 9, posIdx: 5 },
        { code: '269836', name: 'Đinh Ngọc Hưng', phone: '', deptIdx: 9, posIdx: 5 },
        { code: '434262', name: 'Bùi Công Minh', phone: '', deptIdx: 9, posIdx: 5 },
        { code: '246233', name: 'Trần Hải Sơn', phone: '', deptIdx: 9, posIdx: 5 },
        { code: '478167', name: 'Nguyễn Thái Hưng', phone: '', deptIdx: 9, posIdx: 5 },
        { code: '183073', name: 'Trịnh Phan Tuấn', phone: '', deptIdx: 9, posIdx: 2 },
        { code: '183550', name: 'Nhungnt28', phone: '', deptIdx: 14, posIdx: 5 },
    ];

    for (const data of sampleEmployeesData) {
        const emp = await prisma.employee.upsert({
            where: { employeeCode: data.code },
            update: {
                fullName: data.name,
                phoneNumber: data.phone || null,
                departmentId: departments[data.deptIdx].id,
                positionId: positions[data.posIdx].id,
            },
            create: {
                employeeCode: data.code,
                fullName: data.name,
                phoneNumber: data.phone || null,
                departmentId: departments[data.deptIdx].id,
                positionId: positions[data.posIdx].id,
            },
        });
        await prisma.account.upsert({
            where: { employeeId: emp.id },
            update: {},
            create: {
                employeeId: emp.id,
                passwordHash: empPasswordHash,
                secretCode: (100000 + Math.floor(Math.random() * 899999)).toString(),
                role: Role.EMPLOYEE,
            },
        });
    }
    // Clerk User
    const clerk = await prisma.employee.upsert({
        where: { employeeCode: 'CLERK001' },
        update: {},
        create: {
            employeeCode: 'CLERK001',
            fullName: 'Văn Thư 01',
            phoneNumber: '0988000111',
            departmentId: departments[14].id, // Văn phòng
            positionId: positions[5].id, // Nhân viên
        },
    });
    await prisma.account.upsert({
        where: { employeeId: clerk.id },
        update: {},
        create: {
            employeeId: clerk.id,
            passwordHash: empPasswordHash,
            secretCode: '111111',
            role: Role.CLERK,
        },
    });

    console.log(`✅ ${sampleEmployeesData.length} Sample employees created`);
    console.log('✅ Clerk user created');

    // 8. Guest Directory
    const guestsData = [
        { name: 'Đối tác Samsung', phone: '0281234567', note: 'Đoàn khách tham quan xưởng' },
        { name: 'Nhà cung cấp Viettel', phone: '0289876543', note: 'Kỹ thuật viên bảo trì mạng' },
    ];

    for (const g of guestsData) {
        const existing = await prisma.guestDirectory.findFirst({
            where: { fullName: g.name, phoneNumber: g.phone }
        });

        if (existing) {
            await prisma.guestDirectory.update({
                where: { id: existing.id },
                data: { note: g.note }
            });
        } else {
            await prisma.guestDirectory.create({
                data: {
                    fullName: g.name,
                    phoneNumber: g.phone,
                    note: g.note,
                    isActive: true
                }
            });
        }
    }
    console.log(`✅ ${guestsData.length} Guest Directory items created`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Quick Access:');
    console.log('--------------------------------------------------');
    console.log('System Admin  : ADMIN001 / Admin@123');
    console.log('Clerk (Văn thư): CLERK001 / 123456');
    console.log('Employee (All): [Dùng Mã NV thực tế] / 123456');
    console.log('--------------------------------------------------\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
