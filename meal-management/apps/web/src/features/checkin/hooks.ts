import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkinApi } from './api';
import toast from 'react-hot-toast';

export const useManualCheckin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: checkinApi.manualCheckin,
        onSuccess: (response: any, variables) => {
            if (response.success && response.data) {
                const { employee } = response.data;
                const msg = employee
                    ? `[NV: ${employee.employeeCode} - ${employee.fullName}] điểm danh thành công!`
                    : 'Check-in thành công!';
                toast.success(msg);
                queryClient.invalidateQueries({ queryKey: ['meal', variables.mealEventId] });
            } else {
                toast.error(response.error || 'Check-in thất bại');
            }
        },
        onError: (err: any) => {
            // Because lib/api interceptor rejects with error.response.data
            const employee = err?.employee;
            const baseError = err?.error || 'Có lỗi xảy ra khi check-in';

            const message = employee
                ? `[NV: ${employee.employeeCode} - ${employee.fullName}] ${baseError.toLowerCase()}`
                : baseError;

            toast.error(message);
        }
    });
};

export const useScanEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: checkinApi.scanEmployee,
        onSuccess: (response: any, variables) => {
            if (response.success && response.data) {
                const { employee } = response.data;
                const msg = employee
                    ? `[NV: ${employee.employeeCode} - ${employee.fullName}] quét mã thành công!`
                    : 'Quét mã thành công!';
                toast.success(msg);
                queryClient.invalidateQueries({ queryKey: ['meal', variables.mealEventId] });
            } else {
                toast.error(response.error || 'Quét mã thất bại');
            }
        },
        onError: (err: any) => {
            // Because lib/api interceptor rejects with error.response.data
            const employee = err?.employee;
            const baseError = err?.error || 'Có lỗi xảy ra khi quét mã';

            const message = employee
                ? `[NV: ${employee.employeeCode} - ${employee.fullName}] ${baseError.toLowerCase()}`
                : baseError;

            toast.error(message);
        }
    });
};

export const useScanGuest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: checkinApi.scanGuest,
        onSuccess: (response: any, variables) => {
            if (response.success && response.data) {
                const { guest } = response.data;
                const msg = guest
                    ? `[Khách: ${guest.fullName}] quét mã thành công!`
                    : 'Khách quét mã thành công!';
                toast.success(msg);
                queryClient.invalidateQueries({ queryKey: ['meal', variables.mealEventId] });
            } else {
                toast.error(response.error || 'Quét mã khách thất bại');
            }
        },
        onError: (err: any) => {
            const guest = err?.guest;
            const baseError = err?.error || 'Có lỗi xảy ra khi quét mã khách';

            const message = guest
                ? `[Khách: ${guest.fullName}] ${baseError.toLowerCase()}`
                : baseError;

            toast.error(message);
        }
    });
};

export const useSelfScan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: checkinApi.selfScan,
        onSuccess: (response: any) => {
            if (response.success && response.data) {
                queryClient.invalidateQueries({ queryKey: ['registration-calendar'] });
                queryClient.invalidateQueries({ queryKey: ['meal'] });
            } else {
                toast.error(response.error || 'Điểm danh thất bại');
            }
        },
        onError: (err: any) => {
            const employee = err?.employee;
            const baseError = err?.error || 'Có lỗi xảy ra khi quét mã';

            const message = employee
                ? `[NV: ${employee.employeeCode} - ${employee.fullName}] ${baseError.toLowerCase()}`
                : baseError;

            toast.error(message);
        }
    });
};
