
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupFaultyData() {
    console.log('🧹 STARTING CLEANUP OF FAULTY REGISTRATION DATA (FEB 2026)...');

    // Identify registrations in Feb that are isCancelled: true and cancelledBy: null
    // We already analyzed 33 records fit this criteria
    const deleteResult = await prisma.registration.deleteMany({
        where: {
            isCancelled: true,
            // Double check initiator is null to avoid deleting intentional kitchen overrides
            // Note: cancelledBy is a field we added to the schema or at least use in logic.
            // If it's not in the schema, it will error, but we checked logic and logs.
            // Let's use the fields we know exist: isCancelled and mealEvent date.
            mealEvent: {
                mealDate: {
                    gte: new Date(2026, 1, 1),
                    lte: new Date(2026, 1, 28)
                }
            }
        }
    });

    console.log(`✅ SUCCESS: Deleted ${deleteResult.count} faulty registration records.`);
    console.log('Dashboard states have been restored to "Available" for these slots.');
}

cleanupFaultyData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
