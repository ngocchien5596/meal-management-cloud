'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    Download as DownloadIcon,
    CreditCard,
    Loader2,
    DollarSign,
    Activity,
    TrendingDown,
    TrendingUp,
    Package,
    Utensils,
    ChevronDown as ChevronDownIcon,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { reportsApi, MealCostChart } from '@/features/reports';
import { Modal } from '@/components/ui';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import toast from 'react-hot-toast';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

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

export default function CostsPage() {
    const today = new Date();
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [meals, setMeals] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({ totalCost: 0, avgCostPerMeal: 0, totalMeals: 0, topIngredient: 'N/A' });
    const [expandedMeals, setExpandedMeals] = useState<string[]>([]);
    const [isChartOpen, setIsChartOpen] = useState(false);

    const chartData = useMemo(() => {
        return meals.map(m => {
            const totalCost = m.ingredients?.reduce((acc: number, ing: any) => acc + ing.totalPrice, 0) || 0;
            const regEmpIds = new Set(m.registrations?.map((r: any) => r.employeeId) || []);
            const guestsCount = m.guests?.length || 0;
            const regCount = m.registrations?.length || 0;

            // Checkins from employees NOT in registration (vãng lai)
            const extraCheckins = m.checkins?.filter((c: any) => c.employeeId && !regEmpIds.has(c.employeeId)).length || 0;

            const totalServings = regCount + guestsCount + extraCheckins;
            const avgCost = totalServings > 0 ? Math.round(totalCost / totalServings) : 0;

            return {
                date: m.mealDate,
                mealType: m.mealType,
                totalCost,
                avgCost
            };
        }).sort((a, b) => {
            const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return a.mealType === 'LUNCH' ? -1 : 1;
        });
    }, [meals]);

    const groupedMeals = useMemo(() => {
        const groups: Record<string, {
            meal: any;
            ingredients: any[];
            totalCost: number;
        }> = {};

        meals.forEach(meal => {
            const mealId = meal.id;
            if (!groups[mealId]) {
                groups[mealId] = {
                    meal,
                    ingredients: meal.ingredients || [],
                    totalCost: meal.ingredients?.reduce((acc: number, ing: any) => acc + ing.totalPrice, 0) || 0
                };
            }
        });

        return Object.values(groups).sort((a, b) =>
            new Date(b.meal.mealDate).getTime() - new Date(a.meal.mealDate).getTime()
        );
    }, [meals]);

    const toggleMeal = (mealId: string) => {
        setExpandedMeals(prev =>
            prev.includes(mealId) ? prev.filter(id => id !== mealId) : [...prev, mealId]
        );
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await reportsApi.getCosts(dateRange.start, dateRange.end);
            const reportData = response.data as any;

            // Robust mapping: handle both nested and legacy flat structures
            const actualMeals = Array.isArray(reportData?.data)
                ? reportData.data
                : (Array.isArray(reportData) ? reportData : []);

            const actualSummary = reportData?.summary || (response as any).summary || summary;

            setMeals(actualMeals);
            setSummary(actualSummary);
        } catch (error) {
            console.error('Fetch costs error:', error);
            toast.error('Không thể tải dữ liệu chi phí');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await reportsApi.exportCosts(dateRange.start, dateRange.end);
            toast.success('Xuất báo cáo Excel thành công! ✨');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Không thể xuất báo cáo Excel');
        } finally {
            setIsExporting(false);
        }
    };

    const startInputRef = React.useRef<HTMLInputElement>(null);
    const endInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">
                <div className="flex flex-col gap-6">
                    {/* Header section with unified style */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-200">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-none">Báo cáo chi phí</h1>
                                <p className="text-sm text-slate-500 mt-1.5 font-medium">Chi tiết Nguyên liệu từng bữa ăn</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                                    <div className="relative">
                                        <button onClick={() => startInputRef.current?.showPicker?.()} className="hover:text-brand transition-colors">
                                            {dateRange.start.split('-').reverse().join('/')}
                                        </button>
                                        <input
                                            ref={startInputRef}
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full md:pointer-events-none"
                                        />
                                    </div>
                                    <span className="text-slate-400">-</span>
                                    <div className="relative">
                                        <button onClick={() => endInputRef.current?.showPicker?.()} className="hover:text-brand transition-colors">
                                            {dateRange.end.split('-').reverse().join('/')}
                                        </button>
                                        <input
                                            ref={endInputRef}
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full md:pointer-events-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-px h-6 bg-slate-100 mx-1" />

                            <button
                                onClick={() => setIsChartOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm"
                                title="Xem biểu đồ xu hướng"
                            >
                                <TrendingUp className="w-4 h-4 text-brand" />
                                <span className="hidden sm:inline">Biểu đồ xu hướng</span>
                            </button>

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

                    <Modal
                        isOpen={isChartOpen}
                        onClose={() => setIsChartOpen(false)}
                        title="Biểu đồ biến động chi phí"
                        size="xl"
                    >
                        <div className="p-4">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Xu hướng chi tiết</h3>
                                    <p className="text-xs text-slate-500 font-medium">Theo dõi tổng chi phí nguyên liệu qua từng bữa ăn</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</p>
                                    <p className="text-xs font-bold text-slate-700">
                                        {format(new Date(dateRange.start), 'dd/MM/yyyy')} - {format(new Date(dateRange.end), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="h-[450px]">
                                <MealCostChart data={chartData} />
                            </div>
                        </div>
                    </Modal>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Tổng suất"
                            value={isLoading ? '...' : summary.totalMeals}
                            subValue="Suất ăn"
                            icon={Utensils}
                            color="amber"
                        />
                        <StatCard
                            label="Tổng tiền NVL"
                            value={isLoading ? '...' : formatCurrency(summary.totalCost)}
                            subValue="VNĐ"
                            icon={DollarSign}
                            color="brand"
                        />
                        <StatCard
                            label="Đơn giá TB/Suất"
                            value={isLoading ? '...' : formatCurrency(summary.avgCostPerMeal)}
                            subValue="VNĐ/Suất"
                            icon={Activity}
                            color="emerald"
                        />
                        <StatCard
                            label="NVL tốn kém nhất"
                            value={isLoading ? '...' : (summary.topIngredient?.length > 15 ? summary.topIngredient.substring(0, 15) + '...' : summary.topIngredient)}
                            subValue="Hạng mục"
                            icon={Package}
                            color="rose"
                        />
                    </div>

                    {/* Grouped Accordion Section */}
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/50 p-12 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-10 h-10 text-brand animate-spin" />
                                <p className="text-slate-400 font-bold animate-pulse">Đang tải dữ liệu chi phí...</p>
                            </div>
                        ) : groupedMeals.length === 0 ? (
                            <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/50 p-12 text-center">
                                <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold text-lg">Không có dữ liệu chi phí cho giai đoạn này</p>
                            </div>
                        ) : (
                            groupedMeals.map((group) => {
                                const isExpanded = expandedMeals.includes(group.meal.id);
                                return (
                                    <div
                                        key={group.meal.id}
                                        className={cn(
                                            "bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300",
                                            isExpanded ? "shadow-xl shadow-slate-200/50 ring-1 ring-brand/5" : "hover:shadow-md hover:border-slate-200"
                                        )}
                                    >
                                        {/* Meal Header Button */}
                                        <button
                                            onClick={() => toggleMeal(group.meal.id)}
                                            className="w-full flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 text-left hover:bg-slate-50/50 transition-colors gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                                    isExpanded ? "bg-brand text-white shadow-brand/20 scale-110" : "bg-slate-100 text-slate-500 shadow-slate-200"
                                                )}>
                                                    <Utensils className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                                                            {new Date(group.meal.mealDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                                                        </h3>
                                                        <span className={cn(
                                                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                            group.meal.mealType === 'LUNCH' ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"
                                                        )}>
                                                            {group.meal.mealType === 'LUNCH' ? 'Trưa' : 'Tối'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tight">Chi tiết Nguyên liệu</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-emerald-600">{formatCurrency(group.totalCost)} ₫</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Tổng chi phí bữa ăn</div>
                                                </div>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 transition-transform duration-300",
                                                    isExpanded && "rotate-180 bg-brand-soft border-brand/20 text-brand"
                                                )}>
                                                    <ChevronDownIcon className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </button>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-50 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b border-slate-100">
                                                                <th className="py-4 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-[80px]">STT</th>
                                                                <th className="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nguyên liệu</th>
                                                                <th className="py-4 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng</th>
                                                                <th className="py-4 px-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn vị</th>
                                                                <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá</th>
                                                                <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 bg-white">
                                                            {group.ingredients.map((ing, idx) => (
                                                                <tr key={ing.id} className="hover:bg-blue-50/30 transition-colors">
                                                                    <td className="py-4 px-6 text-center text-sm font-bold text-slate-400 font-mono">{(idx + 1).toString().padStart(2, '0')}</td>
                                                                    <td className="py-4 px-6">
                                                                        <div className="font-bold text-slate-900">{ing.catalog.name}</div>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-center font-black text-slate-700">{ing.quantity}</td>
                                                                    <td className="py-4 px-6 text-center text-sm font-bold text-slate-500">{ing.unit}</td>
                                                                    <td className="py-4 px-6 text-right font-bold text-slate-600">{formatCurrency(ing.unitPrice)} ₫</td>
                                                                    <td className="py-4 px-6 text-right font-black text-emerald-600">{formatCurrency(ing.totalPrice)} ₫</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
