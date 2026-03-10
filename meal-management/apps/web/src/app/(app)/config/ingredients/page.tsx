'use client';

import { useState } from 'react';
import {
    useCatalog,
    useCreateCatalogItem,
    useUpdateCatalogItem,
    useDeleteCatalogItem
} from '@/features/meals/hooks';
import { IngredientCatalogItem } from '@/features/meals/api';
import { Modal, Input, Button, ConfirmDialog, CreateButton } from '@/components/ui';
import { Edit, Trash2, Book, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface CatalogFormProps {
    onSuccess: () => void;
    initialData?: IngredientCatalogItem | null;
}

function CatalogForm({ onSuccess, initialData }: CatalogFormProps) {
    const createMutation = useCreateCatalogItem();
    const updateMutation = useUpdateCatalogItem();
    const isEditing = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            defaultUnit: formData.get('defaultUnit') as string,
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
                <label className="text-sm font-black text-slate-700 ml-1">Tên Nguyên liệu</label>
                <Input name="name" defaultValue={initialData?.name} placeholder="Ví dụ: Thịt bò, Gạo Thơm..." required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Đơn vị mặc định</label>
                <div className="relative">
                    <select
                        name="defaultUnit"
                        required
                        defaultValue={initialData?.defaultUnit || 'kg'}
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none appearance-none"
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
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-brand/20"
                disabled={isLoading}
            >
                {isLoading ? 'ĐANG LƯU...' : (isEditing ? 'CẬP NHẬT' : 'THÊM VÀO TỪ ĐIỂN')}
            </Button>
        </form>
    );
}

export default function IngredientCatalogPage() {
    const [search, setSearch] = useState('');
    const { data: catalog, isLoading } = useCatalog(search);
    const deleteMutation = useDeleteCatalogItem();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IngredientCatalogItem | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleOpenAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: IngredientCatalogItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteMutation.mutateAsync(deleteId);
                toast.success('Đã xóa khỏi từ điển');
                setDeleteId(null);
            } catch (error: any) {
                toast.error(error?.response?.data?.error || 'Không thể xóa nguyên liệu đang được sử dụng');
                setDeleteId(null);
            }
        }
    };

    const items = catalog || [];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 px-4 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                        <Book className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">Danh mục nguyên liệu</h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Quản lý danh mục Nguyên liệu chuẩn cho toàn hệ thống</p>
                    </div>
                </div>
                <CreateButton onClick={handleOpenAdd}>
                    THÊM NGUYÊN LIỆU
                </CreateButton>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nguyên liệu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng số mục</span>
                            <span className="text-sm font-black text-brand">{items.length}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 text-center">STT</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên Nguyên liệu</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Đơn vị chuẩn</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 font-bold">Đang tải dữ liệu...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic">
                                        Không tìm thấy nguyên liệu nào trong từ điển.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item: IngredientCatalogItem, idx: number) => (
                                    <tr key={item.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 group-hover:bg-white transition-colors">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-brand" />
                                                </div>
                                                <span className="text-[15px] font-bold text-slate-800">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider border border-slate-200">
                                                {item.defaultUnit}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="p-2 hover:bg-brand-soft rounded-xl text-slate-400 hover:text-brand transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(item.id)}
                                                    className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all"
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
                title={editingItem ? "Sửa nguyên liệu" : "Thêm vào từ điển"}
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
                title="Xóa khỏi từ điển?"
                description="Hệ thống sẽ không cho phép xóa nếu nguyên liệu này đã được sử dụng trong các báo cáo chi phí trước đây."
                type="danger"
            />
        </div>
    );
}
