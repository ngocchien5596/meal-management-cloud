import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('--- FINAL DATA VERIFICATION ---');

    // Check if MealReview model is accessible
    const reviewsCount = await prisma.mealReview.count();
    console.log(`Total Meal Reviews in DB: ${reviewsCount}`);

    // Check recent MealEvents include review counts
    const recentMeals = await prisma.mealEvent.findMany({
        take: 5,
        orderBy: { mealDate: 'desc' },
        include: {
            _count: {
                select: { reviews: true }
            }
        }
    });

    console.log('\nRecent meals with review counts:');
    recentMeals.forEach(m => {
        console.log(`- ${m.mealDate.toISOString().split('T')[0]} (${m.mealType}): ${m._count?.reviews || 0} reviews`);
    });

    // Check Feb 2026 registrations again
    const febRegs = await prisma.registration.count({
        where: {
            isCancelled: true,
            mealEvent: {
                mealDate: {
                    gte: new Date('2026-02-01'),
                    lte: new Date('2026-02-28')
                }
            }
        }
    });
    console.log(`\nCancelled registrations in Feb 2026: ${febRegs}`);
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
