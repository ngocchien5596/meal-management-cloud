'use client';

import { useState, useRef } from 'react';
import {
    usePrices,
    useCreatePrice,
    useUpdatePrice
} from '@/features/system';
import { format, parseISO, addDays } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

import { Banknote, Plus, Edit, Calendar } from 'lucide-react';

export default function PriceHistoryPage() {
    const { data: prices, isLoading } = usePrices();
    const createPrice = useCreatePrice();
    const updatePrice = useUpdatePrice();
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [activeModal, setActiveModal] = useState<boolean>(false);
    const [wizardStep, setWizardStep] = useState<'selection' | 'input'>('selection');
    const [priceMode, setPriceMode] = useState<'tomorrow' | 'custom'>('tomorrow');
    const [newPriceValue, setNewPriceValue] = useState('');
    const [newPriceDate, setNewPriceDate] = useState('');
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [isLatestPrice, setIsLatestPrice] = useState(false);

    const handleSelectPriceMode = (mode: 'tomorrow' | 'custom') => {
        setPriceMode(mode);
        if (mode === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setNewPriceDate(format(tomorrow, 'yyyy-MM-dd'));
        } else {
            setNewPriceDate('');
        }
        setWizardStep('input');
    }

    const handleSavePrice = async () => {
        if (!newPriceValue || (!editingPriceId && !newPriceDate)) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            if (editingPriceId) {
                await updatePrice.mutateAsync({
                    id: editingPriceId,
                    data: {
                        price: Number(newPriceValue),
                        startDate: newPriceDate || undefined
                    }
                });
                toast.success('Cập nhật giá thành công!');
            } else {
                await createPrice.mutateAsync({
                    price: Number(newPriceValue),
                    startDate: newPriceDate
                });
                toast.success('Thêm giá mới thành công!');
            }
            setActiveModal(false);
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message || error?.message || 'Lỗi không xác định';
            toast.error(`Thất bại: ${msg}`);
        }
    };

    const openCreatePriceModal = () => {
        setEditingPriceId(null);
        setNewPriceValue('');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setNewPriceDate(format(tomorrow, 'yyyy-MM-dd'));
        setIsLatestPrice(true);
        setWizardStep('selection');
        setPriceMode('tomorrow');
        setActiveModal(true);
    }

    const openEditPriceModal = (price: any) => {
        setEditingPriceId(price.id);
        setNewPriceValue(price.price.toString());
        const dateStr = format(parseISO(price.startDate), 'yyyy-MM-dd');
        setNewPriceDate(dateStr);
        setIsLatestPrice(!price.endDate);
        setWizardStep('input');
        setActiveModal(true);
    }

    if (isLoading) return <div className="p-8 text-center text-vttext-muted">Đang tải lịch sử giá...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                            <Banknote className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-vttext-primary leading-none">Lịch sử giá ăn</h1>
                            <p className="text-sm text-vttext-muted mt-1.5 font-medium">Bảng kê khai thông tin biến động giá suất ăn</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={openCreatePriceModal}
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
                        <div className="flex flex-1 items-center font-bold text-vttext-primary text-sm pl-2">
                            Lịch sử thay đổi đơn giá
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="h-10 px-4 bg-surface-2 border border-vtborder rounded-xl flex items-center gap-2.5 shrink-0 hidden sm:flex">
                                <span className="text-[10px] font-black text-vttext-muted uppercase tracking-widest">Tổng bản ghi</span>
                                <span className="text-sm font-black text-brand">{prices?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá (VNĐ)</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bắt đầu áp dụng</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kết thúc</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-[120px]">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-vttext-muted">Đang tải lịch sử giá...</td>
                                    </tr>
                                ) : !prices || prices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Không có dữ liệu phù hợp</td>
                                    </tr>
                                ) : (
                                    prices.map((p: any) => {
                                        const isActive = !p.endDate || new Date(p.endDate) >= new Date();
                                        return (
                                            <tr key={p.id} className="group hover:bg-brand-soft/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-bold font-mono text-vttext-primary tracking-wider">
                                                        {p.price.toLocaleString()} ₫
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium text-vttext-secondary">
                                                    {format(parseISO(p.startDate), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium text-vttext-primary opacity-60">
                                                    {p.endDate ? format(parseISO(p.endDate), 'dd/MM/yyyy') : 'Hiện tại'}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider border border-emerald-100">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                            Đang áp dụng
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-wider border border-slate-200">
                                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                                            Hết hiệu lực
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {!p.endDate && (
                                                        <div className="flex items-center justify-end gap-1 transition-all">
                                                            <button
                                                                onClick={() => openEditPriceModal(p)}
                                                                className="p-2 hover:bg-brand-soft rounded-xl text-vttext-muted hover:text-brand transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Price Modal */}
                {activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b border-surface-2 flex justify-between items-center bg-white">
                                <h3 className="text-lg font-black text-vttext-primary">
                                    {editingPriceId ? 'Sửa giá ăn' : 'Cập nhật giá ăn'}
                                </h3>
                                <button onClick={() => setActiveModal(false)} className="text-vttext-muted hover:text-vttext-primary p-2 hover:bg-surface-2 rounded-xl transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {!editingPriceId && wizardStep === 'selection' ? (
                                <div className="p-6 space-y-4">
                                    <button
                                        onClick={() => handleSelectPriceMode('tomorrow')}
                                        className="w-full flex items-center gap-4 p-4 border border-vtborder rounded-xl hover:border-brand-soft hover:bg-brand-soft transition-all text-left flex-row group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0 group-hover:bg-brand-soft/50">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-vttext-primary leading-tight">Áp dụng từ ngày mai</div>
                                            <div className="text-[13px] text-vttext-muted mt-1 font-medium">Cập nhật nhanh, áp dụng ngay sau 24:00 đêm nay.</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleSelectPriceMode('custom')}
                                        className="w-full flex items-center gap-4 p-4 border border-vtborder rounded-xl hover:border-brand-soft hover:bg-brand-soft transition-all text-left flex-row group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-surface-2 text-vttext-primary flex items-center justify-center shrink-0 group-hover:bg-white border border-vtborder/50">
                                            <Edit className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-vttext-primary leading-tight">Chọn ngày áp dụng</div>
                                            <div className="text-[13px] text-vttext-muted mt-1 font-medium">Lên lịch thay đổi giá cho một ngày cụ thể trong tương lai.</div>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-vttext-primary">Giá (VNĐ)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={newPriceValue}
                                                    onChange={e => setNewPriceValue(e.target.value)}
                                                    autoFocus
                                                    className="w-full h-11 pl-4 pr-10 border border-vtborder rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-bold text-lg"
                                                    placeholder="0"
                                                />
                                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none font-bold text-vttext-muted">₫</div>
                                            </div>
                                        </div>

                                        {(editingPriceId || priceMode === 'custom') && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold text-vttext-primary">Ngày áp dụng</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        ref={dateInputRef}
                                                        value={newPriceDate}
                                                        onChange={e => setNewPriceDate(e.target.value)}
                                                        disabled={!!editingPriceId && !isLatestPrice}
                                                        min={!editingPriceId ? format(addDays(new Date(), 1), 'yyyy-MM-dd') : undefined}
                                                        className="absolute inset-0 opacity-0 -z-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => dateInputRef.current?.showPicker()}
                                                        disabled={!!editingPriceId && !isLatestPrice}
                                                        className={cn(
                                                            "w-full h-11 px-4 bg-white border border-vtborder rounded-xl flex items-center justify-between shadow-sm transition-all",
                                                            editingPriceId && !isLatestPrice
                                                                ? "bg-vtbg-secondary text-vttext-muted cursor-not-allowed"
                                                                : "text-vttext-primary border-vtborder font-bold hover:border-brand"
                                                        )}
                                                    >
                                                        <span className="text-[15px]">{newPriceDate ? format(new Date(newPriceDate), 'dd/MM/yyyy') : 'Chọn ngày'}</span>
                                                        <Calendar className="w-4 h-4 text-vttext-muted" />
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-vttext-muted mt-1 px-1">
                                                    {editingPriceId && !isLatestPrice
                                                        ? 'Không thể sửa ngày của các mốc giá lịch sử.'
                                                        : 'Giá sẽ bắt đầu có hiệu lực từ 00:00 ngày được chọn.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-6 py-4 bg-vtbg-secondary/30 border-t border-vtborder flex justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                if (!editingPriceId && wizardStep === 'input') {
                                                    setWizardStep('selection');
                                                } else {
                                                    setActiveModal(false);
                                                }
                                            }}
                                            className="px-5 py-2.5 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-primary hover:bg-white/50 transition-colors"
                                        >
                                            {!editingPriceId && wizardStep === 'input' ? 'Quay lại' : 'Hủy'}
                                        </button>
                                        <button
                                            onClick={handleSavePrice}
                                            disabled={!newPriceValue || (!editingPriceId && !newPriceDate) || createPrice.isPending || updatePrice.isPending}
                                            className="px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-hover disabled:opacity-50 shadow-lg shadow-brand/20 transition-all flex items-center gap-2"
                                        >
                                            {createPrice.isPending || updatePrice.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
