'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { useMeals, useCreateMeal } from '@/features/meals/hooks';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Modal, Input, Button, CreateButton } from '@/components/ui';
import { useAuthStore } from '@/features/auth';
import { Edit } from 'lucide-react';
import { KitchenSummaryModal } from '@/features/meals/components/KitchenSummaryModal';

// --- Premium Icons ---
// ... (keep existing icons) 
const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);

const ChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const UtensilsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
);


const FoodTrayIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <path d="M5 17v2h14v-2" />
        <path d="M12 5c-4.5 0-8 3-8 7h16c0-4-3.5-7-8-7z" />
        <path d="M12 2v3" />
    </svg>
);

const ReportIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
    </svg>
);

// --- Sub-components ---

const DateCard = ({ date }: { date: string }) => {
    const d = new Date(date);
    const day = format(d, 'dd');
    const month = format(d, 'MM');
    const weekday = format(d, 'EEEE', { locale: vi });

    return (
        <div className="flex items-center gap-4">
            <div className="w-12 h-14 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-[10px] font-black text-slate-300 leading-none uppercase">{month}</span>
                <span className="text-xl font-black text-slate-900 leading-none mt-1">{day}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 capitalize">{weekday}</span>
                <span className="text-[11px] font-medium text-slate-400">{format(d, 'dd/MM/yyyy')}</span>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { label: string; class: string }> = {
        'DRAFT': { label: 'Nháp', class: 'bg-orange-50 text-orange-600 border-orange-100' },
        'IN_PROGRESS': { label: 'Đang diễn ra', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        'COMPLETED': { label: 'Đã kết thúc', class: 'bg-slate-50 text-slate-500 border-slate-100' },
    };

    const config = configs[status] || configs['DRAFT'];

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border",
            config.class
        )}>
            {config.label}
        </span>
    );
};

function CreateMealForm({ onSuccess }: { onSuccess: () => void }) {
    const createMutation = useCreateMeal();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dateStr = formData.get('mealDate') as string;
        const [y, m, d] = dateStr.split('-').map(Number);
        // Set to Noon to avoid day boundary issues (Noon Strategy)
        const date = new Date(y, m - 1, d, 12, 0, 0);

        const data = {
            mealDate: date.toISOString(),
            mealType: formData.get('mealType') as 'LUNCH' | 'DINNER',
        };
        await createMutation.mutateAsync(data);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Ngày diễn ra</label>
                <div className="relative">
                    <input
                        type="date"
                        id="createMealDate"
                        name="mealDate"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                            const display = document.getElementById('createMealDateDisplay');
                            if (display) display.textContent = e.target.value.split('-').reverse().join('/');
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 md:pointer-events-none"
                    />
                    <button
                        type="button"
                        onClick={() => (document.getElementById('createMealDate') as HTMLInputElement)?.showPicker?.()}
                        className="w-full h-11 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-primary flex items-center justify-between shadow-sm hover:border-brand transition-all"
                    >
                        <span id="createMealDateDisplay">{new Date().toISOString().split('T')[0].split('-').reverse().join('/')}</span>
                        <CalendarIcon className="w-4 h-4 text-vttext-muted" />
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Loại bữa ăn</label>
                <div className="relative">
                    <select
                        name="mealType"
                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm appearance-none"
                    >
                        <option value="LUNCH">Bữa trưa</option>
                        <option value="DINNER">Bữa tối</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <ChevronDown className="text-slate-400" />
                    </div>
                </div>
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-brand/20"
                disabled={createMutation.isPending}
            >
                {createMutation.isPending ? 'ĐANG TẠO...' : 'TẠO BỮA ĂN MỚI'}
            </Button>
        </form>
    );
}

// --- Use standard icons or import if available. Using inline for now to ensure consistency ---
// ... Icons can remain but styling will change ...

import { useRouter } from 'next/navigation';

