'use client';

import { useState, useEffect, useMemo } from 'react';
import * as QRCode from 'qrcode';
import { cn } from '@/lib/utils/cn';
import { Modal } from '@/components/ui';
import { MenuItem, registrationApi } from '@/features/registrations/api';
import { useRegistrationCalendar, useToggleRegistration, useUpdateRegistrationLocation } from '@/features/registrations/hooks';
import { usePrices, useSystemConfig } from '@/features/system/hooks';
import { useUser } from '@/features/auth/hooks';
import { QuickRegisterModal } from '@/features/registrations/components/QuickRegisterModal';
import { SingleRegistrationModal } from '@/features/registrations/components/SingleRegistrationModal';
import type { MealLocation } from '@/features/registrations/components/QuickRegisterModal';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const CUTOFF_HOUR = 16;

// --- Updated Premium Icons ---

const ChevronLeft = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const ChevronRight = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const ChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

const SunIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

const MoonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const UtensilsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
);

const CreditCardIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
);

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
);

// --- Helper Logic ---

const isDateAvailable = (dayDate: Date, now: Date): boolean => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());

    const diffTime = checkDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return false; // Không cho phép ngày quá khứ hoặc hôm nay
    if (diffDays === 1) {
        // Ngày mai: chỉ cho phép nếu trước 16:00 hôm nay
        return now.getHours() < CUTOFF_HOUR;
    }
    return true; // Các ngày xa hơn: cho phép
};

const isToday = (dayDate: Date, now: Date): boolean => {
    return dayDate.getDate() === now.getDate() && dayDate.getMonth() === now.getMonth() && dayDate.getFullYear() === now.getFullYear();
};

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

// Types
type MealState = 'eaten' | 'skipped' | 'missed' | 'registered' | 'available' | 'cancelled' | null;

interface DayData {
    day: number;
    date: Date;
    disabled?: boolean;
    prevMonth?: boolean;
    nextMonth?: boolean;
    lunch: MealState;
    dinner: MealState;
    lunchLocationId?: string;
    dinnerLocationId?: string;
    lunchMenu?: MenuItem[];
    dinnerMenu?: MenuItem[];
    lunchQrToken?: string;
    dinnerQrToken?: string;
}

