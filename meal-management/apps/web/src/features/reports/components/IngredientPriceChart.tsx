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
    AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PricePoint {
    date: string;
    mealType: 'LUNCH' | 'DINNER';
    unitPrice: number;
    unit: string;
}

interface IngredientPriceChartProps {
    data: PricePoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload as PricePoint;
        return (
            <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-2xl">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {format(new Date(item.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                </p>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${item.mealType === 'LUNCH' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                        {item.mealType === 'LUNCH' ? 'Bữa Trưa' : 'Bữa Tối'}
                    </span>
                </div>
                <p className="text-lg font-black text-slate-900">
                    {item.unitPrice.toLocaleString('vi-VN')} <span className="text-sm font-bold text-slate-500">VNĐ/{item.unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

export function IngredientPriceChart({ data }: IngredientPriceChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 italic bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="font-bold">Chưa có dữ liệu biến động giá</p>
                <p className="text-sm">Vui lòng chọn khoảng thời gian khác hoặc kiểm tra lại lịch sử nhập liệu</p>
            </div>
        );
    }

    // Prepare data for Recharts: Ensure unique keys for XAxis if helpful, 
    // but here we want to show every meal, so we use the index or a combo string.
    const chartData = data.map((item, index) => ({
        ...item,
        timestamp: new Date(item.date).getTime(),
        displayDate: format(new Date(item.date), 'dd/MM'),
        displayName: `${format(new Date(item.date), 'dd/MM')} (${item.mealType === 'LUNCH' ? 'Trưa' : 'Tối'})`,
        index
    }));

    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="index"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                        padding={{ left: 20, right: 30 }}
                        tickFormatter={(index) => chartData[index]?.displayDate || ''}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="unitPrice"
                        stroke="#0F172A"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#0F172A', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, fill: '#FF5733', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={false}
                    />
                    <Brush
                        dataKey="index"
                        height={30}
                        stroke="#e2e8f0"
                        fill="#f8fafc"
                        tickFormatter={(index) => chartData[index]?.displayDate || ''}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
