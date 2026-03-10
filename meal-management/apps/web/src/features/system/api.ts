import { api, APIResponse } from '@/lib/api';
import type { SystemConfig, RegistrationPreset, Department, Position, UpdateConfigRequest, MealPriceConfig } from './types';

export const systemApi = {
    getConfigs: async () => {
        const response = await api.get<SystemConfig>('/configs');
        return response.data;
    },

    updateConfig: async (key: string, data: UpdateConfigRequest) => {
        const kebabKey = key.toLowerCase().replace(/_/g, '-');
        const response = await api.patch<any>(`/configs/${kebabKey}`, data);
        return response.data;
    },

    getPresets: async () => {
        const response = await api.get<RegistrationPreset[]>('/registration-presets');
        return response.data;
    },

    updatePreset: async (id: string, data: { locationId?: string | null }) => {
        const response = await api.put<RegistrationPreset>(`/registration-presets/${id}`, data);
        return response.data;
    },

    getDepartments: async () => {
        const response = await api.get<Department[]>('/departments');
        return response.data;
    },

    createDepartment: async (name: string) => {
        const response = await api.post<Department>('/departments', { name });
        return response.data;
    },

    updateDepartment: async (id: string, name: string) => {
        const response = await api.put<Department>(`/departments/${id}`, { name });
        return response.data;
    },

    deleteDepartment: async (id: string) => {
        const response = await api.delete<any>(`/departments/${id}`);
        return response.data;
    },

    getPositions: async () => {
        const response = await api.get<Position[]>('/positions');
        return response.data;
    },

    createPosition: async (name: string) => {
        const response = await api.post<Position>('/positions', { name });
        return response.data;
    },

    updatePosition: async (id: string, name: string) => {
        const response = await api.put<Position>(`/positions/${id}`, { name });
        return response.data;
    },

    deletePosition: async (id: string) => {
        const response = await api.delete<any>(`/positions/${id}`);
        return response.data;
    },

    getPrices: async () => {
        const response = await api.get<MealPriceConfig[]>('/prices');
        return response.data;
    },

    createPrice: async (data: { price: number; startDate: string }) => {
        const response = await api.post<MealPriceConfig>('/prices', data);
        return response.data;
    },

    updatePrice: async (id: string, data: { price?: number; startDate?: string }) => {
        const response = await api.put<any>(`/prices/${id}`, data);
        return response.data;
    },

    getLocations: async () => {
        const response = await api.get<any[]>('/locations');
        return response.data;
    },
};
