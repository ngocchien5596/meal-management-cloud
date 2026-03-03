const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const eventsWithMenu = await prisma.mealEvent.findMany({
            where: {
                menuItems: { some: {} }
            },
            include: {
                _count: { select: { menuItems: true } }
            },
            take: 5
        });

        console.log('--- Meal Events with Menu ---');
        eventsWithMenu.forEach(e => {
            console.log(`ID: ${e.id}, Date: ${e.mealDate}, Type: ${e.mealType}, MenuCount: ${e._count.menuItems}`);
        });

        if (eventsWithMenu.length === 0) {
            console.log('No meal events with menu items found.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
