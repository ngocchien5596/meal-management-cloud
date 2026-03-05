'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    FileText as FileIcon,
    Star,
    Loader2,
    User,
    MessageSquare,
    Image as ImageIcon,
    Activity,
    Smile,
    Camera
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { resolveImageUrl } from '@/lib/utils/resolve-image-url';
import { StarRating } from '@/components/ui/StarRating';
import { reportsApi } from '@/features/reports/api';
import { reviewApi } from '@/features/reviews/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import toast from 'react-hot-toast';

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

export default function ReviewsReportPage() {
    const today = new Date();
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd')
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({ totalReviews: 0, avgRating: 0, withImages: 0, anonymousCount: 0, responseRate: 0 });
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await reportsApi.getReviews(dateRange.start, dateRange.end);
            const reportData = response.data as any;

            // Robust mapping: handle both nested and legacy flat structures
            const actualReviews = Array.isArray(reportData?.data)
                ? reportData.data
                : (Array.isArray(reportData) ? reportData : []);

            const actualSummary = reportData?.summary || (response as any).summary || summary;

            setReviews(actualReviews);
            setSummary(actualSummary);
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

    const handleReply = async (reviewId: string) => {
        if (!replyText.trim()) {
            toast.error('Vui lòng nhập nội dung phản hồi');
            return;
        }

        setIsSubmittingReply(true);
        try {
            await reviewApi.replyToReview(reviewId, replyText);
            toast.success('Đã gửi phản hồi thành công! ✉️');
            setReplyingTo(null);
            setReplyText('');
            fetchData(); // Refresh to show the new reply
        } catch (error) {
            console.error('Reply error:', error);
            toast.error('Không thể gửi phản hồi');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await reportsApi.exportReviews(dateRange.start, dateRange.end);
            toast.success('Xuất báo cáo PDF thành công! 📄');
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
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">
                <div className="flex flex-col gap-6">
                    {/* Header section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand-200">
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
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-200 active:scale-95 disabled:opacity-50"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileIcon className="w-4 h-4" />}
                                Xuất PDF
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            label="Điểm hài lòng TB"
                            value={isLoading ? '...' : summary.avgRating}
                            subValue="/ 5"
                            icon={Star}
                            color="amber"
                        />
                        <StatCard
                            label="Đánh giá có ảnh"
                            value={isLoading ? '...' : summary.withImages}
                            subValue="Hình ảnh"
                            icon={Camera}
                            color="brand"
                        />
                        <StatCard
                            label="Tổng số phản hồi"
                            value={isLoading ? '...' : summary.totalReviews}
                            subValue="Lượt gửi"
                            icon={MessageSquare}
                            color="rose"
                        />
                    </div>

                    {/* Content: List of Reviews */}
                    <div className="grid grid-cols-1 gap-4 relative min-h-[400px]">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-3xl">
                                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                            </div>
                        )}

                        {(!reviews || reviews.length === 0) && !isLoading ? (
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
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900">
                                                        {review.isAnonymous ? 'Người dùng ẩn danh' : review.employee.fullName}
                                                    </p>
                                                    {!review.isAnonymous && <span className="text-xs text-slate-400 font-normal">#{review.employee.employeeCode}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="text-[11px] text-slate-400 font-bold">•</span>
                                                    <p className="text-[11px] text-slate-400 font-bold">
                                                        {format(new Date(review.createdAt), 'HH:mm dd/MM/yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold",
                                                review.mealEvent.mealType === 'LUNCH' ? "bg-orange-50 text-orange-600" : "bg-brand-soft text-brand-dark"
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
                                            <div className="flex flex-wrap gap-3 mb-6">
                                                {review.images.map((img: string, idx: number) => (
                                                    <a key={idx} href={resolveImageUrl(img)} target="_blank" rel="noopener noreferrer" className="relative group">
                                                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center hover:border-brand transition-colors shadow-sm">
                                                            <img src={resolveImageUrl(img)} alt={`Review image ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                                                <ImageIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Admin Reply Section */}
                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                            {review.adminReply ? (
                                                <div className="bg-brand-soft/30 rounded-2xl p-4 border border-brand-soft2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-brand rounded-lg flex items-center justify-center">
                                                                <Smile className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                            <span className="text-[11px] font-black uppercase text-brand tracking-wider">Phản hồi từ Bếp</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(review.id);
                                                                setReplyText(review.adminReply);
                                                            }}
                                                            className="text-[10px] font-bold text-slate-400 hover:text-brand transition-colors uppercase"
                                                        >
                                                            Chỉnh sửa
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{review.adminReply}</p>
                                                    {review.adminReplyAt && (
                                                        <p className="text-[10px] text-slate-400 mt-2 font-medium italic">
                                                            Đã gửi: {format(new Date(review.adminReplyAt), 'HH:mm dd/MM/yyyy')}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                replyingTo !== review.id && (
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(review.id);
                                                            setReplyText('');
                                                        }}
                                                        className="inline-flex items-center gap-2 text-slate-400 hover:text-brand transition-colors text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:border-brand-soft2 shadow-sm active:scale-95 transition-all"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Gửi phản hồi cho người ăn
                                                    </button>
                                                )
                                            )}

                                            {replyingTo === review.id && (
                                                <div className="bg-slate-50 rounded-2xl p-4 border border-brand-soft2 animate-in slide-in-from-top-2 duration-300">
                                                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">Nội dung phản hồi</p>
                                                    <textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Nhập lời cảm ơn hoặc giải thích tại đây..."
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all min-h-[100px] outline-none"
                                                        autoFocus
                                                    />
                                                    <div className="flex items-center justify-end gap-3 mt-4">
                                                        <button
                                                            onClick={() => setReplyingTo(null)}
                                                            disabled={isSubmittingReply}
                                                            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                                        >
                                                            Hủy
                                                        </button>
                                                        <button
                                                            onClick={() => handleReply(review.id)}
                                                            disabled={isSubmittingReply || !replyText.trim()}
                                                            className="flex items-center gap-2 bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all disabled:opacity-50 active:scale-95"
                                                        >
                                                            {isSubmittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smile className="w-4 h-4" />}
                                                            Gửi phản hồi
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
