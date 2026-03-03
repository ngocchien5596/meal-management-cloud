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

const DollarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

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
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-vtborder shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <DollarIcon />
                        </div>
                        <h2 className="text-lg font-bold text-vttext-primary">Lịch sử giá ăn</h2>
                    </div>
                    <button
                        onClick={openCreatePriceModal}
                        className="flex items-center gap-1.5 text-brand hover:text-brand-hover transition-colors text-sm font-semibold"
                    >
                        <PlusCircleIcon />
                        Cập nhật giá
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-vtborder text-vttext-muted">
                                <th className="py-3 px-4 font-semibold">Giá (VNĐ)</th>
                                <th className="py-3 px-4 font-semibold">Bắt đầu</th>
                                <th className="py-3 px-4 font-semibold">Kết thúc</th>
                                <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                <th className="py-3 px-4 text-right font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vtborder/50">
                            {prices?.map((p: any) => {
                                const isActive = !p.endDate || new Date(p.endDate) >= new Date();
                                return (
                                    <tr key={p.id} className="hover:bg-vtbg-secondary/30 transition-colors group">
                                        <td className="py-4 px-4 font-medium text-vttext-primary">{p.price.toLocaleString()}</td>
                                        <td className="py-4 px-4 text-vttext-secondary">{format(parseISO(p.startDate), 'dd/MM/yyyy')}</td>
                                        <td className="py-4 px-4 text-vttext-secondary">{p.endDate ? format(parseISO(p.endDate), 'dd/MM/yyyy') : 'Hiện tại'}</td>
                                        <td className="py-4 px-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                                            )}>
                                                {isActive ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {!p.endDate && (
                                                <button
                                                    onClick={() => openEditPriceModal(p)}
                                                    className="text-vttext-muted hover:text-brand p-1.5 rounded-lg hover:bg-brand-soft transition-colors"
                                                    title="Sửa giá"
                                                >
                                                    <EditIcon />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {!prices?.length && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-vttext-muted italic">
                                        Chưa có dữ liệu giá.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Price Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-5 py-4 border-b border-vtborder flex justify-between items-center bg-vtbg-secondary/30">
                            <h3 className="font-bold text-vttext-primary">
                                {editingPriceId ? 'Sửa giá ăn' : 'Cập nhật giá ăn'}
                            </h3>
                            <button
                                onClick={() => setActiveModal(false)}
                                className="text-vttext-muted hover:text-vttext-primary p-1 rounded-full hover:bg-vtbg-secondary transition-colors"
                            >
                                <span className="text-xl leading-none">×</span>
                            </button>
                        </div>

                        {!editingPriceId && wizardStep === 'selection' ? (
                            <div className="p-6 space-y-4">
                                <button
                                    onClick={() => handleSelectPriceMode('tomorrow')}
                                    className="w-full flex items-center gap-4 p-4 border border-vtborder rounded-xl hover:border-brand-soft hover:bg-brand-soft transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0 group-hover:bg-brand-soft/50">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-vttext-primary">Áp dụng từ ngày mai</div>
                                        <div className="text-xs text-vttext-muted mt-1">Cập nhật nhanh, áp dụng ngay sau 24:00 đêm nay.</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleSelectPriceMode('custom')}
                                    className="w-full flex items-center gap-4 p-4 border border-vtborder rounded-xl hover:border-brand-soft hover:bg-brand-soft transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-surface-2 text-vttext-primary flex items-center justify-center shrink-0 group-hover:bg-white">
                                        <EditIcon />
                                    </div>
                                    <div>
                                        <div className="font-bold text-vttext-primary">Chọn ngày áp dụng</div>
                                        <div className="text-xs text-vttext-muted mt-1">Lên lịch thay đổi giá cho một ngày cụ thể trong tương lai.</div>
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
                                                    <CalendarIcon className="w-4 h-4 text-vttext-muted" />
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
    );
}
