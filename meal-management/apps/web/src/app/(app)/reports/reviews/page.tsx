'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    FileText as FileIcon,
    Star,
    Loader2,
    User,
    MessageSquare,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { reportsApi } from '@/features/reports/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ReviewsReportPage() {
    const today = new Date();
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await reportsApi.getReviews(dateRange.start, dateRange.end);
            setReviews(data);
        } catch (error) {
            console.error('Fetch reviews error:', error);
            toast.error('Không thể tải dữ liệu đánh giá');
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
            reportsApi.exportReviews(dateRange.start, dateRange.end);
            toast.success('Đang chuẩn bị file PDF... 📄');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Không thể xuất báo cáo PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const startInputRef = React.useRef<HTMLInputElement>(null);
    const endInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
                        <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none">Báo cáo đánh giá</h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Phản hồi và nhận xét từ người dùng</p>
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
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileIcon className="w-4 h-4" />}
                        Xuất PDF
                    </button>
                </div>
            </div>

            {/* Content: List of Reviews */}
            <div className="grid grid-cols-1 gap-4 relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-3xl">
                        <Loader2 className="w-8 h-8 text-brand animate-spin" />
                    </div>
                )}

                {reviews.length === 0 && !isLoading ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Chưa có đánh giá nào trong khoảng thời gian này</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group">
                                            {review.isAnonymous ? 'Người dùng ẩn danh' : review.employee.fullName}
                                            {!review.isAnonymous && <span className="text-xs text-slate-400 ml-2 font-normal">#{review.employee.employeeCode}</span>}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {format(new Date(review.createdAt), 'HH:mm dd/MM/yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        review.mealEvent.mealType === 'LUNCH' ? "bg-orange-50 text-orange-600" : "bg-indigo-50 text-indigo-600"
                                    )}>
                                        {review.mealEvent.mealType === 'LUNCH' ? 'Bữa trưa' : 'Bữa tối'}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold font-mono">
                                        {format(new Date(review.mealEvent.mealDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            </div>

                            <div className="pl-0 sm:pl-[52px]">
                                <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                </div>

                                {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {review.images.map((img: string, idx: number) => (
                                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative group">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center hover:border-brand transition-colors">
                                                    <img src={img} alt={`Review image ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                        <ImageIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
