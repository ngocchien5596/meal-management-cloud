'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import { MealLocation } from './QuickRegisterModal';
import { cn } from '@/lib/utils/cn';
import { isDateAvailable } from '@/lib/utils/date';

interface SingleRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    mealType: 'LUNCH' | 'DINNER';
    locations: MealLocation[];
    currentLocationId?: string;
    isRegistered: boolean;
    cutoffValue?: string | number;
    userRole?: string;
    onConfirm: (locationId: string) => Promise<void>;
    onUpdate: (locationId: string) => Promise<void>;
    onCancel: () => Promise<void>;
}

const SunIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

export const SingleRegistrationModal = ({
    isOpen,
    onClose,
    date,
    mealType,
    locations,
    currentLocationId,
    isRegistered,
    cutoffValue = '16',
    userRole,
    onConfirm,
    onUpdate,
    onCancel
}: SingleRegistrationModalProps) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const defaultLoc = currentLocationId || locations.find(l => l.isDefault)?.id || locations[0]?.id || '';
            setSelectedLocationId(defaultLoc);
        }
    }, [isOpen, currentLocationId, locations]);

    // Centralized check: it's unavailable if isDateAvailable returns false
    const deadlinePassed = !isDateAvailable(date, new Date(), cutoffValue);

    const handleAction = async (action: 'confirm' | 'update' | 'cancel') => {
        if (deadlinePassed && action !== 'cancel') {
            // Block confirm/update if deadline passed
            // We allow cancellation if needed or if the backend allows it (backend has the final say)
            // But usually deadline applies to both.
            return;
        }

        setIsSubmitting(true);
        try {
            if (action === 'confirm') await onConfirm(selectedLocationId);
            else if (action === 'update') await onUpdate(selectedLocationId);
            else if (action === 'cancel') await onCancel();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const mealLabel = mealType === 'LUNCH' ? 'Trưa' : 'Tối';
    const dateLabel = date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isRegistered ? "Chỉnh sửa đăng ký" : "Đăng ký suất ăn"}
        >
            <div className="space-y-6 pt-2 pb-1">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                        mealType === 'LUNCH' ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"
                    )}>
                        {mealType === 'LUNCH' ? <SunIcon /> : <MoonIcon />}
                    </div>
                    <div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bữa {mealLabel}</div>
                        <div className="text-lg font-bold text-slate-800 capitalize leading-tight">{dateLabel}</div>
                    </div>
                </div>

                {deadlinePassed && (
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" x2="12" y1="8" y2="12" />
                                <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-rose-800 leading-tight">Đã quá hạn đăng ký/thay đổi</div>
                            <div className="text-xs text-rose-600 mt-1 leading-relaxed">
                                Hạn chót là <b>{cutoffValue}</b> của ngày hôm trước.
                                {userRole?.startsWith('ADMIN') ? " Bạn là Admin nên có thể thay đổi." : " Vui lòng liên hệ quản lý nếu cần hỗ trợ."}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-sm font-black text-slate-500 uppercase tracking-wider px-1">Chọn địa điểm ăn:</label>
                    <div className="grid grid-cols-1 gap-2">
                        {locations.map((loc) => (
                            <button
                                key={loc.id}
                                onClick={() => setSelectedLocationId(loc.id)}
                                disabled={deadlinePassed && !userRole?.startsWith('ADMIN')}
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                                    selectedLocationId === loc.id
                                        ? "bg-brand/5 border-brand shadow-md shadow-brand/10"
                                        : "bg-white border-slate-100 hover:border-slate-200",
                                    (deadlinePassed && !userRole?.startsWith('ADMIN')) && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                    selectedLocationId === loc.id ? "border-brand" : "border-slate-300"
                                )}>
                                    {selectedLocationId === loc.id && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700">{loc.name}</div>
                                    {loc.isDefault && <div className="text-[10px] font-black text-brand uppercase tracking-tight">Mặc định</div>}
                                </div>
                                <MapPinIcon className={cn("w-5 h-5", selectedLocationId === loc.id ? "text-brand" : "text-slate-300")} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                    {!isRegistered ? (
                        <button
                            onClick={() => handleAction('confirm')}
                            disabled={isSubmitting || !selectedLocationId || (deadlinePassed && !userRole?.startsWith('ADMIN'))}
                            className="w-full h-14 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-lg shadow-lg shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Đang xử lý..." : "XÁC NHẬN ĐĂNG KÝ"}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => handleAction('update')}
                                disabled={isSubmitting || !selectedLocationId || selectedLocationId === currentLocationId || (deadlinePassed && !userRole?.startsWith('ADMIN'))}
                                className="w-full h-14 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-lg shadow-lg shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Đang lưu..." : "LƯU THAY ĐỔI"}
                            </button>
                            <button
                                onClick={() => handleAction('cancel')}
                                disabled={isSubmitting}
                                className="w-full h-14 bg-white hover:bg-rose-50 text-rose-500 border-2 border-slate-100 hover:border-rose-100 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang hủy..." : "HỦY ĐĂNG KÝ SUẤT ĂN"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};
