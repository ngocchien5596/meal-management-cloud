
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canModify, getCalendarHandler, toggleRegistrationHandler } from './registrations';
import { MealType } from '@prisma/client';

const { mockPrisma } = vi.hoisted(() => {
    return {
        mockPrisma: {
            mealEvent: {
                findMany: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
            },
            registration: {
                findUnique: vi.fn(),
                update: vi.fn(),
                create: vi.fn(),
            },
            $transaction: vi.fn(),
        }
    };
});

// Mock prisma default export
vi.mock('../lib/prisma.js', () => ({
    default: mockPrisma
}));

describe('Registrations Logic', () => {
    describe('canModify', () => {
        it('should return false for past dates', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(canModify(yesterday)).toBe(false);
        });

        it('should return true for future dates (3 days later)', () => {
            const future = new Date();
            future.setDate(future.getDate() + 3);
            expect(canModify(future)).toBe(true);
        });
    });

    describe('getCalendarHandler', () => {
        let req: any;
        let res: any;
        let next: any;

        beforeEach(() => {
            req = {
                params: { year: '2023', month: '10' },
                user: { employeeId: 'emp123' }
            };
            res = {
                json: vi.fn()
            };
            next = vi.fn();
            vi.clearAllMocks();
        });

        it('should return meal events including cancelled registrations', async () => {
            // Arrange
            const mockEvents = [
                { id: '1', mealDate: new Date(), registrations: [{ isCancelled: true }] }
            ];
            // @ts-ignore
            mockPrisma.mealEvent.findMany.mockResolvedValue(mockEvents);

            // Act
            await getCalendarHandler(req, res, next);

            // Assert
            expect(mockPrisma.mealEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
                include: expect.objectContaining({
                    registrations: {
                        where: { employeeId: 'emp123' }
                        // CRITICAL: Should NOT have isCancelled: false
                    }
                })
            }));

            // Check if the query specifically MISSES isCancelled: false in the where clause
            const calls = (mockPrisma.mealEvent.findMany as any).mock.calls;
            const arg = calls[0][0];
            const regWhere = arg.include.registrations.where;

            expect(regWhere).toEqual({ employeeId: 'emp123' });
            expect(regWhere).not.toHaveProperty('isCancelled');

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockEvents
            });
        });
    });
});
