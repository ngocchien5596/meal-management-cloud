'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

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
type MealState = 'eaten' | 'skipped' | 'missed' | 'registered' | 'available' | null;

interface DayData {
    day: number;
    date: Date;
    disabled?: boolean;
    prevMonth?: boolean;
    nextMonth?: boolean;
    lunch: MealState;
    dinner: MealState;
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

    // Helper to find price for a specific date
    const getPriceForDate = (date: Date) => {
        if (!prices || prices.length === 0) return 0;

        // Find matching price config
        // Logic: startDate <= date AND (endDate >= date OR endDate is null)
        // Note: Prices are sorted by startDate desc usually, but let's just find first match
        const match = prices.find(p => {
            const start = new Date(p.startDate);
            start.setHours(0, 0, 0, 0);

            const end = p.endDate ? new Date(p.endDate) : null;
            if (end) end.setHours(23, 59, 59, 999);

            const target = new Date(date);
            target.setHours(12, 0, 0, 0); // compare midday to be safe

            return start <= target && (!end || end >= target);
        });

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
                // If skipped meals are charged, uncomment below:
                // totalCost += getPriceForDate(day.date);
            }
            else if (state === 'registered') totalRegistered++;
        });
    });
    return { totalEaten, totalSkipped, totalRegistered, totalCost };
};

const formatNumber = (num: number): string => num.toString().padStart(2, '0');
const formatCurrency = (amount: number): string => new Intl.NumberFormat('vi-VN').format(amount);

