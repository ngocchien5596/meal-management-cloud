
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
        // (Assuming we charge for skipped meals too, which is implied by "totalSkipped" being tracked financially usually)
        if (isEaten || isSkipped) {
            const mDate = new Date(reg.mealEvent.mealDate);
            // specific logic: Find price config valid for mDate
            // Config matches if startDate <= mDate AND (endDate == null OR endDate >= mDate)

            // Sort to ensure we get likely matches, but we can just findFirst
            // In case of overlap errors in DB (shouldn't happen), assume first match.
            const validConfig = priceConfigs.find(cfg => {
                const start = new Date(cfg.startDate);
                start.setHours(0, 0, 0, 0);

                const end = cfg.endDate ? new Date(cfg.endDate) : null;
                if (end) {
                    end.setHours(23, 59, 59, 999);
                }

                // Check if mealDate is within range [start, end]
                return start <= mDate && (!end || end >= mDate);
            });

            // Default to 0 or fallback price if not found (e.g. 25000 legacy?)
            // Putting 0 safe for now or maybe log error?
            const price = validConfig ? validConfig.price : 0;
            totalCost += price;
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
        total: totalCost
    };
}
