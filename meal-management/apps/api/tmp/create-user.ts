import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const employeeCode = '480190';
    const password = '1234565';

    console.log(`Creating account for ${employeeCode}...`);

    // Ensure we have a department and position
    const dept = await prisma.department.findFirst() || await prisma.department.create({ data: { name: 'Phòng Kỹ thuật' } });
    const pos = await prisma.position.findFirst() || await prisma.position.create({ data: { name: 'Kỹ sư' } });

    const employee = await prisma.employee.upsert({
        where: { employeeCode },
        update: {},
        create: {
            employeeCode,
            fullName: 'Nhân viên 480190',
            departmentId: dept.id,
            positionId: pos.id,
        },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.account.upsert({
        where: { employeeId: employee.id },
        update: { passwordHash },
        create: {
            employeeId: employee.id,
            passwordHash,
            secretCode: '123456', // Default secret
            role: Role.EMPLOYEE,
        },
    });

    console.log(`Successfully created account: ${employeeCode} / ${password}`);
}

main()
    .catch((e) => {
        console.error('Failed to create account:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
