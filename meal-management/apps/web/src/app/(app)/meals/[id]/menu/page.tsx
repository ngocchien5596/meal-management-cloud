'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useMealDetail, useDeleteMenuItem, useAddMenuItem } from '@/features/meals/hooks';
import { MealDetail, MenuItem } from '@/features/meals/api';

const PlusIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

interface MenuItemFormProps {
    mealId: string;
    onSuccess: () => void;
}

function MenuItemForm({ mealId, onSuccess }: MenuItemFormProps) {
    const addMutation = useAddMenuItem();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        await addMutation.mutateAsync({ mealId, name });
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Tên món ăn</label>
                <Input name="name" placeholder="Ví dụ: Cơm trắng, Cá kho..." required />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-blue-200"
                disabled={addMutation.isPending}
            >
                {addMutation.isPending ? 'ĐANG LƯU...' : 'LƯU MÓN ĂN'}
            </Button>
        </form>
    );
}

export default function MenuPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id);
    const meal: MealDetail | undefined = response;
    const deleteMutation = useDeleteMenuItem();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ id: deleteId, mealId: id });
            setDeleteId(null);
        }
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
                    <CreateButton onClick={() => setIsAddModalOpen(true)}>
                        THÊM MÓN MỚI
                    </CreateButton>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
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
                                        <div className="flex items-center justify-end">
                                            {meal?.status === 'DRAFT' ? (
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon />
                                                </button>
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

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Thêm món ăn mới"
            >
                <MenuItemForm mealId={id} onSuccess={() => setIsAddModalOpen(false)} />
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
                title="Xác nhận xóa món ăn"
                description="Bạn có chắc chắn muốn xóa món ăn này khỏi thực đơn? Hành động này không thể hoàn tác."
                type="danger"
            />


            {/* <div className="mt-auto pt-6">
                <div className="bg-amber-50/50 rounded-[32px] p-6 border border-amber-100/50 flex items-center gap-6">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                        <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v2" /><path d="m16.2 4.2 1.4 1.4" /><path d="M18 12h2" /><path d="m16.2 19.8 1.4-1.4" /><path d="M12 20v2" /><path d="m7.8 19.8-1.4-1.4" /><path d="M4 12H2" /><path d="m7.8 4.2-1.4 1.4" /><circle cx="12" cy="12" r="4" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] leading-none mb-2">Ghi chú bếp thưởng</p>
                        <p className="text-sm font-bold text-amber-700 leading-relaxed italic">
                            Các món ăn cần được chuẩn bị trước 30 phút so với giờ bắt đầu để đảm bảo chất lượng phục vụ.
                        </p>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
