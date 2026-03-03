'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth';
import {
    Calendar as CalendarIcon,
    Search as SearchIcon,
    Filter as FilterIcon,
    Download as DownloadIcon,
    FileText,
    TrendingUp,
    DollarSign,
    Utensils,
    Ban,
    ChevronDown,
    Loader2,
    Building2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useReportSummary } from '@/features/reports/hooks';
import { useDepartments } from '@/features/system/hooks';
import { reportsApi } from '@/features/reports/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import toast from 'react-hot-toast';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

// --- Components ---

const StatCard = ({
    label,
    value,
    subValue,
    icon: Icon,
    color
}: {
    label: string,
    value: string | number,
    subValue?: string,
    icon: any,
    color: 'brand' | 'emerald' | 'rose' | 'amber'
}) => {
    const colorConfigs = {
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600",
        brand: "bg-brand-soft text-brand",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                colorConfigs[color]
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={cn(
                        "text-2xl font-black tracking-tight",
                        color === 'rose' ? "text-rose-600" :
                            color === 'emerald' ? "text-emerald-600" :
                                color === 'amber' ? "text-amber-600" : "text-slate-900"
                    )}>
                        {value}
                    </h3>
                    {subValue && <span className="text-xs font-medium text-slate-400">{subValue}</span>}
                </div>
            </div>
        </div>
    );
};

export default function ReportPage() {
    const { user } = useAuthStore();
    const canView = user?.role === 'ADMIN_KITCHEN' || user?.role === 'HR' || user?.role === 'ADMIN_SYSTEM';
    const router = useRouter();

    useEffect(() => {
        if (user && !canView) {
            router.replace('/dashboard');
        }
    }, [user, canView, router]);

    const today = new Date();
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const { data: departments } = useDepartments();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading } = useReportSummary(dateRange.start, dateRange.end, debouncedSearch, selectedDept);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await reportsApi.exportExcel(dateRange.start, dateRange.end, debouncedSearch, selectedDept);
            toast.success('Xuất báo cáo Excel thành công! ✨');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Không thể xuất báo cáo Excel');
        } finally {
            setIsExporting(false);
        }
    };

    const summary = data?.summary || { totalMeals: 0, totalSkipped: 0, totalCost: 0, avgPerDay: 0 };
    const items = data?.details || [];

    // Client-side pagination
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(items.length / pageSize);
    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    // Reset pagination when filter changes
    useEffect(() => {
        setPage(1);
    }, [dateRange, debouncedSearch]);

    const startInputRef = React.useRef<HTMLInputElement>(null);
    const endInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* 1. Header & Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand-200">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-none">Báo cáo tổng hợp</h1>
                            <p className="text-sm text-slate-500 mt-1.5 font-medium">
                                Thống kê từ {dateRange.start.split('-').reverse().join('/')} đến {dateRange.end.split('-').reverse().join('/')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 relative group">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                                <div className="relative">
                                    <button
                                        onClick={() => startInputRef.current?.showPicker()}
                                        className="hover:text-brand transition-colors"
                                    >
                                        {dateRange.start.split('-').reverse().join('/')}
                                    </button>
                                    <input
                                        ref={startInputRef}
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                    />
                                </div>
                                <span className="text-slate-400">-</span>
                                <div className="relative">
                                    <button
                                        onClick={() => endInputRef.current?.showPicker()}
                                        className="hover:text-brand transition-colors"
                                    >
                                        {dateRange.end.split('-').reverse().join('/')}
                                    </button>
                                    <input
                                        ref={endInputRef}
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-6 bg-slate-100 mx-1" />

                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-200 active:scale-95 disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadIcon className="w-4 h-4" />}
                            Xuất Excel
                        </button>
                    </div>
                </div>

                {/* 2. KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Tổng suất ăn"
                        value={isLoading ? '...' : summary.totalMeals}
                        icon={Utensils}
                        color="brand"
                    />
                    <StatCard
                        label="Bữa bỏ lỡ"
                        value={isLoading ? '...' : summary.totalSkipped}
                        subValue={summary.totalSkipped > 0 ? 'Cần chú ý' : 'Tốt'}
                        icon={Ban}
                        color="rose"
                    />
                    <StatCard
                        label="Trung bình/Ngày"
                        value={isLoading ? '...' : summary.avgPerDay}
                        icon={TrendingUp}
                        color="amber"
                    />
                    <StatCard
                        label="Tổng chi phí"
                        value={isLoading ? '...' : formatCurrency(summary.totalCost)}
                        subValue="VNĐ"
                        icon={DollarSign}
                        color="emerald"
                    />
                </div>

                {/* 3. Main Report Table */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px]">

                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-[320px]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-4 h-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhân viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full h-10 pl-10 pr-3 border border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                </div>
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="block w-full h-10 pl-10 pr-10 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
                                >
                                    <option value="">Tất cả phòng ban</option>
                                    {(departments as any)?.map((dept: any) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 w-full overflow-x-auto relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                            </div>
                        )}

                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-[60px]">STT</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã NV</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ và tên</th>
                                    <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phòng ban</th>
                                    <th className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã ăn/Đã đăng ký</th>
                                    <th className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Bỏ lỡ</th>
                                    <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tiền</th>

                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedItems.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                                            Không có dữ liệu cho giai đoạn này
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((item: any, index: number) => (
                                        <tr key={item.id} className="group hover:bg-blue-50/50 transition-colors">
                                            <td className="py-4 px-6 text-center text-sm font-bold text-slate-400 font-mono">
                                                {String((page - 1) * pageSize + index + 1).padStart(2, '0')}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold text-slate-500 font-mono">{item.empCode}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {(item.name || '?').split(' ').pop()?.substring(0, 1)}
                                                    </div>
                                                    <span className="text-[15px] font-medium text-slate-900">{item.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-slate-600">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    {item.department || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-slate-900">{item.eaten}/{item.meals}</span>
                                                    <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                        <div
                                                            className="h-full bg-brand rounded-full"
                                                            style={{ width: `${item.meals > 0 ? (item.eaten / item.meals) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {item.skipped > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                        {item.skipped}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-sm font-bold text-emerald-600">{formatCurrency(item.total)} ₫</span>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-500">
                            Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, items.length)} trong số {items.length} bản ghi
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Trước
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
