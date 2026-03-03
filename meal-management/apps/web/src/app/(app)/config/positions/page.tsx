'use client';

import { useState } from 'react';
import {
    usePositions,
    useCreatePosition,
    useUpdatePosition,
    useDeletePosition
} from '@/features/system';
import { ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import { Briefcase, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

export default function PositionsPage() {
    const { data: positions, isLoading } = usePositions();
    const createPos = useCreatePosition();
    const updatePos = useUpdatePosition();
    const deletePos = useDeletePosition();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPositions = positions?.filter(pos =>
        pos.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleSave = async () => {
        if (!newItemName.trim()) return;
        try {
            if (editingId) {
                await updatePos.mutateAsync({ id: editingId, name: newItemName });
            } else {
                await createPos.mutateAsync(newItemName);
            }
            setNewItemName('');
            setEditingId(null);
            setIsModalOpen(false);
            toast.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại sau';
            toast.error(`Thao tác thất bại: ${msg}`);
        }
    };

    const openEditModal = (pos: { id: string, name: string }) => {
        setEditingId(pos.id);
        setNewItemName(pos.name);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await deletePos.mutateAsync(confirmDeleteId);
            toast.success('Xóa thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại';
            toast.error(`Không thể xóa: ${msg}`);
        } finally {
            setConfirmDeleteId(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-vttext-muted">Đang tải danh sách...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-vttext-primary leading-none">Chức vụ</h1>
                            <p className="text-sm text-vttext-muted mt-1.5 font-medium">Quản lý danh mục vị trí công tác</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setNewItemName('');
                                setIsModalOpen(true);
                            }}
                            className="h-10 px-4 flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Thêm mới</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-[24px] border border-vtborder shadow-xl shadow-slate-200/50 overflow-hidden">
                    {/* Integrated Toolbar */}
                    <div className="p-4 border-b border-surface-2 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white">
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm tên chức vụ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="h-10 px-4 bg-surface-2 border border-vtborder rounded-xl flex items-center gap-2.5 shrink-0 hidden sm:flex">
                                <span className="text-[10px] font-black text-vttext-muted uppercase tracking-widest">Tổng cộng</span>
                                <span className="text-sm font-black text-brand">{filteredPositions.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[80px]">STT</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên chức vụ</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-[120px]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-vttext-muted">Đang tải danh sách...</td>
                                    </tr>
                                ) : filteredPositions.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-slate-400 font-bold">Không có dữ liệu phù hợp</td>
                                    </tr>
                                ) : (
                                    filteredPositions.map((pos: any, index: number) => (
                                        <tr key={pos.id} className="group hover:bg-brand-soft/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-bold font-mono text-vttext-muted tracking-wider">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-vttext-primary group-hover:text-brand transition-colors">
                                                {pos.name}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1 transition-all">
                                                    <button
                                                        onClick={() => openEditModal(pos)}
                                                        className="p-2 hover:bg-brand-soft rounded-xl text-vttext-muted hover:text-brand transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(pos.id)}
                                                        className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                                                        title="Xóa"
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

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b border-surface-2 flex justify-between items-center bg-white">
                                <h3 className="text-lg font-black text-vttext-primary">
                                    {editingId ? 'Cập nhật chức vụ' : 'Thêm chức vụ mới'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-vttext-muted hover:text-vttext-primary p-2 hover:bg-surface-2 rounded-xl transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-bold text-vttext-primary mb-2">Tên chức vụ</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full h-11 px-4 bg-surface-2 border border-vtborder rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand font-medium transition-all"
                                    placeholder="Nhập tên chức vụ..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                    }}
                                />
                            </div>
                            <div className="px-6 py-5 border-t border-surface-2 flex justify-end gap-3 bg-slate-50/50">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-primary hover:bg-surface-2 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!newItemName.trim() || createPos.isPending || updatePos.isPending}
                                    className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover disabled:opacity-50 shadow-lg shadow-brand/20 transition-all flex items-center justify-center min-w-[120px]"
                                >
                                    {createPos.isPending || updatePos.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        editingId ? 'Cập nhật' : 'Thêm mới'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmDialog
                    isOpen={!!confirmDeleteId}
                    onClose={() => setConfirmDeleteId(null)}
                    onConfirm={handleConfirmDelete}
                    isLoading={deletePos.isPending}
                    title="Xác nhận xóa chức vụ"
                    description="Bạn có chắc chắn muốn xóa chức vụ này? Tất cả nhân viên thuộc chức vụ này sẽ không còn chức vụ."
                    confirmText="Xác nhận xóa"
                    cancelText="Hủy bỏ"
                    type="danger"
                />
            </div>
        </div>
    );
}
