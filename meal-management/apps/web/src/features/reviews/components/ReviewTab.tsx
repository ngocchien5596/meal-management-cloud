'use client';

import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useMealReviews } from '../hooks';
import { MealReview } from '../api';

import { ImagePreviewModal } from './ImagePreviewModal';

interface ReviewTabProps {
    mealId: string;
}

export function ReviewTab({ mealId }: ReviewTabProps) {
    const { data: response, isLoading } = useMealReviews(mealId);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    if (isLoading) {
        // ... (keep loading state)
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-4 border-brand/10 border-t-brand rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Đang tải đánh giá...</p>
            </div>
        );
    }

    const reviews = (response as unknown as { data: MealReview[] })?.data || [];

    if (reviews.length === 0) {
        // ... (keep empty state)
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                </div>
                <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Chưa có đánh giá nào cho bữa ăn này.</p>
                <p className="text-xs text-gray-400 mt-1">Ý kiến của bạn giúp chúng tôi cải thiện chất lượng phục vụ!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {reviews.map((review) => (
                    <div key={review.id} className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:border-brand-soft2">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-gray-100 text-slate-400 group-hover:bg-brand-soft group-hover:text-brand transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 leading-tight">
                                        {review.isAnonymous ? 'Người dùng ẩn danh' : review.employeeName}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {format(new Date(review.createdAt), 'HH:mm • dd/MM/yyyy', { locale: vi })}
                                    </p>
                                </div>
                            </div>
                            {review.images && review.images.length > 0 && (
                                <span className="bg-brand-soft text-brand text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border border-brand-soft2">
                                    Có ảnh
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4 italic">
                            "{review.comment}"
                        </p>

                        {review.images && review.images.length > 0 && (
                            <div className="grid grid-cols-1 gap-2">
                                {review.images.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-100 cursor-zoom-in group/image"
                                        onClick={() => setSelectedImage(url)}
                                    >
                                        <img
                                            src={url}
                                            alt="Review content"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="11" cy="11" r="8" />
                                                <path d="m21 21-4.3-4.3" />
                                                <path d="M11 8v6" />
                                                <path d="M8 11h6" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ImagePreviewModal
                isOpen={!!selectedImage}
                imageUrl={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </>
    );
}
