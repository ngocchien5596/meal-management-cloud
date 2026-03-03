'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    MessageSquare,
    Plus,
    Calendar as CalendarIcon,
    Star,
    Loader2,
    ChevronDown,
    ChevronUp,
    Smile
} from 'lucide-react';
import { useMyReviews } from '@/features/reviews/hooks';
import { ReviewModal } from '@/features/reviews/components/ReviewModal';
import { ImagePreviewModal } from '@/features/reviews/components/ImagePreviewModal';
import { StarRating } from '@/components/ui/StarRating';
import { resolveImageUrl } from '@/lib/utils/resolve-image-url';
import { cn } from '@/lib/utils/cn';

export default function MyReviewsPage() {
    const { data: response, isLoading } = useMyReviews();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(id)) {
            newExpandedRows.delete(id);
        } else {
            newExpandedRows.add(id);
        }
        setExpandedRows(newExpandedRows);
    };

    // Robust mapping: handle both nested and legacy flat structures
    const reportData = response?.data as any;
    const reviews = Array.isArray(reportData?.data)
        ? reportData.data
        : (Array.isArray(reportData) ? reportData : []);

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">
                <div className="flex flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-brand-soft rounded-2xl flex items-center justify-center shadow-sm border border-brand-soft2">
                                <MessageSquare className="w-6 h-6 text-brand" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tight">Đánh giá của tôi</h1>
                                <p className="text-sm text-slate-500 mt-1.5 font-medium">Lịch sử góp ý & nhận xét của bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand/20 active:scale-95 text-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Tạo đánh giá
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="relative min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-4">Đang tải lịch sử...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center animate-in fade-in zoom-in duration-500 shadow-sm flex flex-col items-center">
                                <div className="w-24 h-24 bg-brand-soft rounded-full flex items-center justify-center mb-6 transition-transform hover:scale-110">
                                    <Star className="w-12 h-12 text-brand fill-brand/10" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 uppercase mb-2">Bạn chưa có đánh giá nào</h2>
                                <p className="text-slate-400 font-medium max-w-sm mb-8">
                                    Hãy chia sẻ cảm nhận của bạn sau mỗi bữa ăn để chúng tôi nâng cao chất lượng phục vụ nhé!
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all active:scale-95"
                                >
                                    <Plus className="w-5 h-5" />
                                    Tạo đánh giá ngay
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ngày ăn</th>
                                                <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Bữa ăn</th>
                                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Đánh giá</th>
                                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nhận xét</th>
                                                <th className="px-4 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Ảnh</th>
                                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Phản hồi</th>
                                                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Chế độ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {reviews.map((review: any) => (
                                                <React.Fragment key={review.id}>
                                                    <tr className={cn(
                                                        "hover:bg-brand-soft/30 transition-colors group cursor-default",
                                                        expandedRows.has(review.id) && "bg-brand-soft/20"
                                                    )}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                                                <CalendarIcon className="w-4 h-4 text-brand/30" />
                                                                {review.mealEvent && format(new Date(review.mealEvent.mealDate), 'dd/MM/yyyy')}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <div className={cn(
                                                                "inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
                                                                review.mealEvent?.mealType === 'LUNCH'
                                                                    ? "bg-orange-50 text-orange-600 border-orange-100"
                                                                    : "bg-brand-soft text-brand-dark border-brand-soft2"
                                                            )}>
                                                                {review.mealEvent?.mealType === 'LUNCH' ? 'Trưa' : 'Tối'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <StarRating rating={review.rating} size="sm" />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-slate-600 text-sm font-medium italic line-clamp-2 min-w-[200px] max-w-[350px]" title={review.comment}>
                                                                "{review.comment || 'Không có nhận xét'}"
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex justify-center -space-x-3">
                                                                {review.images?.slice(0, 3).map((img: string, idx: number) => (
                                                                    <button
                                                                        key={idx}
                                                                        className="w-10 h-10 rounded-xl border-4 border-white shadow-sm overflow-hidden bg-slate-100 ring-1 ring-slate-100 cursor-pointer transition-transform hover:scale-110 hover:z-10"
                                                                        onClick={() => {
                                                                            setSelectedImage(resolveImageUrl(img));
                                                                            setIsPreviewOpen(true);
                                                                        }}
                                                                    >
                                                                        <img src={resolveImageUrl(img)} className="w-full h-full object-cover" alt="" />
                                                                    </button>
                                                                ))}
                                                                {(review.images?.length || 0) > 3 && (
                                                                    <div className="w-10 h-10 rounded-xl border-4 border-white bg-brand text-[10px] text-white font-black flex items-center justify-center shadow-sm">
                                                                        +{review.images.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {review.adminReply ? (
                                                                <button
                                                                    onClick={() => toggleRow(review.id)}
                                                                    className={cn(
                                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all active:scale-95",
                                                                        expandedRows.has(review.id)
                                                                            ? "bg-brand text-white shadow-lg shadow-brand/20"
                                                                            : "bg-brand-soft text-brand border border-brand-soft2 hover:bg-brand hover:text-white"
                                                                    )}
                                                                >
                                                                    <Smile className="w-3 h-3" />
                                                                    Có phản hồi
                                                                    {expandedRows.has(review.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                                </button>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Chờ...</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <span className={cn(
                                                                "text-[10px] font-black uppercase italic tracking-tighter px-2 py-0.5 rounded-full border",
                                                                review.isAnonymous
                                                                    ? "text-slate-400 bg-slate-50 border-slate-100"
                                                                    : "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                            )}>
                                                                {review.isAnonymous ? 'Ẩn danh' : 'Công khai'}
                                                            </span>
                                                        </td>
                                                    </tr>

                                                    {/* Expansion Row */}
                                                    {expandedRows.has(review.id) && review.adminReply && (
                                                        <tr className="animate-in slide-in-from-top-2 duration-300">
                                                            <td colSpan={7} className="px-12 py-6 bg-brand-soft/10">
                                                                <div className="bg-white rounded-2xl p-6 border border-brand-soft2 shadow-sm relative overflow-hidden">
                                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                                                                            <Smile className="w-4 h-4 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Phản hồi từ Ban quản lý Bếp</h4>
                                                                            {review.adminReplyAt && (
                                                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                                                                    {format(new Date(review.adminReplyAt), 'HH:mm • dd/MM/yyyy')}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/50">
                                                                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                                                            {review.adminReply}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <ImagePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                imageUrl={selectedImage}
            />
        </div>
    );
}
