'use client';

import { useState } from 'react';
import {
    useMenuCatalog,
    useCreateMenuCatalogItem,
    useUpdateMenuCatalogItem,
    useDeleteMenuCatalogItem
} from '@/features/meals/hooks';
import { MenuItemCatalogItem } from '@/features/meals/api';
import { Modal, Input, Button, ConfirmDialog, CreateButton } from '@/components/ui';
import { Edit, Trash2, BookOpen, Search, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';

interface CatalogFormProps {
    onSuccess: () => void;
    initialData?: MenuItemCatalogItem | null;
}

function CatalogForm({ onSuccess, initialData }: CatalogFormProps) {
    const createMutation = useCreateMenuCatalogItem();
    const updateMutation = useUpdateMenuCatalogItem();
    const isEditing = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
        };

        try {
            if (isEditing && initialData) {
                await updateMutation.mutateAsync({ id: initialData.id, data });
                toast.success('Cập nhật thành công');
            } else {
                await createMutation.mutateAsync(data);
                toast.success('Thêm mới thành công');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Có lỗi xảy ra');
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Tên món ăn mẫu</label>
                <Input name="name" defaultValue={initialData?.name} placeholder="Ví dụ: Cơm trắng, Cá kho tộ..." required />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-blue-200"
                disabled={isLoading}
            >
                {isLoading ? 'ĐANG LƯU...' : (isEditing ? 'CẬP NHẬT' : 'THÊM VÀO THỰC ĐƠN MẪU')}
            </Button>
        </form>
    );
}

export default function MenuCatalogPage() {
    const [search, setSearch] = useState('');
    const { data: catalog, isLoading } = useMenuCatalog(search);
    const deleteMutation = useDeleteMenuCatalogItem();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItemCatalogItem | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: MenuItemCatalogItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteMutation.mutateAsync(deleteId);
                toast.success('Đã xóa khỏi danh sách');
                setDeleteId(null);
            } catch (error: any) {
                toast.error(error?.response?.data?.error || 'Không thể xóa món ăn đang được sử dụng trong thực tế');
                setDeleteId(null);
            }
        }
    };

    const items = catalog || [];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 px-4 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">Thực đơn mẫu</h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Quản lý danh mục Món ăn chuẩn cho toàn hệ thống</p>
                    </div>
                </div>
                <CreateButton onClick={handleOpenAdd}>
                    THÊM MÓN MẪU
                </CreateButton>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm món ăn mẫu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng số mục</span>
                            <span className="text-sm font-black text-blue-600">{items.length}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 text-center">STT</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên món ăn mẫu</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center text-slate-400 font-bold">Đang tải dữ liệu...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center text-slate-400 font-bold italic">
                                        Chưa có món ăn nào trong thực đơn mẫu.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item: MenuItemCatalogItem, idx: number) => (
                                    <tr key={item.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 group-hover:bg-white transition-colors">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Utensils className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all font-bold"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all font-bold"
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Sửa món ăn mẫu" : "Thêm vào thực đơn mẫu"}
            >
                <CatalogForm
                    onSuccess={() => setIsModalOpen(false)}
                    initialData={editingItem}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Xóa khỏi thực đơn mẫu?"
                description="Bạn có chắc muốn xóa món ăn này? Thao tác này có thể bị chặn nếu món ăn đang được sử dụng trong thực tế."
                type="danger"
            />
        </div>
    );
}
