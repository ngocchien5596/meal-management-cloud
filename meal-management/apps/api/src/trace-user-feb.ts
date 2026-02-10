
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

async function traceUserFeb() {
    const code = '480190'; // Bùi Ngọc Chiến
    const start = new Date(2026, 1, 1);
    const end = new Date(2026, 1, 28);

    console.log(`🔍 TRACING ALL REGISTRATIONS FOR ${code} IN FEB 2026...`);

    const emp = await prisma.employee.findUnique({
        where: { employeeCode: code },
        include: {
            registrations: {
                where: {
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
            }
        }
    });

    if (!emp) return;

    emp.registrations.forEach(r => {
        const dateStr = format(r.mealEvent.mealDate, 'yyyy-MM-dd');
        console.log(`[${dateStr} ${r.mealEvent.mealType}] Cancelled: ${r.isCancelled} | UpdatedAt: ${format(r.updatedAt, 'HH:mm:ss dd/MM')}`);
    });
}

traceUserFeb()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