export default function MealManagementPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN_KITCHEN' || user?.role === 'ADMIN_SYSTEM';
    const canAccessMeals = isAdmin || user?.role === 'CLERK';
    const router = useRouter();

    React.useEffect(() => {
        if (user && !canAccessMeals) {
            router.replace('/dashboard');
        }
    }, [user, canAccessMeals, router]);

    // Initialize with default range: Yesterday to Today + 2
    const getInitialRange = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const plusTwo = new Date(today);
        plusTwo.setDate(today.getDate() + 2);

        return {
            start: yesterday.toISOString().split('T')[0],
            end: plusTwo.toISOString().split('T')[0]
        };
    };

    const initialRange = getInitialRange();
    const [startDateFilter, setStartDateFilter] = useState<string>(initialRange.start);
    const [endDateFilter, setEndDateFilter] = useState<string>(initialRange.end);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Construct local range for filter
    const range = React.useMemo(() => {
        if (!startDateFilter && !endDateFilter) return { start: undefined, end: undefined };

        let startIso = undefined;
        let endIso = undefined;

        if (startDateFilter) {
            const [y, m, d] = startDateFilter.split('-').map(Number);
            startIso = new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
        }

        if (endDateFilter) {
            const [y, m, d] = endDateFilter.split('-').map(Number);
            endIso = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
        }

        return { start: startIso, end: endIso };
    }, [startDateFilter, endDateFilter]);

    const { data: rawMeals = [], isLoading } = useMeals(range.start, range.end, searchTerm, statusFilter);

    // Client-side sort safeguard: Ensure ascending chronological order (Past -> Future)
    const meals = React.useMemo(() => {
        return [...rawMeals].sort((a, b) => {
            const dateA = new Date(a.mealDate).getTime();
            const dateB = new Date(b.mealDate).getTime();

            if (dateA !== dateB) return dateA - dateB;

            // Secondary sort: LUNCH before DINNER
            // L comes after D, so to put LUNCH (L) first, we return b.mealType compare a.mealType (descending alphabetical)
            return b.mealType.localeCompare(a.mealType);
        });
    }, [rawMeals]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [summaryModalId, setSummaryModalId] = useState<string | null>(null);
    const startInputRef = React.useRef<HTMLInputElement>(null);
    const endInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-7 py-6 animate-in fade-in duration-500">

            {/* 1. Header (Standardized) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                        <FoodTrayIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-vttext-primary leading-none">Quản lý bữa ăn</h1>
                        <p className="text-sm text-vttext-muted mt-1.5 font-medium">Danh sách và trạng thái các bữa ăn đã được đăng ký</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        {/* Start Date */}
                        <div className="relative">
                            <input
                                type="date"
                                ref={startInputRef}
                                value={startDateFilter}
                                onChange={(e) => setStartDateFilter(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 md:pointer-events-none"
                                tabIndex={-1}
                            />
                            <button
                                onClick={() => startInputRef.current?.showPicker?.()}
                                className="h-10 px-3 bg-white border border-vtborder rounded-lg text-xs font-semibold text-vttext-secondary flex items-center gap-2 hover:bg-surface-2 transition-all shadow-sm min-w-[130px]"
                            >
                                <div className="flex flex-col items-start leading-none gap-0.5">
                                    <span className="text-[9px] uppercase text-vttext-muted">Từ ngày</span>
                                    <span className="text-xs">{startDateFilter ? format(new Date(startDateFilter), 'dd/MM/yyyy') : 'Chọn'}</span>
                                </div>
                                <CalendarIcon className="w-3.5 h-3.5 text-vttext-muted ml-auto" />
                            </button>
                        </div>

                        <span className="text-slate-300 font-bold">→</span>

                        {/* End Date */}
                        <div className="relative">
                            <input
                                type="date"
                                ref={endInputRef}
                                value={endDateFilter}
                                onChange={(e) => setEndDateFilter(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 md:pointer-events-none"
                                tabIndex={-1}
                            />
                            <button
                                onClick={() => endInputRef.current?.showPicker?.()}
                                className="h-10 px-3 bg-white border border-vtborder rounded-lg text-xs font-semibold text-vttext-secondary flex items-center gap-2 hover:bg-surface-2 transition-all shadow-sm min-w-[130px]"
                            >
                                <div className="flex flex-col items-start leading-none gap-0.5">
                                    <span className="text-[9px] uppercase text-vttext-muted">Đến ngày</span>
                                    <span className="text-xs">{endDateFilter ? format(new Date(endDateFilter), 'dd/MM/yyyy') : 'Chọn'}</span>
                                </div>
                                <CalendarIcon className="w-3.5 h-3.5 text-vttext-muted ml-auto" />
                            </button>
                        </div>
                    </div>

                    {(startDateFilter !== initialRange.start || endDateFilter !== initialRange.end) && (
                        <button
                            onClick={() => {
                                setStartDateFilter(initialRange.start);
                                setEndDateFilter(initialRange.end);
                            }}
                            className="h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Main Content Card */}
            <div className="bg-white rounded-xl border border-[#eef2f7] shadow-sm flex flex-col">

                {/* Toolbar / Search */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-t-xl">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-4 h-4 text-vttext-muted" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            maxLength={50}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-vtborder rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-vttext-muted bg-surface-2 px-3 py-1.5 rounded-lg border border-vtborder hidden sm:block">
                            Tổng số: <span className="text-brand font-bold">{meals.length}</span> bữa ăn
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 pl-3 pr-8 bg-white border border-vtborder rounded-lg text-sm font-medium text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none min-w-[150px]"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="IN_PROGRESS">Đang diễn ra</option>
                                <option value="DRAFT">Nháp</option>
                                <option value="COMPLETED">Đã kết thúc</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f9fafb] border-b border-gray-100">
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Ngày</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Bữa</th>
                                <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Trạng thái</th>
                                <th className="py-3 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">Nhân viên / Khách</th>
                                <th className="py-3 px-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-vttext-muted">
                                        <div className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mb-2"></div>
                                        <p className="text-sm">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : meals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500 italic text-sm">
                                        Chưa có bữa ăn nào trong khoảng thời gian này.
                                    </td>
                                </tr>
                            ) : (
                                meals.map((meal) => (
                                    <tr key={meal.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-[15px] font-medium text-gray-900">
                                                    {format(new Date(meal.mealDate), 'dd/MM/yyyy')}
                                                </span>
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {format(new Date(meal.mealDate), 'EEEE', { locale: vi })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                meal.mealType === 'LUNCH' ? "text-brand" : "text-amber-600"
                                            )}>
                                                {meal.mealType === 'LUNCH' ? 'Bữa trưa' : 'Bữa tối'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={meal.status} />
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {meal._count?.registrations || 0} <span className="text-gray-400">/</span> {meal._count?.guests || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/meals/${meal.id}`}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-vttext-muted hover:text-brand hover:bg-brand-soft transition-all border border-transparent hover:border-brand-soft"
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => setSummaryModalId(meal.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-vttext-muted hover:text-brand hover:bg-brand-soft transition-all border border-transparent hover:border-brand-soft"
                                                    title="Xem tổng hợp nhà bếp"
                                                >
                                                    <ReportIcon className="w-5 h-5" />
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
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tạo bữa ăn mới"
            >
                <CreateMealForm onSuccess={() => setIsCreateModalOpen(false)} />
            </Modal>

            <KitchenSummaryModal
                isOpen={!!summaryModalId}
                onClose={() => setSummaryModalId(null)}
                mealId={summaryModalId}
            />
        </div >
    );
}
