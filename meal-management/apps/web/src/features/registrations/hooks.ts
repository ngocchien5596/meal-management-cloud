import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationApi } from './api';
import toast from 'react-hot-toast';

export const useRegistrationCalendar = (year: number, month: number) => {
    return useQuery({
        queryKey: ['registrations', year, month],
        queryFn: () => registrationApi.getCalendar(year, month),
    });
};

export const useToggleRegistration = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ date, mealType }: { date: string; mealType: 'LUNCH' | 'DINNER' }) =>
            registrationApi.toggleRegistration(date, mealType),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            const message = data.message || data.data?.message || 'Thao tác thành công';
            toast.success(message);
        },
        onError: (error: any) => {
            // error is already the response data because of the interceptor
            const msg = error.error?.message || error.message || (typeof error === 'string' ? error : 'Lỗi không xác định');
            toast.error(msg);
        }
    });
};

export const useApplyPreset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ presetId, year, month }: { presetId: string; year: number; month: number }) =>
            registrationApi.applyPreset(presetId, year, month),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
            const message = data.message || data.data?.message || 'Áp dụng mẫu thành công';
            toast.success(message);
        },
        onError: (error: any) => {
            // error is already the response data because of the interceptor
            const msg = error.error?.message || error.message || (typeof error === 'string' ? error : 'Lỗi không xác định');
            toast.error(msg);
        }
    });
};
