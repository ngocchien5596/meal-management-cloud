import { PrismaClient, MealType, MealStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const employeeId = 'cmmlqrufr000r2zr6e48tiwte';
    const targetDate = new Date('2026-03-12');

    // 1. Verify employee exists
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
    });

    if (!employee) {
        console.error(`Employee with ID ${employeeId} not found.`);
        return;
    }

    console.log(`Found employee: ${employee.fullName} (${employee.employeeCode})`);

    const mealTypes: MealType[] = ['LUNCH', 'DINNER'];

    for (const mealType of mealTypes) {
        // 2. Check or Create MealEvent
        let mealEvent = await prisma.mealEvent.findUnique({
            where: {
                mealDate_mealType: {
                    mealDate: targetDate,
                    mealType: mealType,
                },
            },
        });

        if (!mealEvent) {
            mealEvent = await prisma.mealEvent.create({
                data: {
                    mealDate: targetDate,
                    mealType: mealType,
                    status: 'COMPLETED', // Mark as completed so they show up in reports if needed
                },
            });
            console.log(`Created ${mealType} event for ${targetDate.toISOString().split('T')[0]}`);
        } else {
            console.log(`${mealType} event already exists.`);
        }

        // 3. Create or Update Registration
        const registration = await prisma.registration.upsert({
            where: {
                mealEventId_employeeId: {
                    mealEventId: mealEvent.id,
                    employeeId: employeeId,
                },
            },
            update: {
                isCancelled: false,
            },
            create: {
                mealEventId: mealEvent.id,
                employeeId: employeeId,
                isCancelled: false,
            },
        });

        console.log(`Registration for ${mealType} confirmed (ID: ${registration.id})`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
