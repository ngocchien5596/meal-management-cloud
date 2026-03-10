"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';

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

    // Fetch locations
    const { data, isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const res = await api.get<MealLocation[]>('/locations');
            return res.data;
        }
    });
    
    const locations = data || [];

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
            toast.error('Tên định danh không được để trống');
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
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Cấu hình địa điểm ăn</h2>
                        </div>
                        
                        <button 
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                            onClick={handleOpenCreate}
                        >
                            <Plus className="w-4 h-4" />
                            Thêm địa điểm
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Tên địa điểm</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">Trạng thái</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : locations.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">
                                            Chưa có địa điểm nào được cấu hình
                                        </td>
                                    </tr>
                                ) : (
                                    locations.map((loc: MealLocation) => (
                                        <tr key={loc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {loc.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {loc.isDefault ? (
                                                     <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                                                        Mặc định
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                                                        Tùy chọn
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(loc)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(loc)}
                                                        disabled={loc.isDefault}
                                                        className={`p-1.5 rounded-lg transition-colors ${loc.isDefault ? 'text-slate-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
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
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl overflow-hidden">
                        
                        <div className="flex justify-between items-center mb-5">
                            <Dialog.Title className="text-lg font-bold text-slate-900">
                                {editingNode ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}
                            </Dialog.Title>
                            <button onClick={handleClose} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Tên địa điểm <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-900"
                                    placeholder="VD: Nhà ăn, Văn phòng, Trạm B..." 
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                                    checked={isDefault}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsDefault(e.target.checked)}
                                    disabled={editingNode?.isDefault}
                                />
                                <span className={`text-sm font-medium ${editingNode?.isDefault ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                    Đặt làm địa điểm mặc định
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>

                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
