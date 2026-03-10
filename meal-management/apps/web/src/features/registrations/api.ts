import { api, APIResponse } from '@/lib/api';

export interface MenuItem {
    id: string;
    catalog: {
        name: string;
    };
}

export interface MealEvent {
    id: string;
    mealDate: string;
    mealType: 'LUNCH' | 'DINNER';
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
    registrations: any[];
    checkins: any[];
    menuItems: MenuItem[];
    qrToken?: string;
}

export const registrationApi = {
    getCalendar: async (year: number, month: number) => {
        const response = await api.get<MealEvent[]>('/registrations', { params: { year, month } });
        return response.data;
    },

    async toggleRegistration(date: string, mealType: 'LUNCH' | 'DINNER', locationId?: string): Promise<APIResponse<any>> {
        return api.post<any>('/registrations', { date, mealType, locationId });
    },

    async applyPreset(presetId: string, year: number, month: number, locationId?: string): Promise<APIResponse<any>> {
        return api.post<any>('/registrations/preset', { presetId, year, month, locationId });
    },

    async getServerTime(): Promise<APIResponse<{ serverTime: string; timezone: string }>> {
        return api.get<{ serverTime: string; timezone: string }>('/system/time');
    },

    async updateRegistrationLocation(date: string, mealType: 'LUNCH' | 'DINNER', locationId?: string): Promise<APIResponse<any>> {
        return api.patch<any>('/registrations/location', { date, mealType, locationId });
    }
};
