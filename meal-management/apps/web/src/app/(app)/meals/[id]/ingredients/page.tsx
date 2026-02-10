'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, ConfirmDialog, CreateButton } from '@/components/ui';
import { useMealDetail, useDeleteIngredient, useAddIngredient, useUpdateIngredient } from '@/features/meals/hooks';
import { MealDetail, Ingredient } from '@/features/meals/api';

const PlusIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
);

interface IngredientFormProps {
    mealId: string;
    onSuccess: () => void;
    initialData?: Ingredient | null;
}

function IngredientForm({ mealId, onSuccess, initialData }: IngredientFormProps) {
    const addMutation = useAddIngredient();
    const updateMutation = useUpdateIngredient();
    const isEditing = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            quantity: formData.get('quantity') as string,
            unit: formData.get('unit') as string,
            unitPrice: formData.get('unitPrice') as string,
        };

        if (isEditing && initialData) {
            await updateMutation.mutateAsync({ id: initialData.id, mealId, data });
        } else {
            await addMutation.mutateAsync({ mealId, data });
        }
        onSuccess();
    };

    const isLoading = addMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Tên nguyên vật liệu</label>
                <Input name="name" defaultValue={initialData?.name} placeholder="Ví dụ: Rau muống, Thịt bò..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 ml-1">Số lượng</label>
                    <Input name="quantity" type="number" step="0.01" defaultValue={initialData?.quantity} placeholder="10.5" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 ml-1">Đơn vị</label>
                    <div className="relative">
                        <select
                            name="unit"
                            required
                            defaultValue={initialData?.unit || 'kg'}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                        >
                            <option value="kg">kg</option>
                            <option value="l">lít</option>
                            <option value="thùng">thùng</option>
                            <option value="cái">cái</option>
                            <option value="chai">chai</option>
                            <option value="quả">quả</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Đơn giá (VNĐ)</label>
                <Input name="unitPrice" type="number" defaultValue={initialData?.unitPrice} placeholder="25000" required />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-blue-200"
                disabled={isLoading}
            >
                {isLoading ? 'ĐANG LƯU...' : (isEditing ? 'CẬP NHẬT' : 'LƯU NGUYÊN VẬT LIỆU')}
            </Button>
        </form>
    );
}

export default function IngredientsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id) as { data: MealDetail | undefined, isLoading: boolean };
    const meal = response;
    const deleteMutation = useDeleteIngredient();

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: Ingredient) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ id: deleteId, mealId: id });
            setDeleteId(null);
        }
    };

    const items = meal?.ingredients || [];
    const totalCost = items.reduce((sum: number, item: Ingredient) => sum + item.totalPrice, 0);

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Chi tiết nguyên vật liệu</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Quản lý định mức và chi phí nguyên liệu cho bữa ăn (Tổng số mục NVL: {items.length})</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block border-r border-gray-200 pr-6 mr-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tổng kinh phí dự kiến</p>
                        <p className="text-lg font-black text-blue-600">
                            {totalCost.toLocaleString('vi-VN')} <span className="text-xs text-gray-400 font-bold ml-0.5">VNĐ</span>
                        </p>
                    </div>
                    {meal?.status === 'DRAFT' && (
                        <CreateButton onClick={handleOpenAdd}>
                            THÊM MỚI
                        </CreateButton>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Tên NVL</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Số lượng</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Đơn giá</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Thành tiền</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500 italic text-[15px]">
                                    Chưa có nguyên vật liệu nào được thêm.
                                </td>
                            </tr>
                        ) : (
                            items.map((item: Ingredient, idx: number) => (
                                <tr key={item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-[15px] font-medium text-gray-900">
                                        {item.name}
                                    </td>
                                    <td className="py-4 px-6 text-[15px] text-gray-700 text-center">
                                        <span className="font-medium text-gray-900">{item.quantity}</span> <span className="text-gray-500 text-sm">{item.unit}</span>
                                    </td>
                                    <td className="py-4 px-6 text-[15px] text-gray-700 text-center">
                                        {item.unitPrice.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="py-4 px-6 text-[15px] font-bold text-blue-600 text-center">
                                        {item.totalPrice.toLocaleString('vi-VN')}
                                    </td>
                                    <td className="py-4 px-6">
                                        {meal?.status === 'DRAFT' && (
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Sửa"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Cập nhật nguyên vật liệu" : "Thêm nguyên vật liệu mới"}
            >
                <IngredientForm
                    mealId={id}
                    onSuccess={() => setIsModalOpen(false)}
                    initialData={editingItem}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa nguyên vật liệu này không? Hành động này không thể hoàn tác."
                type="danger"
            />
        </div >
    );
}
