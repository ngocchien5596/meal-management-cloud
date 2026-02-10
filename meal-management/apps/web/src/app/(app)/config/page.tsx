'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import toast from 'react-hot-toast';
import {
    useSystemConfig,
    useUpdateSystemConfig,
    useDepartments,
    usePositions,
    useCreateDepartment,
    useCreatePosition,
    useUpdateDepartment,
    useUpdatePosition,
    useDeleteDepartment,
    useDeletePosition,
    usePrices,
    useCreatePrice,
    useUpdatePrice
} from '@/features/system';
import { ConfirmDialog } from '@/components/ui';
import { format, parseISO, addDays } from 'date-fns';
import { cn } from '@/lib/utils/cn';

const DollarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const SmallClockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const BuildingListIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
        <path d="M8 14h.01" />
        <path d="M16 14h.01" />
    </svg>
);

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

const SaveIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
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

const SettingsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default function SystemConfigContent() {
    const { user } = useAuthStore();
    const router = useRouter();
    const dateInputRef = useRef<HTMLInputElement>(null);
    const isSystemAdmin = user?.role === 'ADMIN_SYSTEM';

    useEffect(() => {
        if (user && !isSystemAdmin) {
            router.replace('/dashboard');
        }
    }, [user, isSystemAdmin, router]);

    const { data: config, isLoading } = useSystemConfig();
    const updateConfig = useUpdateSystemConfig();
    const { data: prices } = usePrices();
    const createPrice = useCreatePrice();
    const updatePrice = useUpdatePrice();

    const { data: departments } = useDepartments();
    const { data: positions } = usePositions();

    const createDept = useCreateDepartment();
    const deleteDept = useDeleteDepartment();
    const updateDept = useUpdateDepartment();

    const createPos = useCreatePosition();
    const deletePos = useDeletePosition();
    const updatePos = useUpdatePosition();

    // Config State
    const [cutOffHour, setCutOffHour] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [activeModal, setActiveModal] = useState<'dept' | 'pos' | 'price' | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Price Wizard State
    const [wizardStep, setWizardStep] = useState<'selection' | 'input'>('selection');
    const [priceMode, setPriceMode] = useState<'tomorrow' | 'custom'>('tomorrow');

    // Price Modal State
    const [newPriceValue, setNewPriceValue] = useState('');
    const [newPriceDate, setNewPriceDate] = useState('');
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [isLatestPrice, setIsLatestPrice] = useState(false);

    // Confirm Dialog State
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'dept' | 'pos', id: string } | null>(null);

    useEffect(() => {
        if (config) {
            setCutOffHour(config['CUT_OFF_HOUR'] || '16');
        }
    }, [config]);

    const handleSaveConfig = async (key: string, value: string) => {
        if (!key) return;
        setIsSaving(true);
        try {
            await updateConfig.mutateAsync({ key, value });
            toast.success('Lưu cấu hình thành công!');
        } catch (error: any) {
            console.error('Failed to save config:', error);
            const msg = error?.response?.data?.error?.message || error?.message || 'Lỗi không xác định';
            toast.error(`Không thể lưu cấu hình: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveItem = async () => {
        if (!newItemName.trim()) return;
        try {
            if (activeModal === 'dept') {
                if (editingId) {
                    await updateDept.mutateAsync({ id: editingId, name: newItemName });
                } else {
                    await createDept.mutateAsync(newItemName);
                }
            } else if (activeModal === 'pos') {
                if (editingId) {
                    await updatePos.mutateAsync({ id: editingId, name: newItemName });
                } else {
                    await createPos.mutateAsync(newItemName);
                }
            }
            setNewItemName('');
            setEditingId(null);
            setActiveModal(null);
            toast.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại sau';
            toast.error(`Thao tác thất bại: ${msg}`);
        }
    };

    const handleSelectPriceMode = (mode: 'tomorrow' | 'custom') => {
        setPriceMode(mode);
        if (mode === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setNewPriceDate(format(tomorrow, 'yyyy-MM-dd'));
        } else {
            setNewPriceDate(''); // Clear for custom selection
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
                // Update existing price
                await updatePrice.mutateAsync({
                    id: editingPriceId,
                    data: {
                        price: Number(newPriceValue),
                        startDate: newPriceDate || undefined // Only send if set
                    }
                });
                toast.success('Cập nhật giá thành công!');
            } else {
                // Create new price
                await createPrice.mutateAsync({
                    price: Number(newPriceValue),
                    startDate: newPriceDate
                });
                toast.success('Thêm giá mới thành công!');
            }

            closePriceModal();
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message || error?.message || 'Lỗi không xác định';
            toast.error(`Thất bại: ${msg}`);
        }
    };

    const openCreatePriceModal = () => {
        setEditingPriceId(null);
        setNewPriceValue('');

        // Default to TOMORROW
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setNewPriceDate(format(tomorrow, 'yyyy-MM-dd'));

        setIsLatestPrice(true);
        setWizardStep('selection'); // Start with selection
        setPriceMode('tomorrow'); // Default mode
        setActiveModal('price');
    }

    const openEditPriceModal = (price: any) => {
        setEditingPriceId(price.id);
        setNewPriceValue(price.price.toString());
        // Standardize date for input (YYYY-MM-DD)
        // Fix: Use parseISO to handle UTC dates correctly (e.g. 17:00 previous day)
        const dateStr = format(parseISO(price.startDate), 'yyyy-MM-dd');
        setNewPriceDate(dateStr);
        setIsLatestPrice(!price.endDate); // If endDate is null, it's the latest
        setActiveModal('price');
    }

    const closePriceModal = () => {
        setActiveModal(null);
        setEditingPriceId(null);
        setNewPriceValue('');
        setNewPriceDate('');
    }

    const openCreateModal = (type: 'dept' | 'pos') => {
        setActiveModal(type);
        setEditingId(null);
        setNewItemName('');
    };

    const openEditModal = (type: 'dept' | 'pos', item: { id: string, name: string }) => {
        setActiveModal(type);
        setEditingId(item.id);
        setNewItemName(item.name);
    };

    const handleDeleteClick = (type: 'dept' | 'pos', id: string) => {
        setConfirmDelete({ type, id });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        const { type, id } = confirmDelete;
        try {
            if (type === 'dept') {
                await deleteDept.mutateAsync(id);
            } else {
                await deletePos.mutateAsync(id);
            }
            toast.success('Xóa thành công!');
        } catch (error: any) {
            const msg = error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại';
            toast.error(`Không thể xóa: ${msg}`);
        } finally {
            setConfirmDelete(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-7 py-6">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                    <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-vttext-primary leading-none">Cấu hình hệ thống</h1>
                    <p className="text-sm text-vttext-muted mt-1.5 font-medium">Quản lý các thiết lập chung cho toàn hệ thống suất ăn</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
                {/* PRICE HISTORY CARD */}
                <div className="bg-white rounded-xl border border-[#eef2f7] shadow-sm p-5 relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <DollarIcon />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Lịch sử giá ăn</h2>
                        </div>
                        <button
                            onClick={openCreatePriceModal}
                            className="flex items-center gap-1.5 text-brand hover:text-brand-hover transition-colors text-sm font-semibold"
                        >
                            <PlusCircleIcon />
                            Cập nhật giá
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto max-h-[250px] pr-2">
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b border-gray-100 text-gray-500">
                                    <th className="py-2">Giá (VNĐ)</th>
                                    <th className="py-2">Bắt đầu</th>
                                    <th className="py-2">Kết thúc</th>
                                    <th className="py-2">Trạng thái</th>
                                    <th className="py-2 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prices?.map((p: any) => {
                                    const isActive = !p.endDate || new Date(p.endDate) >= new Date();
                                    return (
                                        <tr key={p.id} className="border-b border-gray-50 last:border-0 group">
                                            <td className="py-3 font-medium text-gray-900">{p.price.toLocaleString()}</td>
                                            <td className="py-3 text-gray-500">{format(parseISO(p.startDate), 'dd/MM/yyyy')}</td>
                                            <td className="py-3 text-gray-500">{p.endDate ? format(parseISO(p.endDate), 'dd/MM/yyyy') : 'Hiện tại'}</td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {isActive ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!p.endDate && (
                                                        <button
                                                            onClick={() => openEditPriceModal(p)}
                                                            className="text-vttext-muted hover:text-brand p-1 rounded hover:bg-brand-soft transition-colors"
                                                            title="Sửa giá"
                                                        >
                                                            <EditIcon />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!prices?.length && <tr><td colSpan={5} className="py-4 text-center text-gray-400">Chưa có dữ liệu giá.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CUTOFF HOUR CARD */}
                <div className="bg-white rounded-xl border border-[#eef2f7] shadow-sm p-5 relative flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <ClockIcon />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Giờ chốt đăng ký</h2>
                    </div>

                    <p className="text-[15px] text-gray-500 mb-5 leading-relaxed">
                        Thiết lập thời gian hết hạn đăng ký suất ăn cho ngày hôm sau. Sau giờ này, nhân viên không thể đăng ký hoặc hủy.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-vttext-secondary mb-2">Thời gian chốt hằng ngày</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cutOffHour}
                                onChange={(e) => setCutOffHour(e.target.value)}
                                className="w-full h-11 pl-4 pr-12 bg-white border border-vtborder rounded-lg text-vttext-primary text-[15px] focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <SmallClockIcon />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto flex justify-end">
                        <button
                            onClick={() => handleSaveConfig('CUT_OFF_HOUR', cutOffHour)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            <SaveIcon />
                            Lưu thay đổi
                        </button>
                    </div>
                </div>

            </div>

            {/* 4) BOTTOM ROW: TWO TABLE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

                {/* TABLE CARD LEFT: Phòng ban */}
                <div className="bg-white rounded-xl border border-[#eef2f7] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                                <BuildingListIcon />
                            </div>
                            <h3 className="text-[17px] font-bold text-gray-900">Phòng ban</h3>
                        </div>
                        <button
                            onClick={() => openCreateModal('dept')}
                            className="flex items-center gap-1.5 text-brand hover:text-brand-hover transition-colors text-sm font-semibold"
                        >
                            < PlusCircleIcon />
                            Thêm mới
                        </button>
                    </div>

                    <div className="flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#f9fafb] border-b border-gray-100">
                                    <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[60px]">STT</th>
                                    <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">TÊN PHÒNG BAN</th>
                                    <th className="py-3 px-5 w-[100px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments?.length === 0 && (
                                    <tr><td colSpan={3} className="py-4 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                                )}
                                {departments?.map((dept, index) => (
                                    <tr key={dept.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-5 text-[15px] font-semibold text-gray-500">{index + 1}</td>
                                        <td className="py-4 px-5 text-[15px] text-gray-900 font-medium">{dept.name}</td>
                                        <td className="py-4 px-5 flex justify-end gap-3">
                                            <button
                                                onClick={() => openEditModal('dept', dept)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick('dept', dept.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500 font-medium">
                            <span>Tổng số: {departments?.length || 0} phòng ban</span>
                        </div>
                    </div>
                </div>

                {/* TABLE CARD RIGHT: Chức vụ */}
                <div className="bg-white rounded-xl border border-[#eef2f7] shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                <BriefcaseIcon />
                            </div>
                            <h3 className="text-[17px] font-bold text-gray-900">Chức vụ</h3>
                        </div>
                        <button
                            onClick={() => openCreateModal('pos')}
                            className="flex items-center gap-1.5 text-brand hover:text-brand-hover transition-colors text-sm font-semibold"
                        >
                            < PlusCircleIcon />
                            Thêm mới
                        </button>
                    </div>

                    <div className="flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#f9fafb] border-b border-gray-100">
                                    <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[60px]">STT</th>
                                    <th className="py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">TÊN CHỨC VỤ</th>
                                    <th className="py-3 px-5 w-[100px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions?.length === 0 && (
                                    <tr><td colSpan={3} className="py-4 text-center text-gray-500">Chưa có dữ liệu</td></tr>
                                )}
                                {positions?.map((pos, index) => (
                                    <tr key={pos.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-5 text-[15px] font-semibold text-gray-500">{index + 1}</td>
                                        <td className="py-4 px-5 text-[15px] text-gray-900 font-medium">{pos.name}</td>
                                        <td className="py-4 px-5 flex justify-end gap-3">
                                            <button
                                                onClick={() => openEditModal('pos', pos)}
                                                className="text-vttext-muted hover:text-brand transition-colors"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick('pos', pos.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500 font-medium">
                            <span>Tổng số: {positions?.length || 0} chức vụ</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* MODAL */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">
                                {activeModal === 'price'
                                    ? (editingPriceId ? 'Sửa giá ăn' : 'Cập nhật giá ăn')
                                    : (editingId ? 'Cập nhật' : 'Thêm mới') + (activeModal === 'dept' ? ' phòng ban' : ' chức vụ')
                                }
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {activeModal === 'price' ? (
                            (!editingPriceId && wizardStep === 'selection') ? (
                                <div className="p-5 grid gap-4">
                                    <button
                                        onClick={() => handleSelectPriceMode('tomorrow')}
                                        className="flex items-center gap-4 p-4 border border-vtborder rounded-lg hover:border-brand-soft hover:bg-brand-soft transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-brand-soft text-brand flex items-center justify-center flex-shrink-0 group-hover:bg-brand-soft2">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-vttext-primary">Áp dụng từ ngày mai</div>
                                            <div className="text-sm text-vttext-muted">Cập nhật nhanh, áp dụng ngay sau 0h đêm nay</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleSelectPriceMode('custom')}
                                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200">
                                            <EditIcon />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Chọn ngày áp dụng</div>
                                            <div className="text-sm text-gray-500">Lên lịch thay đổi giá cho một ngày trong tương lai</div>
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={newPriceValue}
                                                onChange={e => setNewPriceValue(e.target.value)}
                                                autoFocus
                                                className="w-full h-10 pl-3 pr-8 border border-vtborder rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand"
                                                placeholder="Nhập giá tiền..."
                                            />
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">₫</div>
                                        </div>
                                    </div>

                                    {(editingPriceId || priceMode === 'custom') && (
                                        <div>
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
                                                        "w-full h-11 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold flex items-center justify-between shadow-sm transition-all",
                                                        editingPriceId && !isLatestPrice
                                                            ? "bg-surface-1 text-vttext-muted cursor-not-allowed"
                                                            : "text-vttext-primary hover:border-brand"
                                                    )}
                                                >
                                                    <span>{newPriceDate ? format(new Date(newPriceDate), 'dd/MM/yyyy') : 'Chọn ngày'}</span>
                                                    <CalendarIcon className="w-4 h-4 text-vttext-muted" />
                                                </button>
                                            </div>
                                            {editingPriceId && !isLatestPrice ? (
                                                <p className="text-xs text-amber-600 mt-1">Không thể sửa ngày bắt đầu của các mốc giá lịch sử.</p>
                                            ) : (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {priceMode === 'custom' && !editingPriceId
                                                        ? 'Ngày bắt đầu phải là tương lai.'
                                                        : 'Giá cũ sẽ tự động kết thúc vào ngày trước ngày này.'}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="p-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên {activeModal === 'dept' ? 'phòng ban' : 'chức vụ'}
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full h-10 px-3 border border-vtborder rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand"
                                    placeholder={`Nhập tên ${activeModal === 'dept' ? 'phòng ban' : 'chức vụ'}...`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveItem();
                                    }}
                                />
                            </div>
                        )}

                        {/* Footer logic: Hide Save button if in Wizard Selection step */}
                        {!(activeModal === 'price' && !editingPriceId && wizardStep === 'selection') && (
                            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        // If in Wizard Input step (and creating new), Back button goes to Selection
                                        if (activeModal === 'price' && !editingPriceId && wizardStep === 'input') {
                                            setWizardStep('selection');
                                        } else {
                                            setActiveModal(null);
                                        }
                                    }}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {activeModal === 'price' && !editingPriceId && wizardStep === 'input' ? 'Quay lại' : 'Hủy'}
                                </button>
                                <button
                                    onClick={activeModal === 'price' ? handleSavePrice : handleSaveItem}
                                    disabled={
                                        activeModal === 'price'
                                            ? (!newPriceValue || (!editingPriceId && !newPriceDate))
                                            : (!newItemName.trim() || createDept.isPending || createPos.isPending || updateDept.isPending || updatePos.isPending)
                                    }
                                    className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover disabled:opacity-50"
                                >
                                    {activeModal === 'price'
                                        ? (editingPriceId ? 'Cập nhật' : 'Lưu thay đổi')
                                        : (createDept.isPending || createPos.isPending || updateDept.isPending || updatePos.isPending ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm mới'))
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteDept.isPending || deletePos.isPending}
                title={`Xác nhận xóa ${confirmDelete?.type === 'dept' ? 'phòng ban' : 'chức vụ'}`}
                description="Hành động này không thể hoàn tác. Các dữ liệu liên quan có thể bị ảnh hưởng."
                confirmText="Đồng ý xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
}
