import { PrismaClient, MealStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetDate = new Date('2026-03-12');

    const result = await prisma.mealEvent.updateMany({
        where: {
            mealDate: targetDate,
        },
        data: {
            status: 'DRAFT',
        },
    });

    console.log(`Updated ${result.count} meal events to DRAFT for ${targetDate.toISOString().split('T')[0]}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
