'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useMealDetail, useDeleteMenuItem, useAddMenuItem, useUpdateMenuItem } from '@/features/meals/hooks';
import { MealDetail, MenuItem } from '@/features/meals/api';
import { Edit } from 'lucide-react';

const PlusIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

interface MenuItemFormProps {
    mealId: string;
    item?: MenuItem;
    onSuccess: () => void;
}

function MenuItemForm({ mealId, item, onSuccess }: MenuItemFormProps) {
    const addMutation = useAddMenuItem();
    const updateMutation = useUpdateMenuItem();
    const isEditing = !!item;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;

        if (isEditing) {
            await updateMutation.mutateAsync({ id: item.id, mealId, name });
        } else {
            await addMutation.mutateAsync({ mealId, name });
        }
        onSuccess();
    };

    const isPending = addMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Tên món ăn</label>
                <Input
                    name="name"
                    placeholder="Ví dụ: Cơm trắng, Cá kho..."
                    defaultValue={item?.name}
                    required
                    autoFocus
                />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-blue-200"
                disabled={isPending}
            >
                {isPending ? 'ĐANG LƯU...' : isEditing ? 'CẬP NHẬT MÓN ĂN' : 'LƯU MÓN ĂN'}
            </Button>
        </form>
    );
}

export default function MenuPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id);
    const meal: MealDetail | undefined = response;
    const deleteMutation = useDeleteMenuItem();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ id: deleteId, mealId: id });
            setDeleteId(null);
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const items = meal?.menuItems || [];

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Thực đơn bữa ăn</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Các món ăn phục vụ trong khung giờ này</p>
                </div>
                {meal?.status === 'DRAFT' && (
                    <CreateButton onClick={handleAdd}>
                        THÊM MÓN MỚI
                    </CreateButton>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Tên món ăn</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-gray-500 italic text-[15px]">
                                        Chưa có món ăn nào trong thực đơn.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item: MenuItem, idx: number) => (
                                    <tr key={item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-[15px] font-medium text-gray-900 uppercase tracking-tight">
                                            {item.name}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {meal?.status === 'DRAFT' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 hover:bg-brand-soft rounded-xl text-vttext-muted hover:text-brand transition-colors"
                                                            title="Sửa"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(item.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                            title="Xóa"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Đã khóa</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Sửa món ăn" : "Thêm món ăn mới"}
            >
                <MenuItemForm
                    mealId={id}
                    item={editingItem}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
                title="Xác nhận xóa món ăn"
                description="Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn? Thao tác này không thể hoàn tác."
                type="danger"
            />
        </div>
    );
}
