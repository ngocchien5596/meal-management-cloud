import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                const shiftDate = (date: any, key: string) => {
                    if (date instanceof Date) {
                        // EXCLUDE 'mealDate' from shifting because it's a pure @db.Date field.
                        // Also exclude range filters if they are sub-keys of mealDate (checked in transformArgs)
                        if (key === 'mealDate' || ['gte', 'lte', 'gt', 'lt', 'equals', 'in'].includes(key)) {
                            // Note: This logic assumes range filters like 'gte' on MealEvent are always for mealDate.
                            // In this app, that is currently true for all critical registration logic.
                            return date;
                        }
                        return new Date(date.getTime() + 7 * 60 * 60 * 1000);
                    }
                    return date;
                };

                const unshiftDate = (date: any, key: string) => {
                    if (date instanceof Date) {
                        if (key === 'mealDate' || ['gte', 'lte', 'gt', 'lt', 'equals', 'in'].includes(key)) return date;
                        return new Date(date.getTime() - 7 * 60 * 60 * 1000);
                    }
                    return date;
                };

                // Non-mutating processArgs with key propagation
                const transformArgs = (obj: any, parentKey?: string): any => {
                    if (!obj || typeof obj !== 'object') return obj;

                    if (Array.isArray(obj)) {
                        return obj.map(item => transformArgs(item, parentKey));
                    }

                    const newObj: any = {};
                    for (const key in obj) {
                        const value = obj[key];
                        // If current key is 'mealDate', propagate it down to its children (gte, lte, etc.)
                        const effectiveKey = (key === 'mealDate' || parentKey === 'mealDate') ? 'mealDate' : key;

                        if (value instanceof Date) {
                            newObj[key] = shiftDate(value, effectiveKey);
                        } else if (typeof value === 'object' && value !== null) {
                            newObj[key] = transformArgs(value, effectiveKey);
                        } else {
                            newObj[key] = value;
                        }
                    }
                    return newObj;
                };

                const transformResult = (obj: any, parentKey?: string): any => {
                    if (!obj || typeof obj !== 'object') return obj;

                    if (Array.isArray(obj)) {
                        return obj.map(item => transformResult(item, parentKey));
                    }

                    const newObj: any = {};
                    for (const key in obj) {
                        const value = obj[key];
                        const effectiveKey = (key === 'mealDate' || parentKey === 'mealDate') ? 'mealDate' : key;

                        if (value instanceof Date) {
                            newObj[key] = unshiftDate(value, effectiveKey);
                        } else if (typeof value === 'object' && value !== null) {
                            newObj[key] = transformResult(value, effectiveKey);
                        } else {
                            newObj[key] = value;
                        }
                    }
                    return newObj;
                };

                // Clone and prepare args
                let newArgs = { ...args };

                // Inject timestamps for write operations
                if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(operation)) {
                    const now = new Date();

                    const inject = (obj: any): any => {
                        if (!obj || typeof obj !== 'object') return obj;
                        const newObj = { ...obj };

                        // Handle models with createdAt/updatedAt
                        if (model && ['Department', 'Position', 'Employee', 'Account', 'MealEvent', 'Registration', 'Guest', 'Ingredient', 'MenuItem', 'SystemConfig', 'MealReview'].includes(model)) {
                            if (operation === 'create' || (operation === 'upsert' && obj === (args as any)?.create)) {
                                if ((newObj as any).createdAt === undefined) (newObj as any).createdAt = now;
                            }
                        }
                        if (model && ['Department', 'Position', 'Employee', 'Account', 'MealEvent', 'Registration', 'Ingredient', 'SystemConfig', 'MealReview', 'MealPriceConfig'].includes(model)) {
                            if ((newObj as any).updatedAt === undefined) (newObj as any).updatedAt = now;
                        }

                        // Special case: CheckinLog
                        if (model === 'CheckinLog') {
                            if ((newObj as any).checkinTime === undefined) (newObj as any).checkinTime = now;
                        }
                        return newObj;
                    };

                    if (operation === 'upsert') {
                        const _args = args as any;
                        if (_args.create) (newArgs as any).create = inject(_args.create);
                        if (_args.update) (newArgs as any).update = inject(_args.update);
                    } else if ((args as any)?.data) {
                        const _args = args as any;
                        if (Array.isArray(_args.data)) {
                            (newArgs as any).data = _args.data.map(inject);
                        } else {
                            (newArgs as any).data = inject(_args.data);
                        }
                    }
                }

                // Apply date shifting to the cloned/injected args
                newArgs = transformArgs(newArgs);

                const result = await query(newArgs);

                return transformResult(result);
            },
        },
    },
});

export default prisma;
