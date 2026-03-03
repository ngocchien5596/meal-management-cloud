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

const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const PlusCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2" />
    </svg>
);

export default function PositionsPage() {
    const { data: positions, isLoading } = usePositions();
    const createPos = useCreatePosition();
    const updatePos = useUpdatePosition();
    const deletePos = useDeletePosition();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
        <div className="bg-white rounded-xl border border-vtborder shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-vtborder flex items-center justify-between bg-vtbg-secondary/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <BriefcaseIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-vttext-primary leading-tight">Chức vụ</h3>
                        <p className="text-xs text-vttext-muted font-medium uppercase tracking-wider mt-0.5">Danh mục vị trí công tác</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setNewItemName('');
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-hover transition-all shadow-md shadow-brand/10"
                >
                    <PlusCircleIcon />
                    Thêm chức vụ
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-vtbg-secondary/20 border-b border-vtborder">
                            <th className="py-4 px-6 text-xs font-bold text-vttext-muted uppercase tracking-widest w-[80px]">STT</th>
                            <th className="py-4 px-6 text-xs font-bold text-vttext-muted uppercase tracking-widest">Tên chức vụ</th>
                            <th className="py-4 px-6 w-[120px] text-right font-bold text-vttext-muted uppercase tracking-widest">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-vtborder/50">
                        {positions?.map((pos, index) => (
                            <tr key={pos.id} className="hover:bg-vtbg-secondary/30 transition-colors group">
                                <td className="py-4 px-6 text-[15px] font-bold text-vttext-muted">{index + 1}</td>
                                <td className="py-4 px-6 text-[15px] text-vttext-primary font-bold">{pos.name}</td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(pos)}
                                            className="p-1.5 text-vttext-muted hover:text-brand hover:bg-brand-soft rounded-lg transition-all"
                                            title="Chỉnh sửa"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(pos.id)}
                                            className="p-1.5 text-vttext-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Xóa"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {positions?.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-12 text-center text-vttext-muted italic">
                                    Chưa có dữ liệu chức vụ.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 bg-vtbg-secondary/10 border-t border-vtborder text-xs text-vttext-muted font-bold">
                Tổng số: {positions?.length || 0} chức vụ
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-5 py-4 border-b border-vtborder flex justify-between items-center bg-vtbg-secondary/30">
                            <h3 className="font-bold text-vttext-primary">
                                {editingId ? 'Cập nhật chức vụ' : 'Thêm chức vụ mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-vttext-muted hover:text-vttext-primary">✕</button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-bold text-vttext-primary mb-2">Tên chức vụ</label>
                            <input
                                autoFocus
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full h-11 px-4 border border-vtborder rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-medium"
                                placeholder="Nhập tên chức vụ..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                }}
                            />
                        </div>
                        <div className="px-6 py-4 bg-vtbg-secondary/30 border-t border-vtborder flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-primary hover:bg-white/50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!newItemName.trim() || createPos.isPending || updatePos.isPending}
                                className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover disabled:opacity-50 shadow-lg shadow-brand/20 transition-all"
                            >
                                {createPos.isPending || updatePos.isPending ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới')}
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
                confirmText="Đồng ý xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
}
