
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listFaultyData() {
    console.log('🔍 ANALYZING FAULTY REGISTRATION DATA (FEB 2026)...');

    // Find registrations in Feb that are isCancelled: true
    const faultyRegs = await prisma.registration.findMany({
        where: {
            isCancelled: true,
            mealEvent: {
                mealDate: {
                    gte: new Date(2026, 1, 1),
                    lte: new Date(2026, 1, 28)
                }
            }
        },
        include: {
            employee: true,
            mealEvent: true
        }
    });

    console.log(`Found ${faultyRegs.length} cancelled registrations in February.`);

    // Group by cancellation date and initiator
    const stats: Record<string, number> = {};
    const initiatorStats: Record<string, number> = {};
    faultyRegs.forEach(r => {
        const dateStr = r.cancelledAt ? r.cancelledAt.toISOString().split('T')[0] : 'null';
        stats[dateStr] = (stats[dateStr] || 0) + 1;

        const initiator = (r as any).cancelledBy || 'null';
        initiatorStats[initiator] = (initiatorStats[initiator] || 0) + 1;
    });

    console.log('Cancellations per day:', stats);
    console.log('Cancellations per initiator:', initiatorStats);

    if (faultyRegs.length > 0) {
        console.log('\nSample faulty records (Employee - Date - Type):');
        faultyRegs.slice(0, 10).forEach(r => {
            console.log(`- ${r.employee.fullName} (${r.employee.employeeCode}) - ${r.mealEvent.mealDate.toISOString().split('T')[0]} - ${r.mealEvent.mealType}`);
        });
    }
}

listFaultyData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
