
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const prisma = new PrismaClient();

async function debugReport() {
    console.log('🔍 STARTING DEBUG REPORT...');

    const employeeCode = '480190';
    const startDateStr = '2026-02-01';
    const endDateStr = '2026-02-28';

    const start = startOfDay(parseISO(startDateStr));
    const end = endOfDay(parseISO(endDateStr));

    console.log({ start, end });

    // 1. Check if Employee Exists
    const emp = await prisma.employee.findUnique({
        where: { employeeCode }
    });

    if (!emp) {
        console.error('❌ Employee not found:', employeeCode);
        return;
    }
    console.log('✅ Found Employee:', emp.fullName);

    // 2. Check Registrations in Range (Raw)
    const registrations = await prisma.registration.findMany({
        where: {
            employeeId: emp.id,
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
    });

    console.log(`📦 Found ${registrations.length} registrations in range.`);
    registrations.forEach(r => {
        console.log(` - Role: [${r.mealEvent.mealDate.toISOString().split('T')[0]} - ${r.mealEvent.mealType}] Cancelled: ${r.isCancelled}`);
    });

    // 3. Simulate Report Query Logic
    const activeRegistrations = registrations.filter(r => !r.isCancelled);
    console.log(`✅ Active Registrations (Report Logic): ${activeRegistrations.length}`);

    // 4. Check Checkins
    const checkins = await prisma.checkinLog.findMany({
        where: {
            employeeId: emp.id,
            mealEvent: {
                mealDate: {
                    gte: start,
                    lte: end
                }
            }
        }
    });
    console.log(`✅ Checkins: ${checkins.length}`);

    // 5. Calc Stats
    const totalRegistered = activeRegistrations.length;
    const totalEaten = checkins.length;
    let totalSkipped = 0;

    activeRegistrations.forEach(reg => {
        const hasCheckin = checkins.some(c => c.mealEventId === reg.mealEventId);
        const isPast = new Date(reg.mealEvent.mealDate) < new Date();

        if (!hasCheckin && isPast) {
            totalSkipped++;
        }
    });

    console.log('📊 FINAL STATS:');
    console.log('Meals (Registered):', totalRegistered);
    console.log('Skipped:', totalSkipped);
    console.log('Eaten:', totalEaten);

}

debugReport()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
