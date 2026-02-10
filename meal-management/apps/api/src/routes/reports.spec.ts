
import { describe, it, expect } from 'vitest';
import { calculateReportStats } from '../utils/reportUtils';
import { addDays, subDays } from 'date-fns';

describe('calculateReportStats', () => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const tomorrow = addDays(today, 1);

    const mockEmp = {
        id: 'user-1',
        employeeCode: 'EMP001',
        fullName: 'Test User',
        department: { name: 'IT' }
    };

    const mockPriceConfigs = [
        { startDate: subDays(today, 10), endDate: subDays(today, 1), price: 20000 }, // Past price
        { startDate: today, endDate: null, price: 30000 } // Current price
    ];

    it('Scenario 1: Future Meal (Active/No Checkin)', () => {
        // Active registration tomorrow. No checkin.
        // Expected: Meals=1, Eaten=0, Skipped=0, Cost=0 (Future not counted yet financially in this logic, or depends on policy? Code says totalCost += price if eaten OR skipped)
        // Wait, logic says: if (isEaten || isSkipped) -> calculate cost.
        // Future date: isSkipped = false. isEaten = false.
        // So totalCost should be 0.
        const registrations = [{
            mealEventId: 'evt-1',
            isCancelled: false,
            mealEvent: { mealDate: tomorrow, mealType: 'LUNCH' }
        }];
        const checkins: any[] = [];

        const result = calculateReportStats(mockEmp, checkins, registrations, mockPriceConfigs);

        expect(result.meals).toBe(1);
        expect(result.eaten).toBe(0);
        expect(result.skipped).toBe(0);
        expect(result.total).toBe(0);
    });

    it('Scenario 2: Past Missed (Active/No Checkin) - Uses Historical Price', () => {
        // Active registration yesterday (Past Price range). No checkin.
        // Expected: Meals=1, Eaten=0, Skipped=1.
        // Cost should use Yesterday's price (20,000)
        const registrations = [{
            mealEventId: 'evt-2',
            isCancelled: false,
            mealEvent: { mealDate: yesterday, mealType: 'LUNCH' }
        }];
        const checkins: any[] = [];

        const result = calculateReportStats(mockEmp, checkins, registrations, mockPriceConfigs);

        expect(result.meals).toBe(1);
        expect(result.eaten).toBe(0);
        expect(result.skipped).toBe(1);
        expect(result.total).toBe(20000); // Historical price
    });

    it('Scenario 3: Past Eaten (Active/Checkin) - Uses Historical Price', () => {
        // Active registration yesterday. Checked in.
        // Expected: Meals=1, Eaten=1, Skipped=0, Cost=20000
        const registrations = [{
            mealEventId: 'evt-3',
            isCancelled: false,
            mealEvent: { mealDate: yesterday, mealType: 'LUNCH' }
        }];
        const checkins = [{
            mealEventId: 'evt-3',
            checkinTime: yesterday
        }];

        const result = calculateReportStats(mockEmp, checkins, registrations, mockPriceConfigs);

        expect(result.meals).toBe(1);
        expect(result.eaten).toBe(1);
        expect(result.skipped).toBe(0);
        expect(result.total).toBe(20000);
    });

    it('Scenario 4: Mixed Collection - Past & Current Pricing', () => {
        // 1. Yesterday (Old Price 20k, Skipped)
        // 2. Today (New Price 30k, Eaten)
        const registrations = [
            { mealEventId: '2', isCancelled: false, mealEvent: { mealDate: yesterday } },
            { mealEventId: '3', isCancelled: false, mealEvent: { mealDate: today } },
        ];
        const checkins = [
            { mealEventId: '3' }
        ];

        const result = calculateReportStats(mockEmp, checkins, registrations, mockPriceConfigs);

        expect(result.meals).toBe(2);
        expect(result.eaten).toBe(1);
        expect(result.skipped).toBe(1);
        expect(result.total).toBe(50000); // 20k + 30k
    });

    it('Scenario 5: Boundary Date Check (Meal on End Date)', () => {
        // Price valid from 1/2 to 4/2
        // Meal is on 4/2 at 12:00
        // Expected: Price should still apply
        // Issue suspected: Price EndDate might be 4/2 00:00, Meal is 4/2 12:00 -> fails >= check

        const feb1 = new Date('2026-02-01T00:00:00.000Z');
        const feb4 = new Date('2026-02-04T00:00:00.000Z');
        const mealTime = new Date('2026-02-04T12:00:00.000Z'); // Noon on end date

        const explicitConfigs = [
            { startDate: feb1, endDate: feb4, price: 26000 }
        ];

        const registrations = [{
            mealEventId: 'evt-5',
            isCancelled: false,
            mealEvent: { mealDate: mealTime, mealType: 'LUNCH' }
        }];
        const checkins = [{
            mealEventId: 'evt-5',
            checkinTime: mealTime
        }];

        const result = calculateReportStats(mockEmp, checkins, registrations, explicitConfigs);

        expect(result.total).toBe(26000);
    });
});
