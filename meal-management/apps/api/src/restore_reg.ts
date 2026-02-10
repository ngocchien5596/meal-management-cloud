import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restore() {
    const mealId = 'cml5z4mwj0014qaid8g0o2kms';
    const employeeId = 'cml5af6ch0002wyk2xkyzouxc'; // Bùi Ngọc Chiến

    console.log(`Restoring registration for employeeId: ${employeeId} in mealId: ${mealId}`);

    // Check if it already exists (to avoid duplicate unique constraint error)
    const existing = await prisma.registration.findUnique({
        where: {
            mealEventId_employeeId: {
                mealEventId: mealId,
                employeeId: employeeId
            }
        }
    });

    if (existing) {
        if (existing.isCancelled) {
            await prisma.registration.update({
                where: { id: existing.id },
                data: { isCancelled: false, cancelledAt: null }
            });
            console.log('UN-CANCELLED EXISTING REGISTRATION.');
        } else {
            console.log('REGISTRATION ALREADY EXISTS AND IS ACTIVE.');
        }
    } else {
        const created = await prisma.registration.create({
            data: {
                mealEventId: mealId,
                employeeId: employeeId
            }
        });
        console.log('CREATED NEW REGISTRATION:', created.id);
    }
}

restore()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
