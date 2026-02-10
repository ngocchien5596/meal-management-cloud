import { api } from '@/lib/api';

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: { message: string; code: string };
}

export interface MealEvent {
    id: string;
    mealDate: string;
    mealType: 'LUNCH' | 'DINNER';
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
    registrations: any[];
    checkins: any[];
}

export const registrationApi = {
    getCalendar: async (year: number, month: number) => {
        const response = await api.get<MealEvent[]>(`/registrations/calendar/${year}/${month}`);
        return response.data;
    },

    async toggleRegistration(date: string, mealType: 'LUNCH' | 'DINNER'): Promise<ApiResponse<any>> {
        return api.post<any>('/registrations', { date, mealType });
    },

    async applyPreset(presetId: string, year: number, month: number): Promise<ApiResponse<any>> {
        return api.post<any>('/registrations/preset', { presetId, year, month });
    },

    async getServerTime(): Promise<ApiResponse<{ serverTime: string; timezone: string }>> {
        return api.get<{ serverTime: string; timezone: string }>('/config/server-time');
    }
};
