import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLimits() {
    console.log('🔍 Starting Data Length Verification...\n');
    let violations = 0;

    const checks = [
        { model: 'department', field: 'name', limit: 50 },
        { model: 'employee', field: 'employeeCode', limit: 6 },
        { model: 'employee', field: 'fullName', limit: 50 },
        { model: 'employee', field: 'email', limit: 100 },
        { model: 'employee', field: 'phoneNumber', limit: 20 },
        { model: 'guest', field: 'fullName', limit: 100 },
        { model: 'guest', field: 'note', limit: 255 },
        { model: 'guest', field: 'phoneNumber', limit: 20 },
        { model: 'guestDirectory', field: 'fullName', limit: 100 },
        { model: 'guestDirectory', field: 'note', limit: 255 },
        { model: 'guestDirectory', field: 'phoneNumber', limit: 20 },
        { model: 'ingredientCatalog', field: 'name', limit: 100 },
        { model: 'ingredientCatalog', field: 'defaultUnit', limit: 20 },
        { model: 'mealLocation', field: 'name', limit: 50 },
        { model: 'menuItemCatalog', field: 'name', limit: 100 },
        { model: 'position', field: 'name', limit: 50 },
    ];

    for (const check of checks) {
        try {
            // @ts-ignore - Dynamic model access for scripts
            const records = await prisma[check.model].findMany({
                where: {
                    [check.field]: {
                        not: null
                    }
                },
                select: {
                    id: true,
                    [check.field]: true
                }
            });

            const invalidRecords = records.filter((r: any) => r[check.field] && String(r[check.field]).length > check.limit);

            if (invalidRecords.length > 0) {
                console.error(`❌ Found ${invalidRecords.length} violations in ${check.model}.${check.field} (Limit: ${check.limit})`);
                invalidRecords.forEach((r: any) => {
                    console.error(`   - ID: ${r.id}, Value: "${r[check.field]}" (Length: ${String(r[check.field]).length})`);
                });
                violations += invalidRecords.length;
            } else {
                console.log(`✅ ${check.model}.${check.field}: OK`);
            }
        } catch (error) {
            console.error(`⚠️ Could not check ${check.model}.${check.field}: ${error}`);
        }
    }

    console.log(`\n📊 Verification Complete: ${violations} total violations found.`);
    if (violations > 0) {
        process.exit(1);
    }
}

checkLimits()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
