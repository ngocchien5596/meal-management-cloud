'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Calendar as CalendarIcon, Upload, X, Camera, Loader2 } from 'lucide-react'; // Added Icons
import { Modal, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils/cn'; // Added cn
import { useCreateReview, useImageUpload } from '../hooks'; // Added hook
import { ImagePreviewModal } from './ImagePreviewModal';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
    const [date, setDate] = useState(format(new Date(), 'dd/MM/yyyy'));
    const dateInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

    const [mealType, setMealType] = useState<'LUNCH' | 'DINNER'>('LUNCH');
    const [comment, setComment] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isAnonymous, setIsAnonymous] = useState(true);

    const [localPreview, setLocalPreview] = useState<string | null>(null); // NEW: Local blob for immediate preview

    const createReview = useCreateReview();
    const { uploadImage, isUploading, isCompressing } = useImageUpload();

    // Cleanup blob url on unmount
    useEffect(() => {
        return () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
        };
    }, [localPreview]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if image
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        // 1. Immediate Local Preview
        const objectUrl = URL.createObjectURL(file);
        setLocalPreview(objectUrl);

        // Reset input to allow re-selecting same file
        e.target.value = '';

        // 2. Upload in background
        const uploadedUrl = await uploadImage(file);
        if (uploadedUrl) {
            setImageUrl(uploadedUrl);
        } else {
            // If upload fails, maybe clear preview or show error state?
            // For now, keep preview but submission will fail validation if logic requires imageUrl
            // But currently logic allows empty image? No, let's keep it simple.
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if upload is still in progress
        if ((isUploading || isCompressing) && !imageUrl) {
            toast.error('Vui lòng đợi ảnh tải lên hoàn tất');
            return;
        }

        // Parse date from dd/MM/yyyy to yyyy-MM-dd
        const parsedDate = parse(date, 'dd/MM/yyyy', new Date());
        if (!isValid(parsedDate)) {
            toast.error('Ngày không hợp lệ. Vui lòng nhập đúng định dạng dd/mm/yyyy');
            return;
        }
        const formattedDate = format(parsedDate, 'yyyy-MM-dd');

        if (!comment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        try {
            await createReview.mutateAsync({
                date: formattedDate,
                mealType,
                comment,
                isAnonymous,
                images: imageUrl ? [imageUrl] : [],
            });
            toast.success('Gửi đánh giá thành công! Cảm ơn bạn.');
            setComment('');
            setImageUrl('');
            setLocalPreview(null); // Clear local preview
            onClose();
        } catch (error: any) {
            console.error('Submit review error:', error);
            const errorMessage = error?.error || error?.response?.data?.error || error?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.';
            toast.error(errorMessage);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Đánh giá bữa ăn">
            <form onSubmit={handleSubmit} className="space-y-5 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ngày ăn</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="dd/mm/yyyy"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm transition-all"
                            />
                            <div
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-brand"
                                onClick={() => dateInputRef.current?.showPicker()}
                            >
                                <CalendarIcon size={18} />
                            </div>
                            <input
                                type="date"
                                ref={dateInputRef}
                                className="absolute opacity-0 pointer-events-none w-0 h-0"
                                tabIndex={-1}
                                aria-hidden="true"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const pickerDate = parse(e.target.value, 'yyyy-MM-dd', new Date());
                                        if (isValid(pickerDate)) {
                                            setDate(format(pickerDate, 'dd/MM/yyyy'));
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Bữa ăn</label>
                        <select
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value as any)}
                            className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm transition-all bg-white"
                        >
                            <option value="LUNCH">Bữa Trưa</option>
                            <option value="DINNER">Bữa Tối</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nội dung</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng bữa ăn, thái độ phục vụ..."
                        className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm resize-none transition-all placeholder:text-gray-400"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hình ảnh minh họa</label>

                    {/* File Input (Hidden) */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />

                    {!localPreview && !imageUrl ? (
                        <div
                            onClick={() => !isUploading && !isCompressing && fileInputRef.current?.click()}
                            className={`
                                group relative w-full h-32 rounded-xl border-2 border-dashed border-gray-200 
                                flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                                hover:border-brand hover:bg-brand/5
                                ${isUploading || isCompressing ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {isCompressing ? (
                                <>
                                    <Loader2 className="w-8 h-8 text-brand animate-spin" />
                                    <span className="text-sm font-medium text-gray-500">Đang nén ảnh...</span>
                                </>
                            ) : isUploading ? (
                                <>
                                    <Loader2 className="w-8 h-8 text-brand animate-spin" />
                                    <span className="text-sm font-medium text-gray-500">Đang tải lên...</span>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 rounded-full bg-gray-50 group-hover:bg-white transition-colors">
                                        <Camera className="w-6 h-6 text-gray-400 group-hover:text-brand" />
                                    </div>
                                    <span className="text-sm text-gray-400 group-hover:text-brand font-medium">
                                        Nhấn để chụp hoặc chọn ảnh
                                    </span>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group cursor-zoom-in" onClick={() => (localPreview || imageUrl) && setPreviewImage(localPreview || imageUrl)}>
                            <img
                                src={localPreview || imageUrl}
                                alt="Preview"
                                className={cn("w-full h-full object-cover transition-opacity", (isUploading || isCompressing) ? "opacity-50" : "opacity-100")}
                            />
                            {/* Loading Overlay */}
                            {(isUploading || isCompressing) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin drop-shadow-md" />
                                </div>
                            )}

                            {/* Overlay for actions */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                            {/* Remove button (top right) */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setImageUrl('');
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:bg-red-50 text-red-500 shadow-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                                title="Xóa ảnh"
                            >
                                <X size={16} />
                            </button>

                            {/* Zoom indicator (center) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/50 p-2 rounded-full text-white backdrop-blur-sm">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                        <path d="M11 8v6" />
                                        <path d="M8 11h6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ... (rest of form) */}

                <ImagePreviewModal
                    isOpen={!!previewImage}
                    imageUrl={previewImage}
                    onClose={() => setPreviewImage(null)}
                />

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-5 h-5 text-brand rounded-md border-gray-300 focus:ring-brand cursor-pointer transition-all"
                        />
                    </div>
                    <label htmlFor="anonymous" className="text-sm font-semibold text-gray-600 cursor-pointer select-none">
                        Gửi đánh giá dưới chế độ ẩn danh
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl h-11 px-6 font-bold text-gray-500"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        isLoading={createReview.isPending || isUploading || isCompressing}
                        className="rounded-xl h-11 px-8 font-bold bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 transition-all active:scale-95"
                    >
                        Gửi phản hồi ngay
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