const MONTH_NAMES = ['Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06', 'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

// --- Day Cell Component ---

const DayCell = ({ data, now, onToggle }: { data: DayData; now: Date; onToggle: (day: number, meal: 'lunch' | 'dinner') => void; }) => {
    const { day, date, disabled, prevMonth, nextMonth, lunch, dinner } = data;
    const available = !prevMonth && !nextMonth && !disabled && isDateAvailable(date, now);
    const isTodayDate = !prevMonth && !nextMonth && isToday(date, now);

    const getButton = (type: MealState, meal: 'lunch' | 'dinner') => {
        if (prevMonth || nextMonth || disabled) return null;

        // 1. Explicit States (Priority)
        if (type === 'eaten') return <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 ring-2 ring-white group-hover:scale-110 transition-transform"><UtensilsIcon className="w-5 h-5 text-white" /></div>;
        if (type === 'skipped') return <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 ring-2 ring-white group-hover:scale-110 transition-transform"><XIcon className="w-5 h-5 text-white" /></div>;

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
                {isTodayDate && <span className="text-[10px] font-black bg-brand text-white px-2 py-0.5 rounded-full tracking-tighter">HÔM NAY</span>}
            </div>

            <div className="flex-1 flex flex-col justify-end gap-3 mt-1">
                <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Trưa</span>
                        {getButton(lunch, 'lunch')}
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-1 mt-4" />
                    <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Tối</span>
                        {getButton(dinner, 'dinner')}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MobileDayItem = ({ data, now, onToggle }: { data: DayData; now: Date; onToggle: (day: number, meal: 'lunch' | 'dinner') => void; }) => {
    const { day, date, disabled, prevMonth, nextMonth, lunch, dinner } = data;
    // Skip rendering if not current month (handled in parent map, but good safety)
    if (prevMonth || nextMonth) return null;

    const available = !disabled && isDateAvailable(date, now);
    const isTodayDate = isToday(date, now);

    // Get Day Name (Thứ 2, Thứ 3...)
    const daysOfWeek = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];
    const dayName = daysOfWeek[date.getDay()];

    const getButton = (type: MealState, meal: 'lunch' | 'dinner') => {
        if (disabled) return null;

        const isLunch = meal === 'lunch';
        const Icon = isLunch ? SunIcon : MoonIcon;
        const iconColor = isLunch ? "text-orange-500" : "text-indigo-500";
        const iconBg = isLunch ? "bg-orange-50" : "bg-indigo-50";

        // 1. Explicit States
        if (type === 'eaten') return <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 ring-2 ring-white/50"><UtensilsIcon className="w-6 h-6 text-white" /></div>;
        if (type === 'skipped') return <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 ring-2 ring-white/50"><XIcon className="w-6 h-6 text-white" /></div>;

        if (type === 'registered') {
            if (!available) {
                // Past/Locked Registered
                return <div className="w-11 h-11 bg-state-info/50 rounded-xl flex items-center justify-center ring-1 ring-slate-100"><CheckIcon className="w-6 h-6 text-white/50" /></div>;
            }
            // Active Registered
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
            {/* Left: Date Info */}
            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <span className={cn("text-2xl font-black tracking-tighter", isTodayDate ? "text-brand" : "text-slate-700")}>{day}</span>
                    {isTodayDate && <span className="text-[9px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">HÔM NAY</span>}
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{dayName}</span>
            </div>

            {/* Right: Actions */}
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

// --- Main Dashboard Page ---

import { useRegistrationCalendar, useToggleRegistration } from '@/features/registrations/hooks';
import { usePrices } from '@/features/system/hooks'; // Hook to fetch prices
import { QuickRegisterModal } from '@/features/registrations/components/QuickRegisterModal';
import { registrationApi } from '@/features/registrations/api';

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
    const [isPresetOpen, setIsPresetOpen] = useState(false);

    // API Data
    // API Data
    const { data: apiResponse, isLoading } = useRegistrationCalendar(selectedYear, selectedMonth);
    const { data: prices } = usePrices(); // Fetch price history
    const toggleReg = useToggleRegistration();

    // Sync with server time and update every minute
    useEffect(() => {
        setMounted(true);

        // Initial sync
        registrationApi.getServerTime().then(res => {
            if (res.success && res.data?.serverTime) {
                setCurrentTime(new Date(res.data.serverTime));
            }
        });

        const timer = setInterval(() => {
            setCurrentTime(prev => new Date(prev.getTime() + 60000));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Merge API data with calendar structure
    const calendarData = useMemo(() => {
        const baseData = generateCalendarData(selectedYear, selectedMonth, currentTime);
        if (!apiResponse || apiResponse.length === 0) return baseData;

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
                const isCompleted = event?.status === 'COMPLETED';

                // Find any registration for the current user
                // backend already filters by employeeId, so any registration in the array belongs to the user
                const registration = event?.registrations?.[0];
                const hasCheckin = event?.checkins?.length > 0;

                // 1. If no registration record exists, it's just available or missed
                if (!registration) {
                    return (available || isTodayDate) ? 'available' : 'missed';
                }

                // 2. If registration is CANCELLED (Kitchen override)
                if (registration.isCancelled) {
                    return 'skipped'; // Display as Red X (Skipped)
                }

                // 3. Active registration logic
                if (hasCheckin) return 'eaten';
                if (isCompleted) return 'skipped';

                // If it's today or in the future, it's still 'registered'
                const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                const mealDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                if (mealDate >= today) return 'registered';

                return 'skipped';
            };

            return {
                ...day,
                lunch: getMealState(lunchEvent, day.date),
                dinner: getMealState(dinnerEvent, day.date)
            };
        });
    }, [selectedYear, selectedMonth, apiResponse, currentTime]);

    const kpi = useMemo(() => calculateKPI(calendarData, prices), [calendarData, prices]);

    const handleMonthChange = (offset: number) => {
        if (selectedMonth + offset < 0) { setSelectedMonth(11); setSelectedYear(prev => prev - 1); }
        else if (selectedMonth + offset > 11) { setSelectedMonth(0); setSelectedYear(prev => prev + 1); }
        else { setSelectedMonth(prev => prev + offset); }
    };

    const handleToggle = async (day: number, meal: 'lunch' | 'dinner') => {
        // Create date string manually to avoid toISOString() timezone shift (UTC issue)
        const year = selectedYear;
        const month = String(selectedMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        const mealType = meal.toUpperCase() as 'LUNCH' | 'DINNER';
        await toggleReg.mutateAsync({ date: dateStr, mealType });
    };

    if (!mounted) return <div className="p-12 text-center text-slate-400 font-medium">Đang khởi tạo lịch biểu...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-700">
            <div className="max-w-[1280px] mx-auto pt-6">
                {/* 1. Header & Controls */}
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
                        <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-vttext-muted hover:text-brand">
                            <ChevronLeft />
                        </button>
                        <div className="px-4 text-center min-w-[140px]">
                            <div className="font-bold text-vttext-primary text-lg leading-tight">{MONTH_NAMES[selectedMonth]}</div>
                            <div className="text-[11px] font-black text-vttext-muted uppercase tracking-widest">{selectedYear}</div>
                        </div>
                        <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-vttext-muted hover:text-brand">
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

                {/* 2. KPI Section */}
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

                {/* 3. Calendar Body */}
                <div className={cn(
                    "bg-white rounded-[40px] p-2 border border-vtborder shadow-2xl shadow-slate-200/40 relative min-h-[400px]",
                    isLoading ? "opacity-50" : ""
                )}>
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 backdrop-blur-[2px] rounded-[40px]">
                            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* DESKTOP: Grid View */}
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
                            />
                        ))}
                    </div>

                    {/* MOBILE: List View */}
                    <div className="md:hidden flex flex-col pt-4">
                        {calendarData.map((data, index) => {
                            // Correctly Skip padding cells for mobile list
                            if (data.prevMonth || data.nextMonth) return null;

                            return (
                                <MobileDayItem
                                    key={`mobile-${selectedYear}-${selectedMonth}-${index}`}
                                    data={data}
                                    now={currentTime}
                                    onToggle={handleToggle}
                                />
                            );
                        })}
                        {/* Empty state if no days (unlikely) */}
                        {calendarData.filter(d => !d.prevMonth && !d.nextMonth).length === 0 && (
                            <div className="text-center py-10 text-slate-400">Không có dữ liệu</div>
                        )}
                    </div>
                </div>


                {/* Modal */}
                <QuickRegisterModal
                    isOpen={isPresetOpen}
                    onClose={() => setIsPresetOpen(false)}
                    year={selectedYear}
                    month={selectedMonth}
                />
            </div>
        </div>
    );
}
