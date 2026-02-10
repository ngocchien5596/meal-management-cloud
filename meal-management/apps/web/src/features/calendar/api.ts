import { apiClient } from '@/lib/api';
import type { CalendarMonth, MealRegistration, RegisterMealRequest, MealType } from './types';

export const calendarApi = {
    getCalendar: async (year: number, month: number) => {
        const res = await apiClient.get<CalendarMonth>(`/calendar?year=${year}&month=${month}`);
        return res.data;
    },

    getRegistrations: async (year: number, month: number) => {
        const res = await apiClient.get<MealRegistration[]>(`/registrations?year=${year}&month=${month}`);
        return res.data;
    },

    registerMeal: async (data: RegisterMealRequest) => {
        const res = await apiClient.post<MealRegistration>('/registrations', data);
        return res.data;
    },

    cancelMeal: async (registrationId: string) => {
        const res = await apiClient.delete<void>(`/registrations/${registrationId}`);
        return res.data;
    },

    quickRegister: async (startDate: string, endDate: string, mealTypes: MealType[]) => {
        const res = await apiClient.post<MealRegistration[]>('/registrations/bulk', {
            startDate,
            endDate,
            mealTypes,
        });
        return res.data;
    },
};
