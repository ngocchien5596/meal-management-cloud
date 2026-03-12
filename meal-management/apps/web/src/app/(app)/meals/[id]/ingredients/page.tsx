'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, ConfirmDialog, CreateButton, CurrencyInput } from '@/components/ui';
import { useMealDetail, useDeleteIngredient, useAddIngredient, useUpdateIngredient, useCatalog } from '@/features/meals/hooks';
import { MealDetail, Ingredient, IngredientCatalogItem } from '@/features/meals/api';
import { Edit, Search, PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth';

const PlusIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
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

    const [searchTerm, setSearchTerm] = useState(initialData?.catalog?.name || '');
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<IngredientCatalogItem | null>(initialData?.catalog || null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unit, setUnit] = useState(initialData?.unit || 'kg');

    const { data: catalog } = useCatalog(searchTerm);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            catalogId: selectedCatalogItem?.id || initialData?.catalogId || undefined,
            name: searchTerm,
            quantity: formData.get('quantity') as string,
            unit: unit,
            unitPrice: formData.get('unitPrice') as string,
        };

        if (isEditing && initialData) {
            await updateMutation.mutateAsync({ id: initialData.id, mealId, data });
        } else {
            await addMutation.mutateAsync({ mealId, data });
        }
        onSuccess();
    };

    const handleSelect = (item: IngredientCatalogItem) => {
        setSearchTerm(item.name);
        setSelectedCatalogItem(item);
        setUnit(item.defaultUnit);
        setShowDropdown(false);
    };

    const isLoading = addMutation.isPending || updateMutation.isPending;

    // Filtered results for the dropdown
    const suggestions = Array.isArray(catalog) ? catalog : [];
    const exactMatch = suggestions.find((s: IngredientCatalogItem) => s.name.toLowerCase() === searchTerm.toLowerCase());
    const showQuickAdd = searchTerm.length > 0 && !exactMatch;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
                <label className="text-sm font-black text-slate-700 ml-1">Tên Nguyên liệu</label>
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Tìm kiếm hoặc nhập mới..."
                        required
                        className="pl-10"
                        autoComplete="off"
                        maxLength={100}
                    />
                </div>

                {showDropdown && (searchTerm || suggestions.length > 0) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                        {suggestions.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between border-b border-slate-50 last:border-0"
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">{item.name}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.defaultUnit}</span>
                                </div>
                            </button>
                        ))}
                        {showQuickAdd && (
                            <button
                                type="button"
                                onClick={() => setShowDropdown(false)}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 text-blue-600 bg-blue-50/30"
                            >
                                <PlusCircle className="w-5 h-5" />
                                <span className="font-bold">{searchTerm} (Thêm mới)</span>
                            </button>
                        )}
                        {!showQuickAdd && suggestions.length === 0 && (
                            <div className="px-4 py-8 text-center text-slate-400 text-sm font-medium">
                                Gõ để tìm kiếm hoặc thêm mới...
                            </div>
                        )}
                    </div>
                )}
                {showDropdown && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                )}
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
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                        >
                            <option value="kg">kg</option>
                            <option value="l">lít</option>
                            <option value="thùng">thùng</option>
                            <option value="cái">cái</option>
                            <option value="chai">chai</option>
                            <option value="quả">quả</option>
                            <option value="bó">bó</option>
                            <option value="gói">gói</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Đơn giá (VNĐ)</label>
                <CurrencyInput name="unitPrice" defaultValue={initialData?.unitPrice} placeholder="25.000" required maxLength={12} />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-blue-200"
                disabled={isLoading}
            >
                {isLoading ? 'ĐANG LƯU...' : (isEditing ? 'CẬP NHẬT' : 'LƯU Nguyên liệu')}
            </Button>
        </form>
    );
}

export default function IngredientsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id) as { data: MealDetail | undefined, isLoading: boolean };
    const meal = response;
    const deleteMutation = useDeleteIngredient();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN_KITCHEN' || user?.role === 'ADMIN_SYSTEM';

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
                    <h3 className="text-xl font-bold text-gray-900">Chi tiết Nguyên liệu</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Quản lý định mức và chi phí nguyên liệu cho bữa ăn (Tổng số mục NVL: {items.length})</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block border-r border-gray-200 pr-6 mr-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tổng kinh phí dự kiến</p>
                        <p className="text-lg font-black text-blue-600">
                            {totalCost.toLocaleString('vi-VN')} <span className="text-xs text-gray-400 font-bold ml-0.5">VNĐ</span>
                        </p>
                    </div>
                    {meal?.status === 'DRAFT' && isAdmin && (
                        <CreateButton onClick={handleOpenAdd}>
                            THÊM MỚI
                        </CreateButton>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left border-collapse">
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
                                        Chưa có Nguyên liệu nào được thêm.
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
                                            {item.catalog.name}
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
                                            {meal?.status === 'DRAFT' && isAdmin && (
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="p-2 hover:bg-brand-soft rounded-xl text-vttext-muted hover:text-brand transition-colors"
                                                        title="Sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
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
            </div>


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Cập nhật Nguyên liệu" : "Thêm Nguyên liệu mới"}
                contentClassName="overflow-visible"
            >
                <div className="min-h-[450px]">
                    <IngredientForm
                        mealId={id}
                        onSuccess={() => setIsModalOpen(false)}
                        initialData={editingItem}
                    />
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa Nguyên liệu này không? Thao tác này không thể hoàn tác."
                type="danger"
            />
        </div >
    );
}
