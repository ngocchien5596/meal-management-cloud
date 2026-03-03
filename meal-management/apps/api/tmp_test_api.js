const axios = require('axios');

async function testApi() {
    try {
        // Need to find a way to get a token or bypass auth for testing
        // For now, I'll just check if the database query I wrote locally returns menuItems
        console.log('Testing database query directly instead of API for now...');
    } catch (err) {
        console.error(err);
    }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvents() {
    const year = 2026;
    const month = 2; // March
    const startDate = new Date(year, month, 1, 0, 0, 0);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const mealEvents = await prisma.mealEvent.findMany({
        where: {
            mealDate: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            menuItems: {
                select: { name: true }
            }
        }
    });

    console.log('--- API Simulation Result ---');
    mealEvents.forEach(e => {
        if (e.menuItems.length > 0) {
            console.log(`Event: ${e.mealDate.toISOString()}, Type: ${e.mealType}, MenuItems: ${JSON.stringify(e.menuItems)}`);
        }
    });

    if (mealEvents.every(e => e.menuItems.length === 0)) {
        console.log('No events found with menuItems for this month.');
    }
}

checkEvents();
