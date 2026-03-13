'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush,
    Area,
    ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MealCostPoint {
    date: string;
    mealType: 'LUNCH' | 'DINNER';
    totalCost: number;
    avgCost: number;
}

interface MealCostChartProps {
    data: MealCostPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload as MealCostPoint;
        return (
            <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-2xl min-w-[200px]">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {format(new Date(item.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                </p>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.mealType === 'LUNCH' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                        {item.mealType === 'LUNCH' ? 'Bữa Trưa' : 'Bữa Tối'}
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Tổng chi phí:</span>
                        <span className="text-sm font-black text-slate-900">
                            {item.totalCost.toLocaleString('vi-VN')} <small className="text-slate-400">₫</small>
                        </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Đơn giá TB:</span>
                        <span className="text-sm font-black text-emerald-600">
                            {item.avgCost.toLocaleString('vi-VN')} <small className="text-slate-400">₫/suất</small>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function MealCostChart({ data }: MealCostChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 italic bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="font-bold">Chưa có dữ liệu biến động chi phí</p>
                <p className="text-sm">Vui lòng chọn khoảng thời gian khác hoặc kiểm tra lại lịch sử nhập liệu</p>
            </div>
        );
    }

    // Prepare data for Recharts
    const chartData = data
        .sort((a, b) => {
            const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return a.mealType === 'LUNCH' ? -1 : 1;
        })
        .map((item, index) => ({
            ...item,
            timestamp: new Date(item.date).getTime(),
            displayDate: format(new Date(item.date), 'dd/MM'),
            index
        }));

    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="index"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        dy={10}
                        padding={{ left: 20, right: 30 }}
                        tickFormatter={(index) => chartData[index]?.displayDate || ''}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
                        label={{ value: 'Tổng chi phí (VNĐ)', angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fill: '#3b82f6', fontWeight: 800, fontSize: 10 } }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#10b981', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        label={{ value: 'Đơn giá TB (VNĐ)', angle: 90, position: 'insideRight', offset: -10, style: { textAnchor: 'middle', fill: '#10b981', fontWeight: 800, fontSize: 10 } }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                        isAnimationActive={false}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalCost"
                        name="Tổng chi phí"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={true}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgCost"
                        name="Đơn giá TB"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={true}
                    />
                    <Brush
                        dataKey="index"
                        height={30}
                        stroke="#e2e8f0"
                        fill="#f8fafc"
                        tickFormatter={(index) => chartData[index]?.displayDate || ''}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
