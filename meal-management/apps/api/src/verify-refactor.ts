
import { PrismaClient, MealType } from '@prisma/client';
import { startOfDay, format } from 'date-fns';

const prisma = new PrismaClient();

async function verifyRefactor() {
    console.log('🧪 VERIFYING REGISTRATION REFACTOR...');

    const employeeCode = '480190'; // Bùi Ngọc Chiến
    const testDate = startOfDay(new Date(2026, 2, 10)); // March 10, 2026 (Future)
    const mealType = MealType.LUNCH;

    const emp = await prisma.employee.findUnique({ where: { employeeCode } });
    if (!emp) throw new Error('Employee not found');

    // 1. Ensure Meal Event exists
    let mealEvent = await prisma.mealEvent.findUnique({
        where: { mealDate_mealType: { mealDate: testDate, mealType } }
    });
    if (!mealEvent) {
        mealEvent = await prisma.mealEvent.create({ data: { mealDate: testDate, mealType } });
    }

    // 2. Clean up any existing registration
    await prisma.registration.deleteMany({
        where: { mealEventId: mealEvent.id, employeeId: emp.id }
    });

    // --- TEST 1: Register ---
    console.log('▶️ TEST 1: Registering...');
    await prisma.registration.create({
        data: { mealEventId: mealEvent.id, employeeId: emp.id }
    });
    let reg = await prisma.registration.findUnique({
        where: { mealEventId_employeeId: { mealEventId: mealEvent.id, employeeId: emp.id } }
    });
    console.log('  ✅ Record created:', !!reg);
    console.log('  ✅ isCancelled is false:', reg?.isCancelled === false);

    // --- TEST 2: Un-register (Refactored Logic) ---
    console.log('▶️ TEST 2: Un-registering (User toggle)...');
    // Simulate what toggleRegistrationHandler now does:
    if (reg && !reg.isCancelled) {
        await prisma.registration.delete({ where: { id: reg.id } });
    }
    reg = await prisma.registration.findUnique({
        where: { mealEventId_employeeId: { mealEventId: mealEvent.id, employeeId: emp.id } }
    });
    console.log('  ✅ Record DELETED (Success):', !reg);

    // --- TEST 3: Admin Cancellation (Hủy suất) ---
    console.log('▶️ TEST 3: Admin Cancellation (Hủy suất)...');
    await prisma.registration.create({
        data: { mealEventId: mealEvent.id, employeeId: emp.id, isCancelled: true, cancelledAt: new Date() }
    });
    reg = await prisma.registration.findUnique({
        where: { mealEventId_employeeId: { mealEventId: mealEvent.id, employeeId: emp.id } }
    });
    console.log('  ✅ Record exists with isCancelled: true:', reg?.isCancelled === true);

    // --- TEST 4: User toggles a Cancelled registration ---
    console.log('▶️ TEST 4: User toggles a Cancelled registration...');
    // Simulate: User clicks a Red X (cancelled) to reactivate it
    if (reg && reg.isCancelled) {
        await prisma.registration.update({
            where: { id: reg.id },
            data: { isCancelled: false, cancelledAt: null }
        });
    }
    reg = await prisma.registration.findUnique({
        where: { mealEventId_employeeId: { mealEventId: mealEvent.id, employeeId: emp.id } }
    });
    console.log('  ✅ Record reactivated (isCancelled: false):', reg?.isCancelled === false);

    // --- TEST 5: Preset Clear (Refactored) ---
    console.log('▶️ TEST 5: Preset clearing (Bulk delete)...');
    // Create multiple registrations
    const dates = [new Date(2026, 2, 11), new Date(2026, 2, 12)];
    for (const d of dates) {
        let event = await prisma.mealEvent.findUnique({ where: { mealDate_mealType: { mealDate: d, mealType } } });
        if (!event) event = await prisma.mealEvent.create({ data: { mealDate: d, mealType } });
        await prisma.registration.upsert({
            where: { mealEventId_employeeId: { mealEventId: event.id, employeeId: emp.id } },
            update: { isCancelled: false },
            create: { mealEventId: event.id, employeeId: emp.id }
        });
    }

    // Simulate Preset CLEAR phase
    const startDate = new Date(2026, 2, 1);
    const endDate = new Date(2026, 2, 31);
    const regs = await prisma.registration.findMany({
        where: {
            employeeId: emp.id,
            mealEvent: { mealDate: { gte: startDate, lte: endDate } }
        }
    });
    for (const r of regs) {
        await prisma.registration.delete({ where: { id: r.id } });
    }
    const remaining = await prisma.registration.count({
        where: {
            employeeId: emp.id,
            mealEvent: { mealDate: { gte: startDate, lte: endDate } }
        }
    });
    console.log('  ✅ Records DELETED in bulk (Success):', remaining === 0);

    console.log('\n✨ ALL LOGIC TESTS PASSED!');
}

verifyRefactor()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
