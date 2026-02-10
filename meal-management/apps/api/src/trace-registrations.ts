
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

async function traceRegistrations() {
    const employeeCodes = ['478139', '478167', '480190'];
    const targetDate = new Date('2026-02-07');

    console.log(`🔍 TRACING ALL REGISTRATIONS FOR 2026-02-07...`);

    for (const code of employeeCodes) {
        const emp = await prisma.employee.findUnique({
            where: { employeeCode: code },
            include: {
                registrations: {
                    where: {
                        mealEvent: {
                            mealDate: targetDate
                        }
                    },
                    include: {
                        mealEvent: true
                    }
                }
            }
        });

        if (!emp) continue;

        console.log(`\n👤 ${emp.fullName} (${code}):`);
        if (emp.registrations.length === 0) {
            console.log('  ❕ No registrations found for this day.');
        } else {
            emp.registrations.forEach(r => {
                console.log(`  🍴 Meal: ${r.mealEvent.mealType}`);
                console.log(`    - ID: ${r.id}`);
                console.log(`    - isCancelled: ${r.isCancelled}`);
                console.log(`    - cancelledBy: ${r.cancelledBy || 'NULL'}`);
                console.log(`    - cancelledAt: ${r.cancelledAt ? format(r.cancelledAt, 'HH:mm:ss dd/MM/yyyy') : 'N/A'}`);
                console.log(`    - updatedAt: ${format(r.updatedAt, 'HH:mm:ss dd/MM/yyyy')}`);
            });
        }
    }
}

traceRegistrations()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
