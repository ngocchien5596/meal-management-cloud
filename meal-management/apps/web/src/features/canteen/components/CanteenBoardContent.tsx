'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MealDetail, MealEvent, MealReview } from '@/features/meals/api';
import { useCurrentMeal, useMeals } from '@/features/meals/hooks';
import clsx from 'clsx';
import { ImagePreviewModal } from '@/features/reviews/components/ImagePreviewModal';
import * as QRCode from 'qrcode';

/**
 * CanteenBoardContent Component
 * Pixel-perfect display board for Canteen information.
 * Reference: 1440px Desktop.
 */

interface CanteenBoardContentProps {
    currentMeal?: MealDetail;
    todayMeals?: MealEvent[];
    tomorrowMeals?: MealEvent[];
}

// --- Icons (Thin-line SVG style) ---
const ForkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 2V10C17 11.1046 16.1046 12 15 12C13.8954 12 13 11.1046 13 10V2" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 2V10C7 11.1046 7.89543 12 9 12C10.1046 12 11 11.1046 11 10V2" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 22V12" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const HistoryIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 11C10.9853 11 13 8.98528 13 6.5C13 4.01472 10.9853 2 8.5 2C6.01472 2 4 4.01472 4 6.5C4 8.98528 6.01472 11 8.5 11Z" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 2.13C18.8606 2.35251 19.623 2.85501 20.1673 3.55811C20.7117 4.2612 21.0048 5.12548 21 6.0125C21.0048 6.89952 20.7117 7.7638 20.1673 8.46689C19.623 9.16999 18.8606 9.67249 18 9.895" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BoxIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 5H2C1.44772 5 1 5.44772 1 6V8H23V6C23 5.44772 22.5523 5 22 5Z" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12H14" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CalendarIcon = ({ color = "#E11D2E" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 10H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StarIconForBoard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const QRCodeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H9V9H3V3Z" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 3H21V9H15V3Z" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 15H9V21H3V15Z" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 15H21V21H15V15Z" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 6H5V8" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 6H17V8" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 18H5V16" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 18H17V16" stroke="#E11D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CanteenBoardContent: React.FC<CanteenBoardContentProps> = ({
    currentMeal: propCurrentMeal,
    todayMeals: propTodayMeals,
    tomorrowMeals: propTomorrowMeals
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Fetch data if not provided via props
    const { data: fetchedMealRes, isLoading: isMealLoading } = useCurrentMeal({
        enabled: !propCurrentMeal
    });

    const { data: allMeals } = useMeals();

    const currentMeal = (propCurrentMeal || fetchedMealRes) as MealDetail | null;

    // Helper to get today and tomorrow meals from fetched list
    const getMealsByDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return allMeals?.filter(m => format(new Date(m.mealDate), 'yyyy-MM-dd') === dateStr) || [];
    };

    const todayMeals = propTodayMeals || getMealsByDate(new Date()) || [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowMeals = propTomorrowMeals || getMealsByDate(tomorrow) || [];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const generateQR = async () => {
            if (currentMeal?.qrToken) {
                console.log('[BOARD] Generating QR with token:', currentMeal.qrToken);
                try {
                    const url = await QRCode.toDataURL(currentMeal.qrToken, {
                        width: 300,
                        margin: 0,
                        color: {
                            dark: '#1e293b',
                            light: '#ffffff'
                        }
                    });
                    setQrCodeUrl(url);
                } catch (err) {
                    console.error('[BOARD] QR Gen Error:', err);
                    setQrCodeUrl('');
                }
            } else {
                setQrCodeUrl('');
            }
        };

        generateQR();
    }, [currentMeal?.qrToken]);

    if (!currentMeal && isMealLoading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-[#E11D2E]/20 border-t-[#E11D2E] rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-lg text-center">Đang tải dữ liệu nhà ăn...</p>
                </div>
            </div>
        );
    }

    if (!currentMeal) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
                <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-100 flex flex-col items-center max-w-md text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <ForkIcon />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase mb-3 text-center">Không có thông tin bữa ăn</h2>
                    <p className="text-slate-400 font-medium leading-relaxed text-center">
                        Hiện tại không có bữa ăn nào đang diễn ra hoặc đã được lên lịch. Vui lòng kiểm tra lại sau.
                    </p>
                </div>
            </div>
        );
    }

    const totalRegistered = currentMeal.registrations?.filter(r => !r.isCancelled).length || 0;
    const totalCheckins = currentMeal.checkins?.length || 0;
    const progress = totalRegistered > 0 ? (totalCheckins / totalRegistered) * 100 : 0;

    const todayLunch = todayMeals.find(m => m.mealType === 'LUNCH');
    const todayDinner = todayMeals.find(m => m.mealType === 'DINNER');
    const tomorrowLunch = tomorrowMeals.find(m => m.mealType === 'LUNCH');
    const tomorrowDinner = tomorrowMeals.find(m => m.mealType === 'DINNER');

    const recentHistory = [...(currentMeal.checkins || [])]
        .sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime())
        .slice(0, 20);

    const totalCost = currentMeal.ingredients?.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0) || 0;

    const half = Math.ceil((currentMeal.ingredients?.length || 0) / 2);
    const leftIngredients = currentMeal.ingredients?.slice(0, half) || [];
    const rightIngredients = currentMeal.ingredients?.slice(half) || [];

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 flex justify-center items-start overflow-auto">
            <div className="w-full bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col h-full">

                {/* 2A: TOP STRIP */}
                <div className="h-20 bg-[#fafafa] border-b border-[#e5e7eb] flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <ForkIcon />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-[#1e293b] leading-tight flex items-center gap-2">
                                BẢNG THÔNG TIN NHÀ ĂN
                            </h1>
                            <div className="flex">
                                <span className="bg-[#fee2e2] text-[#E11D2E] text-sm font-bold px-3 py-1 rounded border border-[#fecaca] uppercase">
                                    {currentMeal.mealType === 'LUNCH' ? 'BỮA TRƯA' : 'BỮA TỐI'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-10">
                        <div className="text-center">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">HÔM NAY</p>
                            <p className="text-lg font-bold text-[#1e293b]">
                                {format(new Date(currentMeal.mealDate), "EEEE, dd/MM/yyyy", { locale: vi })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#E11D2E] text-white px-6 py-2 rounded-xl shadow-lg shadow-red-200">
                        <span className="text-3xl font-bold tracking-widest tabular-nums">{format(currentTime, 'HH:mm:ss')}</span>
                    </div>
                </div>

                {/* 2B: MAIN BODY */}
                <div className="p-4 grid grid-cols-12 gap-4">

                    {/* LEFT COLUMN (67% approx) */}
                    <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">

                        {/* ROW 1: QR CODE + TODAY MENU */}
                        <div className="grid grid-cols-12 gap-4 h-[350px]">
                            {/* 3.0: QR CODE (5 cols) */}
                            <div className="col-span-5 bg-white rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col items-center justify-center p-4 relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-[#E11D2E]"></div>
                                <div className="absolute bottom-0 inset-x-0 h-1 bg-[#E11D2E]"></div>

                                {qrCodeUrl ? (
                                    <div className="h-full max-h-[180px] aspect-square relative p-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <img src={qrCodeUrl} alt="Meal QR" className="w-full h-full object-contain" />

                                        {/* Corner decorations */}
                                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E11D2E] rounded-tl-md -translate-x-0.5 -translate-y-0.5"></div>
                                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E11D2E] rounded-tr-md translate-x-0.5 -translate-y-0.5"></div>
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#E11D2E] rounded-bl-md -translate-x-0.5 translate-y-0.5"></div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#E11D2E] rounded-br-md translate-x-0.5 translate-y-0.5"></div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-40">
                                        <div className="w-12 h-12 border-2 border-dashed border-slate-400 rounded-lg mb-2"></div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400">Không có QR</span>
                                    </div>
                                )}

                                <div className="mt-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-[#E11D2E] mb-0.5">
                                        <QRCodeIcon />
                                        <h2 className="text-base font-black uppercase tracking-wide">MÃ SUẤT ĂN</h2>
                                    </div>
                                    <p className="text-xs font-medium text-slate-400 px-2 leading-tight">Quét mã này tại quầy để nhận suất ăn</p>
                                </div>
                            </div>

                            {/* 3.1: THỰC ĐƠN HÔM NAY (7 cols) */}
                            <div className="col-span-7 bg-white rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col">
                                <div className="px-4 py-3 border-b border-[#f1f5f9] flex items-center gap-3 bg-slate-50/30">
                                    <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center">
                                        <CalendarIcon />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-[#E11D2E] uppercase tracking-wide">THỰC ĐƠN HÔM NAY</h2>
                                        <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Ngon miệng mỗi ngày</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 divide-x divide-[#f1f5f9] flex-1">
                                    <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b border-blue-100 pb-1 mb-1 text-center">BỮA TRƯA</h3>
                                        <ul className="space-y-2">
                                            {todayLunch?.menuItems && todayLunch.menuItems.length > 0 ? todayLunch.menuItems.map((item, idx) => (
                                                <li key={idx} className="text-base font-bold text-[#334155] flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></span>
                                                    {item.name}
                                                </li>
                                            )) : (
                                                <li className="text-sm text-slate-400 italic">Trống</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b border-blue-100 pb-1 mb-1 text-center">BỮA TỐI</h3>
                                        <ul className="space-y-1.5">
                                            {todayDinner?.menuItems && todayDinner.menuItems.length > 0 ? todayDinner.menuItems.map((item, idx) => (
                                                <li key={idx} className="text-sm font-bold text-[#334155] flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></span>
                                                    {item.name}
                                                </li>
                                            )) : (
                                                <li className="text-sm text-slate-400 italic">Trống</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: FEEDBACK + TOMORROW MENU */}
                        <div className="grid grid-cols-12 gap-4 h-[350px]">
                            {/* 3.3: Ý KIẾN CBCNV (REVIEWS) (5 cols) */}
                            <div className="col-span-5 bg-white rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col relative overflow-hidden">
                                <div className="px-3 py-3 border-b border-[#f1f5f9] flex flex-col gap-1 items-start bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <StarIconForBoard />
                                        <h2 className="text-xs font-black text-[#1e293b] uppercase">Ý KIẾN</h2>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Phản hồi mới nhất</span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
                                    {((currentMeal as any).reviews || []).length > 0 ? (currentMeal as any).reviews.map((rev: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm font-bold text-[#E11D2E] uppercase truncate max-w-[140px]">
                                                    {rev.isAnonymous ? 'Ẩn danh' : (rev.employee?.fullName || 'Ẩn danh')}
                                                </span>
                                                <span className="text-xs text-slate-400 tabular-nums">
                                                    {format(new Date(rev.createdAt), 'HH:mm')}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#334155] font-medium line-clamp-2 leading-relaxed italic">
                                                "{rev.comment}"
                                            </p>

                                            {rev.images && rev.images.length > 0 && (
                                                <button
                                                    onClick={() => setPreviewImage(rev.images[0])}
                                                    className="mt-1 self-start flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-bold transition-colors cursor-pointer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                    Xem ảnh
                                                </button>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center py-6 opacity-40">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                                <StarIconForBoard />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400">Chưa có ý kiến nào</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3.2: THỰC ĐƠN NGÀY MAI (7 cols) */}
                            <div className="col-span-7 bg-white rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col opacity-90">
                                <div className="px-4 py-3 border-b border-[#f1f5f9] flex items-center gap-3 bg-slate-50/30">
                                    <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center">
                                        <CalendarIcon color="#f97316" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-[#E11D2E] uppercase tracking-wide">THỰC ĐƠN NGÀY MAI</h2>
                                        <p className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">Đăng ký ngay</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 divide-x divide-[#f1f5f9] flex-1">
                                    <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b border-blue-100 pb-1 mb-1 text-center">BỮA TRƯA</h3>
                                        <ul className="space-y-1.5">
                                            {tomorrowLunch?.menuItems && tomorrowLunch.menuItems.length > 0 ? tomorrowLunch.menuItems.map((item, idx) => (
                                                <li key={idx} className="text-sm font-medium text-[#334155] flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0"></span>
                                                    {item.name}
                                                </li>
                                            )) : (
                                                <li className="text-sm text-slate-400 italic">Trống</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b border-blue-100 pb-1 mb-1 text-center">BỮA TỐI</h3>
                                        <ul className="space-y-1.5">
                                            {tomorrowDinner?.menuItems && tomorrowDinner.menuItems.length > 0 ? tomorrowDinner.menuItems.map((item, idx) => (
                                                <li key={idx} className="text-sm font-medium text-[#334155] flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0"></span>
                                                    {item.name}
                                                </li>
                                            )) : (
                                                <li className="text-sm text-slate-400 italic">Trống</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (33% approx) */}
                    <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">

                        {/* 4.1: TÌNH HÌNH CHECK-IN */}
                        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xs p-5 flex flex-col gap-4 h-[140px] justify-center">
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center">TÌNH HÌNH CHECK-IN</h2>
                            <div className="flex justify-between items-end">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-6xl font-bold text-[#E11D2E]">{totalCheckins}</span>
                                    <span className="text-xl font-bold text-slate-300">/ {totalRegistered}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-emerald-500">{Math.round(progress)}%</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">HOÀN THÀNH</div>
                                </div>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#E11D2E] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* 4.2: LỊCH SỬ CHECK-IN (Expanded) */}
                        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col flex-1 h-[424px]">
                            <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <HistoryIcon />
                                    <h2 className="text-sm font-bold text-[#1e293b] uppercase">LỊCH SỬ CHECK-IN</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
                                    <div className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <div className="grid grid-cols-12 bg-[#f8fafc] px-4 py-2 border-b border-[#f1f5f9]">
                                    <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase">NHÂN VIÊN</div>
                                    <div className="col-span-4 text-[10px] font-bold text-slate-400 uppercase text-center">MNV/LOẠI</div>
                                    <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase text-right">GIỜ</div>
                                </div>
                                <div className="divide-y divide-[#f1f5f9] overflow-y-auto flex-1 custom-scrollbar">
                                    {recentHistory.length > 0 ? recentHistory.map((checkin, idx) => (
                                        <div key={idx} className="grid grid-cols-12 px-4 py-3 animate-in fade-in slide-in-from-right duration-500 text-xs font-black hover:bg-slate-50 transition-colors">
                                            <div className="col-span-5 text-[#334155] uppercase truncate pr-2">
                                                {checkin.employee?.fullName || checkin.guest?.fullName || 'Khách'}
                                            </div>
                                            <div className="col-span-4 text-center text-slate-400 uppercase">
                                                {checkin.employee?.employeeCode || 'Khách'}
                                            </div>
                                            <div className="col-span-3 text-right tabular-nums text-[#1e293b]">
                                                {format(new Date(checkin.checkinTime), 'HH:mm:ss')}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 pb-10">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                                <HistoryIcon />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-center">Chưa có lượt check-in</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5: NGUYÊN LIỆU (Full Width) */}
                    <div className="col-span-12">
                        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col">
                            <div className="px-4 py-3 border-b border-[#f1f5f9] flex items-center gap-2">
                                <BoxIcon />
                                <h2 className="text-sm font-bold text-[#1e293b] uppercase">NGUYÊN LIỆU</h2>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-[#f1f5f9] p-2">
                                {/* Left half */}
                                <div className="p-2 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#f1f5f9]">
                                                <th className="py-2 px-1">TÊN NVL</th>
                                                <th className="py-2 px-1 text-center font-bold">SỐ LƯỢNG</th>
                                                <th className="py-2 px-1 text-right font-bold">ĐƠN GIÁ</th>
                                                <th className="py-2 px-1 text-right font-bold">THÀNH TIỀN</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-bold text-[#334155]">
                                            {leftIngredients.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-2.5 px-2 truncate max-w-[180px]">{item.name}</td>
                                                    <td className="py-2.5 px-2 text-center text-slate-400">{item.quantity} {item.unit}</td>
                                                    <td className="py-2.5 px-2 text-right text-slate-400">{item.unitPrice.toLocaleString()}</td>
                                                    <td className="py-2.5 px-2 text-right text-[#1e293b]">{item.totalPrice.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Right half */}
                                <div className="p-2 overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#f1f5f9]">
                                                <th className="py-2 px-1">TÊN NVL</th>
                                                <th className="py-2 px-1 text-center font-bold">SỐ LƯỢNG</th>
                                                <th className="py-2 px-1 text-right font-bold">ĐƠN GIÁ</th>
                                                <th className="py-2 px-1 text-right font-bold">THÀNH TIỀN</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-bold text-[#334155]">
                                            {rightIngredients.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-2.5 px-1 truncate max-w-[120px]">{item.name}</td>
                                                    <td className="py-2.5 px-1 text-center text-slate-400">{item.quantity} {item.unit}</td>
                                                    <td className="py-2.5 px-1 text-right text-slate-400">{item.unitPrice.toLocaleString()}</td>
                                                    <td className="py-2.5 px-1 text-right text-[#1e293b]">{item.totalPrice.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end p-4 items-baseline gap-4 mt-2 mb-2">
                                <span className="text-sm font-bold text-[#E11D2E] uppercase">TỔNG CỘNG</span>
                                <span className="text-2xl font-bold text-[#E11D2E]">{totalCost.toLocaleString()} VND</span>
                            </div>

                            {/* 6: VERY BOTTOM ANNOUNCEMENT BAR */}
                            <div className="h-10 border-t border-[#e5e7eb] flex overflow-hidden">
                                <div className="bg-white flex items-center px-4 shrink-0">
                                    <span className="text-[10px] font-bold text-[#1e293b] uppercase tracking-[0.2em]">THÔNGBÁO</span>
                                </div>
                                <div className="flex-1 bg-[#E11D2E] flex items-center px-6 relative overflow-hidden">
                                    <div className="absolute inset-x-0 inset-y-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_100%)]"></div>
                                    <p className="whitespace-nowrap overflow-hidden text-ellipsis text-xs font-bold text-white z-10">
                                        Kính mời cán bộ công nhân viên thực hiện check-in đúng giờ để đảm bảo phục vụ tốt nhất.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!previewImage}
                imageUrl={previewImage || ''}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
};
