import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const meals = await prisma.mealEvent.findMany({
        orderBy: { mealDate: 'desc' },
        take: 10
    });
    console.log(JSON.stringify(meals, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
