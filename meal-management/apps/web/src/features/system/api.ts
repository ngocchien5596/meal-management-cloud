import { api } from '@/lib/api';
import type { SystemConfig, RegistrationPreset, Department, Position, UpdateConfigRequest, MealPriceConfig } from './types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const systemApi = {
    getConfigs: async () => {
        const response = await api.get<SystemConfig>('/config');
        return response.data;
    },

    updateConfig: async (key: string, data: UpdateConfigRequest) => {
        const response = await api.put<any>(`/config/${key}`, data);
        return response.data;
    },

    getPresets: async () => {
        const response = await api.get<RegistrationPreset[]>('/config/presets');
        return response.data;
    },

    getDepartments: async () => {
        const response = await api.get<Department[]>('/config/departments');
        return response.data;
    },

    createDepartment: async (name: string) => {
        const response = await api.post<Department>('/config/departments', { name });
        return response.data;
    },

    updateDepartment: async (id: string, name: string) => {
        const response = await api.put<Department>(`/config/departments/${id}`, { name });
        return response.data;
    },

    deleteDepartment: async (id: string) => {
        const response = await api.delete<any>(`/config/departments/${id}`);
        return response.data;
    },

    getPositions: async () => {
        const response = await api.get<Position[]>('/config/positions');
        return response.data;
    },

    createPosition: async (name: string) => {
        const response = await api.post<Position>('/config/positions', { name });
        return response.data;
    },

    updatePosition: async (id: string, name: string) => {
        const response = await api.put<Position>(`/config/positions/${id}`, { name });
        return response.data;
    },

    deletePosition: async (id: string) => {
        const response = await api.delete<any>(`/config/positions/${id}`);
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
};
