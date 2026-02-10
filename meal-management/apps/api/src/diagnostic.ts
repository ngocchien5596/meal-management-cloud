import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const mealId = 'cml5z4mwj0014qaid8g0o2kms';
    const employeeCode = '480190';

    console.log(`Checking mealId: ${mealId}, employeeCode: ${employeeCode}`);

    const registration = await prisma.registration.findFirst({
        where: {
            mealEventId: mealId,
            employee: {
                employeeCode: employeeCode
            }
        },
        include: {
            employee: true
        }
    });

    if (registration) {
        console.log('FOUND REGISTRATION:');
        console.log(JSON.stringify(registration, null, 2));
    } else {
        console.log('NO REGISTRATION FOUND IN DATABASE.');
    }
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
