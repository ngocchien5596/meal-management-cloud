import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetDate = new Date('2026-03-12');

    // 1. Create Sample Menu Item Catalog entries
    const menuItemsToCreate = [
        'Cơm trắng',
        'Thịt kho tàu',
        'Cá thu sốt cà chua',
        'Canh bí đỏ nấu tôm',
        'Rau muống xào tỏi',
        'Dưa hấu tráng miệng',
    ];

    console.log('Upserting Menu Item Catalog...');
    const catalogItems = await Promise.all(
        menuItemsToCreate.map((name) =>
            prisma.menuItemCatalog.upsert({
                where: { name },
                update: {},
                create: { name },
            })
        )
    );

    // 2. Find the meal events for today
    const meals = await prisma.mealEvent.findMany({
        where: { mealDate: targetDate },
    });

    if (meals.length === 0) {
        console.error('No meals found for 2026-03-12. Please run create-sample-meals.ts first.');
        return;
    }

    // 3. Add items to each meal
    for (const meal of meals) {
        console.log(`Adding menu to ${meal.mealType}...`);

        // Choose different items for Lunch and Dinner for variety
        const itemsForThisMeal = meal.mealType === 'LUNCH'
            ? ['Cơm trắng', 'Thịt kho tàu', 'Canh bí đỏ nấu tôm', 'Dưa hấu tráng miệng']
            : ['Cơm trắng', 'Cá thu sốt cà chua', 'Rau muống xào tỏi', 'Canh bí đỏ nấu tôm'];

        for (const itemName of itemsForThisMeal) {
            const catalogItem = catalogItems.find(i => i.name === itemName);
            if (catalogItem) {
                // Use upsert to avoid duplicates if script runs twice
                await prisma.menuItem.upsert({
                    where: {
                        // MenuItem doesn't have a unique constraint on (mealEventId, catalogId) in schema
                        // but we want to avoid duplicates. Let's find first.
                        id: (await prisma.menuItem.findFirst({
                            where: { mealEventId: meal.id, catalogId: catalogItem.id }
                        }))?.id || 'new-id-' + Math.random()
                    },
                    update: {},
                    create: {
                        mealEventId: meal.id,
                        catalogId: catalogItem.id,
                    }
                });
            }
        }
    }

    console.log('Menu items added successfully to both meals.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
