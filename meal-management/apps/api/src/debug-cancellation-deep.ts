
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

const prisma = new PrismaClient();

async function debugCancellationDeep() {
    console.log('🔍 DEEP INVESTIGATION OF CANCELLATIONS FOR 7/2 LUNCH...');

    const employeeCodes = ['478139', '478167', '480190'];
    const targetDateStr = '2026-02-07';
    const targetMealType = 'LUNCH';

    const targetDate = startOfDay(parseISO(targetDateStr));

    const mealEvent = await prisma.mealEvent.findUnique({
        where: {
            mealDate_mealType: {
                mealDate: targetDate,
                mealType: targetMealType
            }
        }
    });

    if (!mealEvent) {
        console.error('❌ Meal Event not found for 7/2 LUNCH');
        return;
    }

    for (const code of employeeCodes) {
        const emp = await prisma.employee.findUnique({
            where: { employeeCode: code }
        });

        if (!emp) continue;

        const registration = await prisma.registration.findUnique({
            where: {
                mealEventId_employeeId: {
                    mealEventId: mealEvent.id,
                    employeeId: emp.id
                }
            }
        });

        if (registration) {
            console.log(`📋 [${code}] ${emp.fullName}:`);
            console.log(` - isCancelled: ${registration.isCancelled}`);
            console.log(` - cancelledBy: ${registration.cancelledBy || 'NULL (User/System)'}`);
            console.log(` - cancelledAt: ${registration.cancelledAt}`);
            console.log(` - updatedAt: ${registration.updatedAt}`);
        }
    }
}

debugCancellationDeep()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
