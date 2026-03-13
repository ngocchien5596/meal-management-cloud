import { PrismaClient } from '@prisma/client';
import { subDays, startOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Adjusting meal data to target ~30,000 VNĐ average cost...');

    const TARGET_AVG = 30000;

    // 1. Ensure enough employees (Need at least 150 to be safe)
    let employees = await prisma.employee.findMany();
    console.log(`📊 Current employee count: ${employees.length}`);

    if (employees.length < 150) {
        const needed = 150 - employees.length;
        console.log(`👤 Generating ${needed} extra test employees...`);

        const depts = await prisma.department.findMany();
        const positions = await prisma.position.findMany();

        for (let i = 0; i < needed; i++) {
            const code = `TEST-${100000 + i}`;
            await prisma.employee.create({
                data: {
                    employeeCode: code,
                    fullName: `Nhân viên Thử nghiệm ${i + 1}`,
                    departmentId: depts[i % depts.length].id,
                    positionId: positions[i % positions.length].id,
                    account: {
                        create: {
                            passwordHash: '$2b$10$6Rz3xU.L9Xp2pL1H8L8L8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8', // Dummy hash
                            secretCode: (100000 + i).toString(),
                            role: 'EMPLOYEE'
                        }
                    }
                }
            });
        }
        employees = await prisma.employee.findMany();
        console.log(`✅ Now have ${employees.length} employees.`);
    }

    // 2. Process meals in the last 30 days
    const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
    const meals = await prisma.mealEvent.findMany({
        where: {
            mealDate: { gte: thirtyDaysAgo }
        },
        include: {
            _count: { select: { registrations: true, guests: true } },
            registrations: { select: { employeeId: true } },
            ingredients: { select: { totalPrice: true } }
        }
    });

    const locations = await prisma.mealLocation.findMany();
    const defaultLocationId = locations[0]?.id;

    for (const meal of meals) {
        const totalCost = meal.ingredients.reduce((acc, i) => acc + i.totalPrice, 0);
        const currentPeople = meal._count.registrations + meal._count.guests;

        if (totalCost === 0) continue;

        const currentAvg = totalCost / (currentPeople || 1);

        // Target: TotalCost / TargetPeople = 30,000 => TargetPeople = TotalCost / 30,000
        const targetPeople = Math.ceil(totalCost / TARGET_AVG);

        console.log(`🔍 Meal: ${meal.mealDate.toISOString().split('T')[0]} ${meal.mealType}`);
        console.log(`   Current: ${totalCost.toLocaleString()} VNĐ / ${currentPeople} pax = ${Math.round(currentAvg).toLocaleString()} VNĐ/pax`);

        if (targetPeople > currentPeople) {
            const needed = targetPeople - currentPeople;
            console.log(`   📈 Average too high. Adding ${needed} registrations to reach ~${TARGET_AVG.toLocaleString()} VNĐ...`);

            const registeredIds = new Set(meal.registrations.map(r => r.employeeId));
            const availableEmps = employees.filter(e => !registeredIds.has(e.id));
            const shuffled = availableEmps.sort(() => 0.5 - Math.random());

            const toAdd = shuffled.slice(0, needed);
            for (const emp of toAdd) {
                await prisma.registration.create({
                    data: {
                        employeeId: emp.id,
                        mealEventId: meal.id,
                        locationId: defaultLocationId
                    }
                });
            }
            console.log(`   ✅ Successfully added ${toAdd.length} registrations.`);
        } else {
            console.log(`   ✨ Average is already <= ${TARGET_AVG.toLocaleString()} VNĐ. No action needed.`);
        }
    }

    console.log('✅ Data adjustment completed!');
}

main()
    .catch(e => {
        console.error('❌ Error adjusting data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