const generateCalendarData = (year: number, month: number, now: Date): DayData[] => {
    const data: DayData[] = [];
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        data.push({ day, date: new Date(prevYear, prevMonth, day), prevMonth: true, disabled: true, lunch: null, dinner: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const canReg = isDateAvailable(date, now);
        // Default to 'available' if can still register, 'missed' if past cutoff
        const defaultState = canReg ? 'available' : 'missed';
        data.push({ day: d, date, lunch: defaultState, dinner: defaultState });
    }

    const totalCells = 42;
    const remaining = totalCells - data.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    for (let d = 1; d <= remaining; d++) {
        data.push({ day: d, date: new Date(nextYear, nextMonth, d), nextMonth: true, disabled: true, lunch: null, dinner: null });
    }
    return data;
};

const calculateKPI = (calendarData: DayData[], prices: any[] = []) => {
    let totalEaten = 0, totalSkipped = 0, totalRegistered = 0;
    let totalCost = 0;

    const getPriceForDate = (date: Date) => {
        // Handle cases where data might be nested or undefined
        const pricesList = Array.isArray(prices) ? prices : (prices as any)?.data ? (prices as any).data : [];
        if (!pricesList || pricesList.length === 0) return 0; // Return 0 only if absolutely no data

        // Normalize target date to exactly 12:00 PM local
        const target = new Date(date);
        target.setHours(12, 0, 0, 0);

        const match = pricesList.find((p: any) => {
            const start = new Date(p.startDate);
            start.setHours(0, 0, 0, 0);

            const end = p.endDate ? new Date(p.endDate) : null;
            if (end) end.setHours(23, 59, 59, 999);

            return start <= target && (!end || end >= target);
        });

        // 25.000 is an assumed basic fallback if a user has meals but no price config handles that exact date boundary
        return match ? match.price : 0;
    };

    calendarData.forEach(day => {
        if (day.prevMonth || day.nextMonth || day.disabled) return;
        ['lunch', 'dinner'].forEach(m => {
            const state = m === 'lunch' ? day.lunch : day.dinner;
            if (state === 'eaten') {
                totalEaten++;
                totalCost += getPriceForDate(day.date);
            }
            else if (state === 'skipped') {
                totalSkipped++;
                // Báo cáo tính phí cả bữa bỏ lỡ, nên dashboard cũng phải tính
                totalCost += getPriceForDate(day.date);
            }
            else if (state === 'registered') totalRegistered++;
            // Note: 'cancelled' and 'missed' states are ignored in KPI calculations
        });
    });
    return { totalEaten, totalSkipped, totalRegistered, totalCost };
};

const formatNumber = (num: number): string => num.toString().padStart(2, '0');
const formatCurrency = (amount: number): string => new Intl.NumberFormat('vi-VN').format(amount);

const MONTH_NAMES = ['Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06', 'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const MealMenuModal = ({ isOpen, onClose, lunchMenu, dinnerMenu, date, lunchQrToken, dinnerQrToken }: { isOpen: boolean, onClose: () => void, lunchMenu: MenuItem[], dinnerMenu: MenuItem[], date: Date, lunchQrToken?: string, dinnerQrToken?: string }) => {
    const hasLunch = lunchMenu.length > 0;
    const hasDinner = dinnerMenu.length > 0;

    const [lunchQrUrl, setLunchQrUrl] = useState('');
    const [dinnerQrUrl, setDinnerQrUrl] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (lunchQrToken) QRCode.toDataURL(lunchQrToken, { width: 150, margin: 1 }).then(setLunchQrUrl).catch(console.error);
        if (dinnerQrToken) QRCode.toDataURL(dinnerQrToken, { width: 150, margin: 1 }).then(setDinnerQrUrl).catch(console.error);
    }, [isOpen, lunchQrToken, dinnerQrToken]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Thực đơn ngày ${date.toLocaleDateString('vi-VN')}`}
        >
            <div className="space-y-6 py-2">
                {/* Lunch Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <SunIcon className="w-4 h-4 text-orange-500" />
                        <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Bữa Trưa</h3>
                    </div>
                    {hasLunch ? (
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="grid grid-cols-1 gap-2 flex-1 w-full">
                                {lunchMenu.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">{item.catalog.name}</span>
                                    </div>
                                ))}
                            </div>
                            {lunchQrUrl && (
                                <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-sm shrink-0 mx-auto md:mx-0">
                                    <img src={lunchQrUrl} alt="Lunch QR Code" className="w-[120px] h-[120px] object-contain" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic px-1">Chưa có thực đơn cho bữa trưa.</p>
                    )}
                </div>

                <div className="h-px bg-slate-100" />

                {/* Dinner Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <MoonIcon className="w-4 h-4 text-indigo-500" />
                        <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Bữa Tối</h3>
                    </div>
                    {hasDinner ? (
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="grid grid-cols-1 gap-2 flex-1 w-full">
                                {dinnerMenu.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-700 uppercase tracking-tight text-sm">{item.catalog.name}</span>
                                    </div>
                                ))}
                            </div>
                            {dinnerQrUrl && (
                                <div className="p-2 border border-slate-100 rounded-xl bg-white shadow-sm shrink-0 mx-auto md:mx-0">
                                    <img src={dinnerQrUrl} alt="Dinner QR Code" className="w-[120px] h-[120px] object-contain" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic px-1">Chưa có thực đơn cho bữa tối.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const InfoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

// --- Day Cell Component ---

const DayCell = ({ data, now, onToggle, onShowMenu }: { data: DayData; now: Date; onToggle: (day: number, meal: 'lunch' | 'dinner') => void; onShowMenu: (lunchMenu: MenuItem[], dinnerMenu: MenuItem[], date: Date, lunchQrToken?: string, dinnerQrToken?: string) => void; }) => {
    const { day, date, disabled, prevMonth, nextMonth, lunch, dinner, lunchMenu, dinnerMenu } = data;
    const available = !prevMonth && !nextMonth && !disabled && isDateAvailable(date, now);
    const isTodayDate = !prevMonth && !nextMonth && isToday(date, now);
    const hasMenu = (lunchMenu && lunchMenu.length > 0) || (dinnerMenu && dinnerMenu.length > 0);

    const getButton = (type: MealState, meal: 'lunch' | 'dinner') => {
        if (prevMonth || nextMonth || disabled) return null;

        // 1. Explicit States (Priority)
        if (type === 'eaten') return <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 ring-2 ring-white group-hover:scale-110 transition-transform"><UtensilsIcon className="w-5 h-5 text-white" /></div>;
        if (type === 'skipped') return <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 ring-2 ring-white group-hover:scale-110 transition-transform"><XIcon className="w-5 h-5 text-white" /></div>;
        if (type === 'cancelled') return <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center ring-2 ring-white" title="Suất ăn đã bị nhà bếp hủy"><XIcon className="w-5 h-5 text-slate-400" /></div>;

        if (type === 'registered') {
            if (!available) {
                return <div className="w-10 h-10 bg-state-info/50 rounded-xl flex items-center justify-center ring-2 ring-white"><CheckIcon className="w-5 h-5 text-white/50" /></div>;
            }
            return (
                <button
                    onClick={() => onToggle(day, meal)}
                    className="w-10 h-10 bg-state-info rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:scale-110 transition-all shadow-lg shadow-blue-100 ring-2 ring-white"
                >
                    <CheckIcon className="w-5 h-5 text-white" />
                </button>
            );
        }

        // 2. Availability / Fallback
        if (available) {
            return (
                <button onClick={() => onToggle(day, meal)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-200 hover:scale-110 transition-all ring-2 ring-white group">
                    <PlusIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                </button>
            );
        }

        // 3. Unavailable / Past
        return <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center ring-2 ring-white"><XIcon className="w-5 h-5 text-slate-400" /></div>;
    };

    return (
        <div className={cn(
            "group min-h-[110px] p-3 rounded-2xl border transition-all duration-300 relative flex flex-col gap-2",
            isTodayDate ? "bg-white border-brand-soft2 shadow-xl shadow-brand-soft/20 z-10 scale-[1.02] opacity-75" :
                available ? "bg-white border-vtborder hover:border-brand-soft hover:shadow-lg hover:shadow-brand-soft/10" :
                    "bg-surface-2 opacity-60"
        )}>
            <div className="flex justify-between items-start">
                <span className={cn(
                    "text-lg font-bold tracking-tight",
                    isTodayDate ? "text-brand" : available ? "text-vttext-primary" : "text-vttext-muted"
                )}>
                    {day}
                </span>
                <div className="flex items-center gap-1.5">
                    {hasMenu && (
                        <button
                            onClick={() => onShowMenu(lunchMenu || [], dinnerMenu || [], date, data.lunchQrToken, data.dinnerQrToken)}
                            className="p-1.5 bg-brand-soft text-brand rounded-xl hover:bg-brand hover:text-white transition-all shadow-sm"
                            title="Xem thực đơn ngày"
                        >
                            <InfoIcon className="w-4 h-4" />
                        </button>
                    )}
                    {isTodayDate && <span className="text-[10px] font-black bg-brand text-white px-2 py-0.5 rounded-full tracking-tighter">HÔM NAY</span>}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-end gap-3 mt-1">
                <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 pl-1">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Trưa</span>
                        </div>
                        {getButton(lunch, 'lunch')}
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-1 mt-4" />
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 pr-1">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Tối</span>
                        </div>
                        {getButton(dinner, 'dinner')}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MobileDayItem = ({ data, now, onToggle, onShowMenu }: { data: DayData; now: Date; onToggle: (day: number, meal: 'lunch' | 'dinner') => void; onShowMenu: (lunchMenu: MenuItem[], dinnerMenu: MenuItem[], date: Date, lunchQrToken?: string, dinnerQrToken?: string) => void; }) => {
    const { day, date, disabled, prevMonth, nextMonth, lunch, dinner, lunchMenu, dinnerMenu } = data;
    if (prevMonth || nextMonth) return null;

    const available = !disabled && isDateAvailable(date, now);
    const isTodayDate = isToday(date, now);
    const hasMenu = (lunchMenu && lunchMenu.length > 0) || (dinnerMenu && dinnerMenu.length > 0);

    const daysOfWeek = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];
    const dayName = daysOfWeek[date.getDay()];

    const getButton = (type: MealState, meal: 'lunch' | 'dinner') => {
        if (disabled) return null;

        const isLunch = meal === 'lunch';
        const Icon = isLunch ? SunIcon : MoonIcon;

        // 1. Explicit States
        if (type === 'eaten') return <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 ring-2 ring-white/50"><UtensilsIcon className="w-6 h-6 text-white" /></div>;
        if (type === 'skipped') return <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 ring-2 ring-white/50"><XIcon className="w-6 h-6 text-white" /></div>;
        if (type === 'cancelled') return <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100" title="Suất ăn đã bị nhà bếp hủy"><XIcon className="w-5 h-5 text-slate-300" /></div>;

        if (type === 'registered') {
            if (!available) {
                return <div className="w-11 h-11 bg-state-info/50 rounded-xl flex items-center justify-center ring-1 ring-slate-100"><CheckIcon className="w-6 h-6 text-white/50" /></div>;
            }
            return (
                <button
                    onClick={() => onToggle(day, meal)}
                    className="w-11 h-11 bg-state-info rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-md shadow-blue-100"
                >
                    <CheckIcon className="w-6 h-6 text-white" />
                </button>
            );
        }

        // 2. Availability / Fallback
        if (available) {
            return (
                <button onClick={() => onToggle(day, meal)} className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-slate-200">
                    <PlusIcon className="w-6 h-6 text-slate-400" />
                </button>
            );
        }

        // 3. Unavailable / Past
        return <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100"><XIcon className="w-5 h-5 text-slate-300" /></div>;
    };

    return (
        <div className={cn(
            "flex items-center justify-between p-4 border-b border-slate-100 last:border-0",
            isTodayDate ? "bg-brand-soft/30 -mx-2 px-6" : ""
        )}>
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <span className={cn("text-2xl font-black tracking-tighter", isTodayDate ? "text-brand" : "text-slate-700")}>{day}</span>
                    <div className="flex items-center gap-1.5">
                        {hasMenu && (
                            <button
                                onClick={() => onShowMenu(lunchMenu || [], dinnerMenu || [], date, data.lunchQrToken, data.dinnerQrToken)}
                                className="p-1.5 bg-brand-soft text-brand rounded-xl border border-brand/10 transition-all shadow-sm"
                            >
                                <InfoIcon className="w-4 h-4" />
                            </button>
                        )}
                        {isTodayDate && <span className="text-[9px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">HÔM NAY</span>}
                    </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{dayName}</span>
            </div>

            <div className="flex items-center gap-6">
                {/* Lunch */}
                <div className="flex flex-col items-center gap-2">
                    <SunIcon className="w-4 h-4 text-orange-400" />
                    {getButton(lunch, 'lunch')}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-slate-200" />

                {/* Dinner */}
                <div className="flex flex-col items-center gap-2">
                    <MoonIcon className="w-4 h-4 text-indigo-400" />
                    {getButton(dinner, 'dinner')}
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Page ---

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
    const [isPresetOpen, setIsPresetOpen] = useState(false);
    const [editingRegistration, setEditingRegistration] = useState<{ day: number, date: Date, meal: 'lunch' | 'dinner', isRegistered: boolean, currentLocationId?: string } | null>(null);
    const [activeMenu, setActiveMenu] = useState<{ lunch: MenuItem[], dinner: MenuItem[], date: Date, lunchQrToken?: string, dinnerQrToken?: string } | null>(null);

    const { data: apiResponse, isLoading } = useRegistrationCalendar(selectedYear, selectedMonth);
    const { data: prices } = usePrices();
    const { data: config } = useSystemConfig();
    const { user } = useUser();
    const toggleReg = useToggleRegistration();
    const updateLocation = useUpdateRegistrationLocation();

    const cutoffHour = parseInt((config as any)?.['CUT_OFF_HOUR'] || '16', 10);
    const userRole = user?.role;

    // Fetch locations for selection
    const { data: locationsResponse } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const res = await api.get<MealLocation[]>('/locations');
            return res.data;
        }
    });
    const locations = locationsResponse || [];

    // Sync with server time
    useEffect(() => {
        setMounted(true);
        registrationApi.getServerTime().then(res => {
            if (res.success && res.data?.serverTime) {
                setCurrentTime(new Date(res.data.serverTime));
            }
        }).catch((error: any) => {
            toast.error(`Tải lại thất bại: ${(error as any)?.response?.data?.error?.message || error.message}`);
        });

        const timer = setInterval(() => {
            setCurrentTime(prev => new Date(prev.getTime() + 60000));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const calendarData = useMemo(() => {
        const baseData = generateCalendarData(selectedYear, selectedMonth, currentTime);
        if (!apiResponse) return baseData;

        const events = apiResponse;

        return baseData.map(day => {
            if (day.prevMonth || day.nextMonth || day.disabled) return day;

            const dayEvents = events.filter((e: any) => {
                const eDate = new Date(e.mealDate);
                return eDate.getDate() === day.day &&
                    eDate.getMonth() === selectedMonth &&
                    eDate.getFullYear() === selectedYear;
            });

            const lunchEvent = dayEvents.find((e: any) => e.mealType === 'LUNCH');
            const dinnerEvent = dayEvents.find((e: any) => e.mealType === 'DINNER');

            const getMealState = (event: any, date: Date): MealState => {
                const available = isDateAvailable(date, currentTime);
                const isTodayDate = isToday(date, currentTime);

                const registration = event?.registrations?.[0];
                const hasCheckin = event?.checkins?.length > 0;

                if (!registration) {
                    return (available || isTodayDate) ? 'available' : 'missed';
                }

                if (registration.isCancelled) {
                    return 'cancelled';
                }

                if (hasCheckin) return 'eaten';
                if (event?.status === 'COMPLETED') return 'skipped';

                const todayBoundary = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                const mDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                if (mDate >= todayBoundary) return 'registered';

                return 'skipped';
            };

            return {
                ...day,
                lunch: getMealState(lunchEvent, day.date),
                dinner: getMealState(dinnerEvent, day.date),
                lunchLocationId: lunchEvent?.registrations?.[0]?.locationId,
                dinnerLocationId: dinnerEvent?.registrations?.[0]?.locationId,
                lunchMenu: lunchEvent?.menuItems || [],
                dinnerMenu: dinnerEvent?.menuItems || [],
                lunchQrToken: lunchEvent ? (lunchEvent.qrToken || `MEAL-${lunchEvent.id}`) : undefined,
                dinnerQrToken: dinnerEvent ? (dinnerEvent.qrToken || `MEAL-${dinnerEvent.id}`) : undefined,
            };
        });
    }, [selectedYear, selectedMonth, apiResponse, currentTime]);

    const handleShowMenu = (lunch: MenuItem[], dinner: MenuItem[], date: Date, lunchQrToken?: string, dinnerQrToken?: string) => {
        setActiveMenu({ lunch, dinner, date, lunchQrToken, dinnerQrToken });
    };

    const kpi = useMemo(() => calculateKPI(calendarData, prices), [calendarData, prices]);

    const handleMonthChange = (offset: number) => {
        if (selectedMonth + offset < 0) {
            setSelectedMonth(11);
            setSelectedYear(prev => prev - 1);
        }
        else if (selectedMonth + offset > 11) {
            setSelectedMonth(0);
            setSelectedYear(prev => prev + offset >= 12 ? prev + 1 : prev); // Simplified for safety
            setSelectedYear(prev => prev + 1);
        }
        else {
            setSelectedMonth(prev => prev + offset);
        }
    };

    // Correcting month change logic
    const navigateMonth = (offset: number) => {
        let newMonth = selectedMonth + offset;
        let newYear = selectedYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const handleToggle = (dayNum: number, meal: 'lunch' | 'dinner') => {
        const dayData = calendarData.find(d => d.day === dayNum && !d.prevMonth && !d.nextMonth);
        if (!dayData) return;

        const isRegistered = meal === 'lunch' ? dayData.lunch === 'registered' : dayData.dinner === 'registered';
        const currentLocationId = meal === 'lunch' ? dayData.lunchLocationId : dayData.dinnerLocationId;

        setEditingRegistration({
            day: dayNum,
            date: dayData.date,
            meal,
            isRegistered,
            currentLocationId
        });
    };

    const handleConfirmRegistration = async (locationId: string) => {
        if (!editingRegistration) return;
        const { date, meal } = editingRegistration;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const dateStr = `${date.getFullYear()}-${month}-${dayStr}`;

        await toggleReg.mutateAsync({ date: dateStr, mealType: meal.toUpperCase() as 'LUNCH' | 'DINNER', locationId });
    };

    const handleUpdateLocation = async (locationId: string) => {
        if (!editingRegistration) return;
        const { date, meal } = editingRegistration;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const dateStr = `${date.getFullYear()}-${month}-${dayStr}`;

        await updateLocation.mutateAsync({ date: dateStr, mealType: meal.toUpperCase() as 'LUNCH' | 'DINNER', locationId });
    };

    const handleCancelRegistration = async () => {
        if (!editingRegistration) return;
        const { date, meal } = editingRegistration;
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(date.getDate()).padStart(2, '0');
        const dateStr = `${date.getFullYear()}-${month}-${dayStr}`;

        // Toggle functionality will delete if it already exists
        await toggleReg.mutateAsync({ date: dateStr, mealType: meal.toUpperCase() as 'LUNCH' | 'DINNER' });
    };

    if (!mounted) return <div className="p-12 text-center text-slate-400 font-medium">Đang khởi tạo lịch biểu...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-700">
            <div className="max-w-[1280px] mx-auto pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                            <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-vttext-primary leading-none">Lịch Ăn Của Tôi</h1>
                            <p className="text-sm text-vttext-muted mt-1.5 font-medium">Quản lý đăng ký suất ăn hàng ngày</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-vtborder shadow-sm">
                        <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-vttext-muted hover:text-brand">
                            <ChevronLeft />
                        </button>
                        <div className="px-4 text-center min-w-[140px]">
                            <div className="font-bold text-vttext-primary text-lg leading-tight">{MONTH_NAMES[selectedMonth]}</div>
                            <div className="text-[11px] font-black text-vttext-muted uppercase tracking-widest">{selectedYear}</div>
                        </div>
                        <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-vttext-muted hover:text-brand">
                            <ChevronRight />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsPresetOpen(true)}
                        className="h-12 px-6 bg-brand hover:bg-brand-hover text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-brand/20 transition-all active:scale-[0.98]"
                    >
                        Đăng ký nhanh <ChevronDown />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Bữa đã ăn', value: formatNumber(kpi.totalEaten), color: 'state-success', icon: <UtensilsIcon className="w-5 h-5" /> },
                        { label: 'Bữa bỏ lỡ', value: formatNumber(kpi.totalSkipped), color: 'state-danger', icon: <XIcon className="w-5 h-5" /> },
                        { label: 'Tổng tiền', value: formatCurrency(kpi.totalCost), color: 'state-info', icon: <CreditCardIcon className="w-5 h-5" />, large: true },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-4 border border-vtborder shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                item.color === 'state-success' ? "bg-state-success-soft text-state-success" :
                                    item.color === 'state-danger' ? "bg-brand-soft text-brand" :
                                        item.color === 'state-info' ? "bg-state-info-soft text-state-info" : "bg-brand-soft text-brand"
                            )}>
                                {item.icon}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "font-black tracking-tight",
                                    item.large ? "text-xl" : "text-2xl",
                                    item.color === 'state-success' ? "text-state-success" :
                                        item.color === 'state-danger' ? "text-brand" :
                                            item.color === 'state-info' ? "text-state-info" : "text-brand"
                                )}>{item.value}{item.large && <span className="text-xs ml-0.5">đ</span>}</span>
                                <span className="text-sm font-bold text-vttext-muted">{item.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={cn(
                    "bg-white rounded-[40px] p-2 border border-vtborder shadow-2xl shadow-slate-200/40 relative min-h-[400px]",
                    isLoading ? "opacity-50" : ""
                )}>
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 backdrop-blur-[2px] rounded-[40px]">
                            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    <div className="hidden md:grid grid-cols-7 gap-1 mb-2 px-4 pt-6 pb-4 border-b border-slate-50">
                        {['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CN'].map((day) => (
                            <div key={day} className="text-center text-[11px] font-black text-slate-400 tracking-[0.2em]">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:grid grid-cols-7 gap-2 p-4">
                        {calendarData.map((data, index) => (
                            <DayCell
                                key={`${selectedYear}-${selectedMonth}-${index}`}
                                data={data}
                                now={currentTime}
                                onToggle={handleToggle}
                                onShowMenu={handleShowMenu}
                            />
                        ))}
                    </div>

                    <div className="md:hidden flex flex-col pt-4">
                        {calendarData.map((data, index) => {
                            if (data.prevMonth || data.nextMonth) return null;
                            return (
                                <MobileDayItem
                                    key={`mobile-${selectedYear}-${selectedMonth}-${index}`}
                                    data={data}
                                    now={currentTime}
                                    onToggle={handleToggle}
                                    onShowMenu={handleShowMenu}
                                />
                            );
                        })}
                        {calendarData.filter(d => !d.prevMonth && !d.nextMonth).length === 0 && (
                            <div className="text-center py-10 text-slate-400">Không có dữ liệu</div>
                        )}
                    </div>
                </div>

                <QuickRegisterModal
                    isOpen={isPresetOpen}
                    onClose={() => setIsPresetOpen(false)}
                    year={selectedYear}
                    month={selectedMonth}
                    locations={locations}
                />

                {activeMenu && (
                    <MealMenuModal
                        isOpen={!!activeMenu}
                        onClose={() => setActiveMenu(null)}
                        lunchMenu={activeMenu.lunch}
                        dinnerMenu={activeMenu.dinner}
                        date={activeMenu.date}
                        lunchQrToken={activeMenu.lunchQrToken}
                        dinnerQrToken={activeMenu.dinnerQrToken}
                    />
                )}

                {editingRegistration && (
                    <SingleRegistrationModal
                        isOpen={!!editingRegistration}
                        onClose={() => setEditingRegistration(null)}
                        date={editingRegistration.date}
                        mealType={editingRegistration.meal.toUpperCase() as 'LUNCH' | 'DINNER'}
                        locations={locations}
                        isRegistered={editingRegistration.isRegistered}
                        currentLocationId={editingRegistration.currentLocationId}
                        cutoffHour={cutoffHour}
                        userRole={userRole}
                        onConfirm={handleConfirmRegistration}
                        onUpdate={handleUpdateLocation}
                        onCancel={handleCancelRegistration}
                    />
                )}
            </div>
        </div>
    );
}
