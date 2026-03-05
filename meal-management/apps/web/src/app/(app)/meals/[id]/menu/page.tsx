'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useMealDetail, useDeleteMenuItem, useAddMenuItem, useUpdateMenuItem, useMenuCatalog } from '@/features/meals/hooks';
import { MealDetail, MenuItem, MenuItemCatalogItem } from '@/features/meals/api';
import { Edit, Search, PlusCircle, Utensils } from 'lucide-react';

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

    const [name, setName] = useState(item?.catalog?.name || '');
    const [catalogId, setCatalogId] = useState<string | undefined>(item?.catalogId);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { data: catalog } = useMenuCatalog(name);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditing) {
            await updateMutation.mutateAsync({ id: item!.id, mealId, catalogId: catalogId || item!.catalogId });
        } else {
            await addMutation.mutateAsync({ mealId, name, catalogId });
        }
        onSuccess();
    };

    const isPending = addMutation.isPending || updateMutation.isPending;

    const selectSuggestion = (suggestion: MenuItemCatalogItem) => {
        setName(suggestion.name);
        setCatalogId(suggestion.id);
        setShowSuggestions(false);
    };

    const handleNameChange = (val: string) => {
        setName(val);
        setCatalogId(undefined); // Clear catalog link if manually typing
        setShowSuggestions(true);
    };

    const suggestions = Array.isArray(catalog) ? catalog : [];
    const exactMatch = suggestions.find(s => s.name.toLowerCase() === name.toLowerCase());
    const showQuickAdd = name.length > 0 && !exactMatch;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative" ref={wrapperRef}>
                <label className="text-sm font-black text-slate-700 ml-1">Tên món ăn</label>
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        name="name"
                        placeholder="Ví dụ: Cơm trắng, Cá kho..."
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        className="pl-10"
                        required
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                {showSuggestions && (name.length > 0 || suggestions.length > 0) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {suggestions.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => selectSuggestion(s)}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                            >
                                <Utensils className="w-4 h-4 text-slate-400" />
                                <span className="text-[15px] font-bold text-slate-700 uppercase">{s.name}</span>
                            </button>
                        ))}

                        {showQuickAdd && (
                            <button
                                type="button"
                                onClick={() => setShowSuggestions(false)}
                                className="w-full px-4 py-3 text-left bg-blue-50/50 hover:bg-blue-50 flex items-center gap-3 transition-colors text-blue-600"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <div className="flex flex-col">
                                    <span className="font-bold">{name} (Thêm mới)</span>
                                </div>
                            </button>
                        )}
                    </div>
                )}
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

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Thực đơn bữa ăn</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Các món ăn phục vụ trong khung giờ này (Tổng số món: {items.length})</p>
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center text-slate-400 font-bold">Đang tải...</td>
                                </tr>
                            ) : items.length === 0 ? (
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
                                        <td className="py-4 px-6 text-[15px] font-bold text-gray-900 uppercase tracking-tight">
                                            {item.catalog?.name || 'Món ăn'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {meal?.status === 'DRAFT' ? (
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
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
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
                contentClassName="overflow-visible"
            >
                <div className="min-h-[350px]">
                    <MenuItemForm
                        mealId={id}
                        item={editingItem}
                        onSuccess={() => setIsModalOpen(false)}
                    />
                </div>
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
