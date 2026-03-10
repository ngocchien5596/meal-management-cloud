"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MapPin, Plus, Edit, Trash2, X, Loader2, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface MealLocation {
    id: string;
    name: string;
    isDefault: boolean;
}

export default function MealLocationsPage() {
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<MealLocation | null>(null);
    const [name, setName] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch locations
    const { data, isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const res = await api.get<MealLocation[]>('/locations');
            return res.data;
        }
    });

    const locations = data || [];
    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (payload: Partial<MealLocation>) => {
            if (editingNode) {
                const res = await api.put(`/locations/${editingNode.id}`, payload);
                return res.data;
            } else {
                const res = await api.post('/locations', payload);
                return res.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            toast.success(editingNode ? 'Cập nhật thành công' : 'Thêm mới thành công');
            handleClose();
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || 'Đã có lỗi xảy ra';
            toast.error(msg);
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.delete(`/locations/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            toast.success('Xóa thành công');
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || 'Đã có lỗi xảy ra';
            toast.error(`Không thể xóa: ${msg}`);
        }
    });

    const handleOpenCreate = () => {
        setEditingNode(null);
        setName('');
        setIsDefault(false);
        setIsOpen(true);
    };

    const handleOpenEdit = (loc: MealLocation) => {
        setEditingNode(loc);
        setName(loc.name);
        setIsDefault(loc.isDefault);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditingNode(null);
        setName('');
        setIsDefault(false);
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Tên địa điểm không được để trống');
            return;
        }
        saveMutation.mutate({ name: name.trim(), isDefault });
    };

    const handleDelete = (loc: MealLocation) => {
        if (loc.isDefault) {
            toast.error('Không thể xóa địa điểm mặc định');
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa địa điểm: ${loc.name}?`)) {
            deleteMutation.mutate(loc.id);
        }
    };

    return (
        <div className="w-full min-h-screen bg-surface-bg px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-vttext-primary leading-none">Địa điểm ăn</h1>
                            <p className="text-sm text-vttext-muted mt-1.5 font-medium">Cấu hình danh mục các khu vực phục vụ suất ăn</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleOpenCreate}
                            className="h-10 px-4 flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Thêm địa điểm</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-[24px] border border-vtborder shadow-xl shadow-slate-200/50 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-vtborder flex flex-col lg:flex-row gap-4 items-center justify-between bg-white">
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm tên địa điểm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="h-10 px-4 bg-surface-2 border border-vtborder rounded-xl flex items-center gap-2.5 shrink-0 hidden sm:flex">
                                <span className="text-[10px] font-black text-vttext-muted uppercase tracking-widest">Tổng cộng</span>
                                <span className="text-sm font-black text-brand">{filteredLocations.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-vtborder">
                                    <th className="py-4 px-6 text-xs font-semibold text-vttext-muted uppercase tracking-wider w-[80px]">STT</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-vttext-muted uppercase tracking-wider">Tên địa điểm</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-vttext-muted uppercase tracking-wider">Trạng thái</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-vttext-muted uppercase tracking-wider text-right w-[120px]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-vttext-muted font-medium">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-brand" />
                                                <span>Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLocations.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-vttext-muted font-bold">
                                            Chưa có địa điểm nào được cấu hình
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLocations.map((loc: MealLocation, index: number) => (
                                        <tr key={loc.id} className="group hover:bg-brand-soft/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-bold font-mono text-vttext-muted tracking-wider">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-vttext-primary group-hover:text-brand transition-colors">
                                                {loc.name}
                                            </td>
                                            <td className="py-4 px-6">
                                                {loc.isDefault ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-state-greenSoft text-state-success border border-state-success/20">
                                                        Mặc định
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                        Tùy chọn
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenEdit(loc)}
                                                        className="p-2 hover:bg-brand-soft rounded-xl text-vttext-muted hover:text-brand transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(loc)}
                                                        disabled={loc.isDefault}
                                                        className={cn(
                                                            "p-2 rounded-xl transition-colors",
                                                            loc.isDefault ? "text-vttext-muted/30 cursor-not-allowed" : "hover:bg-state-redSoft text-vttext-muted hover:text-state-danger"
                                                        )}
                                                        title={loc.isDefault ? "Không thể xóa địa điểm mặc định" : "Xóa"}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Create/Edit */}
            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-[24px] overflow-hidden border border-vtborder">

                        <div className="px-6 py-5 border-b border-vtborder flex justify-between items-center bg-white">
                            <Dialog.Title className="text-lg font-black text-vttext-primary">
                                {editingNode ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}
                            </Dialog.Title>
                            <button onClick={handleClose} className="text-vttext-muted hover:text-vttext-primary p-2 hover:bg-surface-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-vttext-primary mb-2">
                                    Tên địa điểm <span className="text-brand">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-11 px-4 bg-surface-2 border border-vtborder rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand font-medium transition-all text-vttext-primary placeholder:text-vttext-muted/50"
                                    placeholder="VD: Nhà ăn, Văn phòng, Trạm B..."
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-vtborder text-brand focus:ring-brand transition-all cursor-pointer"
                                        checked={isDefault}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsDefault(e.target.checked)}
                                        disabled={editingNode?.isDefault}
                                    />
                                </div>
                                <span className={cn(
                                    "text-sm font-bold transition-colors",
                                    editingNode?.isDefault ? 'text-vttext-muted/50 cursor-not-allowed' : 'text-vttext-primary group-hover:text-brand'
                                )}>
                                    Đặt làm địa điểm mặc định
                                </span>
                            </label>
                        </div>

                        <div className="px-6 py-5 border-t border-vtborder flex justify-end gap-3 bg-slate-50/50">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2.5 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-primary hover:bg-surface-2 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover disabled:opacity-50 shadow-lg shadow-brand/20 transition-all flex items-center justify-center min-w-[120px]"
                            >
                                {saveMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    editingNode ? 'Cập nhật' : 'Lưu'
                                )}
                            </button>
                        </div>

                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
