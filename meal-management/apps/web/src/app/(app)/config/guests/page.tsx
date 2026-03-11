'use client';

import React, { useState } from 'react';
import { Card, CreateButton, Modal, Input, Button, ConfirmDialog } from '@/components/ui';
import { useGuestDirectories, useCreateGuestDirectory, useUpdateGuestDirectory, useDeleteGuestDirectory, GuestDirectory } from '@/features/guest-directory/api';
import { Edit, Trash2, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

export default function GuestDirectoryPage() {
    const { user } = useUser();
    const [search, setSearch] = useState('');
    const { data: directories = [], isLoading } = useGuestDirectories(search);

    const createMutation = useCreateGuestDirectory();
    const updateMutation = useUpdateGuestDirectory();
    const deleteMutation = useDeleteGuestDirectory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GuestDirectory | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: GuestDirectory) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const fullName = formData.get('fullName') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const note = formData.get('note') as string;

        if (!fullName.trim()) {
            toast.error('Vui lòng nhập họ tên khách!');
            return;
        }

        if (editingItem) {
            await updateMutation.mutateAsync({
                id: editingItem.id,
                data: { fullName, phoneNumber, note }
            });
        } else {
            await createMutation.mutateAsync({ fullName, phoneNumber, note });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Danh mục Khách mời</h2>
                    <p className="text-sm text-slate-500 mt-1">Quản lý danh bạ khách để chọn nhanh khi tạo khách mời cho Bữa ăn</p>
                </div>
                <CreateButton onClick={handleAdd}>
                    THÊM KHÁCH MỚI
                </CreateButton>
            </div>

            <Card className="p-0 overflow-hidden border border-slate-200">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full max-w-sm">
                        <Input
                            placeholder="Tìm kiếm theo tên khách..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                            className="bg-white"
                        />
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                        Tổng số: {directories.length} khách
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider w-20 text-center">STT</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và tên</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Số điện thoại</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Người tạo</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Ghi chú</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 font-bold">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : directories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-500 italic text-[15px]">
                                        Chưa có danh bạ khách nào.
                                    </td>
                                </tr>
                            ) : (
                                directories.map((item, idx) => (
                                    <tr key={item.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-[15px] font-bold text-slate-800 uppercase tracking-tight">
                                            {item.fullName}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-slate-600 font-medium">
                                            {item.phoneNumber || '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            {item.creator ? (
                                                <div className="flex items-center gap-1.5 text-[14px] text-slate-600">
                                                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-medium truncate max-w-[120px]" title={item.creator.fullName}>
                                                        {item.creator.fullName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Hệ thống</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-slate-500">
                                            {item.note || '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Ownership logic: Admins/HR can edit everything. Clerk can only edit their own. */}
                                                {(user?.role === 'ADMIN_SYSTEM' || user?.role === 'ADMIN_KITCHEN' || user?.role === 'HR' || item.createdBy === user?.id || item.createdBy === (user as any)?.employeeId) ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                                                            title="Sửa"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(item.id)}
                                                            className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-300 italic text-[13px]">Chỉ xem</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Sửa thông tin khách" : "Thêm khách mới vào danh bạ"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                        <Input
                            name="fullName"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            defaultValue={editingItem?.fullName || ''}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Số điện thoại</label>
                        <Input
                            name="phoneNumber"
                            placeholder="Ví dụ: 0987654321"
                            defaultValue={editingItem?.phoneNumber || ''}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Ghi chú (Không bắt buộc)</label>
                        <Input
                            name="note"
                            placeholder="Ví dụ: Công ty đối tác ABC"
                            defaultValue={editingItem?.note || ''}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full shadow-lg shadow-blue-200 uppercase font-bold tracking-wider"
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        {(createMutation.isPending || updateMutation.isPending) ? 'ĐANG LƯU...' : 'LƯU DANH BẠ'}
                    </Button>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
                title="Xác nhận xóa danh bạ"
                description="Bạn có chắc chắn muốn xóa khách này khỏi danh bạ? Dữ liệu của khách đã check-in trước đó ở các bữa ăn không bị ảnh hưởng."
                type="danger"
            />
        </div>
    );
}
