
import 'dotenv/config';
import prisma from './lib/prisma';

async function main() {
    console.log('--- Checking Reviews for Employee 480190 ---');

    // Find the employee first
    const employee = await prisma.employee.findUnique({
        where: { employeeCode: '480190' }
    });

    if (!employee) {
        console.log('Employee 480190 not found.');
        return;
    }

    console.log(`Found Employee: ${employee.fullName} (${employee.id})`);

    // Find reviews by this employee created recently (e.g., today)
    const reviews = await prisma.mealReview.findMany({
        where: {
            employeeId: employee.id,
        },
        include: {
            mealEvent: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5
    });

    console.log(`Found ${reviews.length} recent reviews.`);

    reviews.forEach(r => {
        console.log(`Review ID: ${r.id}`);
        console.log(`  Created At (Local): ${r.createdAt}`);
        console.log(`  Created At (ISO): ${r.createdAt.toISOString()}`);
        console.log(`  Meal Date: ${r.mealEvent.mealDate}`);
        console.log(`  Meal Type: ${r.mealEvent.mealType}`);
        console.log(`  Meal Event ID: ${r.mealEvent.mealEventId || r.mealEvent.id}`); // Check ID
        console.log(`  Is Anonymous: ${r.isAnonymous}`);
        console.log(`  Comment: ${r.comment}`);
    });

    console.log('-------------------------------------------');

    // Check DB Time
    const dbTime = await prisma.$queryRaw`SELECT NOW() as db_now, current_setting('TIMEZONE') as db_tz`;
    console.log('DB Time Info:', dbTime);

    // Get a valid MealEvent to attach review to
    const mealEvent = await prisma.mealEvent.findFirst({
        where: { mealDate: { lte: new Date() } },
        orderBy: { mealDate: 'desc' }
    });

    if (mealEvent) {
        console.log(`Creating TEST Review for Meal Event: ${mealEvent.id} (${mealEvent.mealDate})`);

        // Simulate Review Creation
        // NOTE: We use prisma.mealReview.create() which triggers the extension logic
        const newReview = await prisma.mealReview.create({
            data: {
                mealEventId: mealEvent.id,
                employeeId: employee.id,
                comment: "DEBUG TEST REVIEW " + new Date().toISOString(),
                isAnonymous: true
            }
        });

        console.log('Created Review:', newReview);
        console.log('  Created At (App View):', newReview.createdAt);
        console.log('  Created At (ISO):', newReview.createdAt.toISOString());

        // Check Raw Value in DB
        const rawCreated = await prisma.$queryRaw`SELECT "createdAt" FROM "MealReview" WHERE id = ${newReview.id}`;
        console.log('Raw DB Value:', rawCreated);
    } else {
        console.warn('No MealEvent found to create review.');
    }

    // Check Raw CreatedAt
    const rawReviews = await prisma.$queryRaw`SELECT id, "createdAt" FROM "MealReview" where "employeeId" = ${employee.id} ORDER BY "createdAt" DESC LIMIT 1`;
    console.log('Raw Review Info:', rawReviews);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
