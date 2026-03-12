'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCatalog, useIngredientPriceHistory } from '@/features/meals/hooks';
import { IngredientPriceChart } from '@/features/reports';
import { Button, Input, Card } from '@/components/ui';
import { ArrowLeft, Calendar, FileText, TrendingUp, Filter } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function IngredientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Default: From the start of last month to today
    const [startDate, setStartDate] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const { data: catalog } = useCatalog();
    const { data: history, isLoading } = useIngredientPriceHistory(id, startDate, endDate);

    const ingredient = useMemo(() =>
        catalog?.find(item => item.id === id),
        [catalog, id]);

    if (!id) return null;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 px-4 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/config/ingredients')}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-brand font-black text-xs uppercase tracking-widest mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Biến động giá</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">
                            {ingredient?.name || 'Đang tải...'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <Card className="lg:col-span-1 p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-4 h-4 text-brand" />
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Bộ lọc thời gian</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Từ ngày</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="font-bold text-slate-700 font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đến ngày</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="font-bold text-slate-700 font-mono"
                            />
                        </div>
                    </div>

                    <div className="pt-4 mt-auto border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>Tổng số bản ghi:</span>
                            <span className="text-brand font-black">{history?.length || 0}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                            * Dữ liệu được lấy từ đơn giá nhập vào trong từng bữa ăn thực tế.
                        </p>
                    </div>
                </Card>

                {/* Main Chart Card */}
                <Card className="lg:col-span-3 p-6 flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Biểu đồ lịch sử giá</h2>
                            <p className="text-xs text-slate-500 font-medium tracking-tight">Đơn vị tính: VNĐ / {ingredient?.defaultUnit || 'đơn vị'}</p>
                        </div>
                        {isLoading && (
                            <div className="flex items-center gap-2 text-brand text-xs font-black animate-pulse">
                                <div className="w-2 h-2 bg-brand rounded-full"></div>
                                ĐANG CẬP NHẬT...
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-h-[400px]">
                        <IngredientPriceChart data={history || []} />
                    </div>
                </Card>
            </div>

            {/* Price Table */}
            <Card className="p-0 overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Chi tiết từng bữa ăn</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày bữa ăn</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ca ăn</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Số lượng</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Đơn giá</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">Đang tải dữ liệu...</td>
                                </tr>
                            ) : !history || history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 italic">Không có dữ liệu trong khoảng thời gian này</td>
                                </tr>
                            ) : (
                                [...history].reverse().map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/20 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
                                                <span className="text-[14px] font-bold text-slate-700">
                                                    {format(new Date(item.date), 'dd/MM/yyyy')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${item.mealType === 'LUNCH'
                                                ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100'
                                                : 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100'
                                                }`}>
                                                {item.mealType === 'LUNCH' ? 'Trưa' : 'Tối'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-slate-600">
                                            {item.quantity} <span className="text-[10px] uppercase text-slate-400 ml-0.5">{item.unit}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-[14px] font-black text-slate-900">
                                                {item.unitPrice.toLocaleString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-[14px] font-black text-brand">
                                                {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
