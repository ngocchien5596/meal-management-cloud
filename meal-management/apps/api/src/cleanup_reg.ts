import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function remove() {
    const mealId = 'cml5z4mwj0014qaid8g0o2kms';
    const employeeCode = '480190';

    const registration = await prisma.registration.findFirst({
        where: {
            mealEventId: mealId,
            employee: {
                employeeCode: employeeCode
            }
        }
    });

    if (registration) {
        await prisma.registration.delete({
            where: { id: registration.id }
        });
        console.log(`DELETED REGISTRATION: ${registration.id} for employee ${employeeCode}`);
    } else {
        console.log('NO REGISTRATION FOUND.');
    }
}

remove()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
