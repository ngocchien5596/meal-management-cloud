'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Download as DownloadIcon,
    CreditCard,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { reportsApi } from '@/features/reports/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import toast from 'react-hot-toast';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

export default function CostsPage() {
    const today = new Date();
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [meals, setMeals] = useState<any[]>([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await reportsApi.getCosts(dateRange.start, dateRange.end);
            setMeals(response.data);
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
            reportsApi.exportCosts(dateRange.start, dateRange.end);
            toast.success('Đang chuẩn bị file Excel... ✨');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Không thể xuất báo cáo Excel');
        } finally {
            setIsExporting(false);
        }
    };

    const startInputRef = React.useRef<HTMLInputElement>(null);
    const endInputRef = React.useRef<HTMLInputElement>(null);

    // Flatten ingredients for table
    const allIngredients = meals.flatMap(meal =>
        meal.ingredients.map((ing: any) => ({
            ...ing,
            mealDate: meal.mealDate,
            mealType: meal.mealType
        }))
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header section with unified style */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-200">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">Báo cáo chi phí</h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Chi tiết nguyên vật liệu từng bữa ăn</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 relative group">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                            <div className="relative">
                                <button onClick={() => startInputRef.current?.showPicker()} className="hover:text-brand transition-colors">
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
                                <button onClick={() => endInputRef.current?.showPicker()} className="hover:text-brand transition-colors">
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

            {/* Table section */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex-1 w-full overflow-x-auto relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-brand animate-spin" />
                        </div>
                    )}

                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-[60px]">STT</th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày</th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bữa ăn</th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nguyên vật liệu</th>
                                <th className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Số lượng</th>
                                <th className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn vị</th>
                                <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {allIngredients.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">Không có dữ liệu chi phí cho giai đoạn này</td>
                                </tr>
                            ) : (
                                allIngredients.map((item: any, index: number) => (
                                    <tr key={`${item.id}-${index}`} className="group hover:bg-blue-50/50 transition-colors">
                                        <td className="py-4 px-6 text-center text-sm font-bold text-slate-400 font-mono">{String(index + 1).padStart(2, '0')}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-slate-600">{new Date(item.mealDate).toLocaleDateString('vi-VN')}</td>
                                        <td className="py-4 px-6">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                                                item.mealType === 'LUNCH' ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"
                                            )}>
                                                {item.mealType === 'LUNCH' ? 'Trưa' : 'Tối'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-[15px] font-semibold text-slate-900">{item.name}</td>
                                        <td className="py-4 px-6 text-center font-bold text-slate-700">{item.quantity}</td>
                                        <td className="py-4 px-6 text-center text-slate-500">{item.unit}</td>
                                        <td className="py-4 px-6 text-right font-black text-emerald-600">{formatCurrency(item.totalPrice)} ₫</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
