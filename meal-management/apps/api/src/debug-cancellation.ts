
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

const prisma = new PrismaClient();

async function debugCancellation() {
    console.log('🔍 COMPREHENSIVE REGISTRATION INVESTIGATION...');

    const employeeCodes = ['478139', '478167', '480190'];
    const start = startOfDay(new Date(2026, 1, 1)); // Feb 1
    const end = endOfDay(new Date(2026, 1, 28));   // Feb 28

    for (const code of employeeCodes) {
        const emp = await prisma.employee.findUnique({
            where: { employeeCode: code }
        });

        if (!emp) {
            console.error(`❌ Employee not found: ${code}`);
            continue;
        }

        console.log(`\n👤 WORKER: ${emp.fullName} (${code})`);

        const registrations = await prisma.registration.findMany({
            where: {
                employeeId: emp.id,
                mealEvent: {
                    mealDate: { gte: start, lte: end }
                }
            },
            include: {
                mealEvent: true
            },
            orderBy: [
                { mealEvent: { mealDate: 'asc' } },
                { mealEvent: { mealType: 'asc' } }
            ]
        });

        if (registrations.length === 0) {
            console.log(' ❕ No registrations for February.');
            continue;
        }

        console.log(` 📋 Found ${registrations.length} registrations:`);
        registrations.forEach(r => {
            const dateStr = format(r.mealEvent.mealDate, 'yyyy-MM-dd');
            const type = r.mealEvent.mealType;
            const status = r.isCancelled ? '❌ CANCELLED' : '✅ ACTIVE';
            const log = `   - [${dateStr} ${type}] ${status} | Created: ${format(r.createdAt, 'HH:mm:ss dd/MM')} | Updated: ${format(r.updatedAt, 'HH:mm:ss dd/MM')} | CancelledAt: ${r.cancelledAt ? format(r.cancelledAt, 'HH:mm:ss dd/MM') : 'N/A'}`;
            console.log(log);
        });
    }
}

debugCancellation()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
