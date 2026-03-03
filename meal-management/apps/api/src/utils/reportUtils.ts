
// Logic for calculating report stats
// Extracted for testability

export function calculateReportStats(
    emp: any,
    checkins: any[],
    registrations: any[],
    priceConfigs: any[] = [] // [{ startDate, endDate, price }]
) {
    let totalRegistered = 0;
    let totalEaten = 0;
    let totalSkipped = 0;
    let totalCost = 0;
    let eatenCost = 0;
    let wasteCost = 0;

    // Map MealEventId -> Checkin Status
    const checkinMap = new Set(checkins.map(c => c.mealEventId));
    const now = new Date();

    registrations.forEach(reg => {
        totalRegistered++;
        let isSkipped = false;
        let isEaten = false;

        // Check if eaten
        if (checkinMap.has(reg.mealEventId)) {
            totalEaten++;
            isEaten = true;
        } else {
            // Only count as skipped if date is past
            const mealDate = new Date(reg.mealEvent.mealDate);
            // Compare only dates (set to 00:00:00)
            const d1 = new Date(mealDate).setHours(0, 0, 0, 0);
            const d2 = new Date(now).setHours(0, 0, 0, 0);

            if (d1 < d2) {
                totalSkipped++;
                isSkipped = true;
            }
        }

        // Calculate Cost if Eaten or Skipped
        if (isEaten || isSkipped) {
            const mDate = new Date(reg.mealEvent.mealDate);
            const validConfig = priceConfigs.find(cfg => {
                const start = new Date(cfg.startDate);
                start.setHours(0, 0, 0, 0);
                const end = cfg.endDate ? new Date(cfg.endDate) : null;
                if (end) end.setHours(23, 59, 59, 999);
                return start <= mDate && (!end || end >= mDate);
            });

            const price = validConfig ? validConfig.price : 0;
            totalCost += price;

            if (isEaten) eatenCost += price;
            if (isSkipped) wasteCost += price;
        }
    });

    return {
        id: emp.id,
        empCode: emp.employeeCode,
        name: emp.fullName || 'N/A',
        department: emp.department ? emp.department.name : 'N/A',
        meals: totalRegistered,
        eaten: totalEaten,
        skipped: totalSkipped,
        total: totalCost,
        eatenCost,
        wasteCost
    };
}
