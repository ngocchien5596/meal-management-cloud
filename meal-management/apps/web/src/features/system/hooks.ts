import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemApi } from './api';

export const useSystemConfig = () => {
    return useQuery({
        queryKey: ['system-config'],
        queryFn: systemApi.getConfigs,
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) =>
            systemApi.updateConfig(key, { value }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-config'] });
        },
    });
};

export const useRegistrationPresets = () => {
    return useQuery({
        queryKey: ['registration-presets'],
        queryFn: systemApi.getPresets,
    });
};

export const useDepartments = () => {
    return useQuery({
        queryKey: ['departments'],
        queryFn: systemApi.getDepartments,
    });
};

export const useCreateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: systemApi.createDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
    });
};

export const useUpdateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => systemApi.updateDepartment(id, name),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
    });
};

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: systemApi.deleteDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
    });
};

export const usePositions = () => {
    return useQuery({
        queryKey: ['positions'],
        queryFn: systemApi.getPositions,
    });
};

export const useCreatePosition = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: systemApi.createPosition,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
    });
};

export const useUpdatePosition = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => systemApi.updatePosition(id, name),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
    });
};

export const useDeletePosition = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: systemApi.deletePosition,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
    });
};

// --- Prices ---

export const usePrices = () => {
    return useQuery({
        queryKey: ['prices'],
        queryFn: systemApi.getPrices,
    });
};

export const useCreatePrice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: systemApi.createPrice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prices'] });
            queryClient.invalidateQueries({ queryKey: ['system-config'] });
        },
    });
};

export const useUpdatePrice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { price?: number; startDate?: string } }) =>
            systemApi.updatePrice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prices'] });
            queryClient.invalidateQueries({ queryKey: ['system-config'] });
        },
    });
};
