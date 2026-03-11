import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface GuestDirectory {
    id: string;
    fullName: string;
    phoneNumber?: string;
    note?: string;
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    creator?: {
        fullName: string;
    };
}

export const guestDirectoryApi = {
    getDirectories: (search?: string) =>
        api.get<GuestDirectory[]>('/guest-directory', { params: { search } })
            .then(res => res.data),

    createDirectory: (data: { fullName: string; phoneNumber?: string; note?: string; isActive?: boolean }) =>
        api.post<GuestDirectory>('/guest-directory', data)
            .then(res => res.data),

    updateDirectory: (id: string, data: { fullName?: string; phoneNumber?: string; note?: string; isActive?: boolean }) =>
        api.put<GuestDirectory>(`/guest-directory/${id}`, data)
            .then(res => res.data),

    deleteDirectory: (id: string) =>
        api.delete<{ success: boolean; message: string }>(`/guest-directory/${id}`)
            .then(res => res.data),
};

// React Query Hooks
export const useGuestDirectories = (search?: string) => {
    return useQuery({
        queryKey: ['guest-directories', search],
        queryFn: () => guestDirectoryApi.getDirectories(search),
        staleTime: 60 * 1000, // 1 minute
    });
};

export const useCreateGuestDirectory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: guestDirectoryApi.createDirectory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guest-directories'] });
            toast.success('Đã thêm khách mới vào danh bạ!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Lỗi khi thêm danh bạ');
        }
    });
};

export const useUpdateGuestDirectory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof guestDirectoryApi.updateDirectory>[1] }) =>
            guestDirectoryApi.updateDirectory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guest-directories'] });
            toast.success('Đã cập nhật thông tin khách!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Lỗi khi cập nhật danh bạ');
        }
    });
};

export const useDeleteGuestDirectory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: guestDirectoryApi.deleteDirectory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guest-directories'] });
            toast.success('Đã xóa khách khỏi danh bạ!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Lỗi khi xóa danh bạ');
        }
    });
};
