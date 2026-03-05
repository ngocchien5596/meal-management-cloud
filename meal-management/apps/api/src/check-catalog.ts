import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const catalog = await prisma.ingredientCatalog.findMany();
    console.log(JSON.stringify(catalog, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
