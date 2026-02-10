import { z } from 'zod';

export const registerMealSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    mealType: z.enum(['LUNCH', 'DINNER']),
});

export const quickRegisterSchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    mealTypes: z.array(z.enum(['LUNCH', 'DINNER'])).min(1),
});

export type RegisterMealFormData = z.infer<typeof registerMealSchema>;
export type QuickRegisterFormData = z.infer<typeof quickRegisterSchema>;
