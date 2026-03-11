'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useMealDetail, useStartMeal, useEndMeal, useMealSocket } from '@/features/meals/hooks';
import { useManualCheckin, useScanEmployee, useScanGuest } from '@/features/checkin/hooks';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Modal, Button, Input, ConfirmDialog } from '@/components/ui';
import * as QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { playCheckinSuccess, playCheckinError } from '@/lib/utils/audio';
import { useAuthStore } from '@/features/auth';
import { MealDetail, MealEvent } from '@/features/meals/api';

// --- Premium Icons ---

const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

const MealIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <path d="M5 17v2h14v-2" />
        <path d="M12 5c-4.5 0-8 3-8 7h16c0-4-3.5-7-8-7z" />
        <path d="M12 2v3" />
    </svg>
);

const ChevronDown = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const IngredientsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const MenuIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3" />
    </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const GuestIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const PlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 3 14 9-14 9V3z" />
    </svg>
);

const SquareIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="5" y="5" rx="1" />
    </svg>
);

const MonitorIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
);

const StarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

export default function MealDetailLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    const pathname = usePathname();
    const router = useRouter();
    const id = params.id;
    const baseUrl = `/meals/${id}`;

    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN_KITCHEN' || user?.role === 'ADMIN_SYSTEM';
    const canAccessMeals = isAdmin || user?.role === 'CLERK';

    React.useEffect(() => {
        if (user && !canAccessMeals) {
            router.replace('/dashboard');
        }
    }, [user, canAccessMeals, router]);

    const { data: meal, isLoading } = useMealDetail(id) as { data: MealDetail | undefined, isLoading: boolean };

    // Activate Realtime Socket Checkins
    useMealSocket(id);

    const startMutation = useStartMeal();
    const endMutation = useEndMeal();
    const manualCheckin = useManualCheckin();
    const scanEmployee = useScanEmployee();
    const scanGuest = useScanGuest();

    // Checkin State
    const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
    const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);

    const handleStartMeal = async () => {
        try {
            await startMutation.mutateAsync(id);
            toast.success('Bữa ăn đã bắt đầu phục vụ!');
            setIsStartConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Không thể bắt đầu bữa ăn.');
        }
    };

    const handleEndMeal = async () => {
        try {
            await endMutation.mutateAsync(id);
            toast.success('Bữa ăn đã kết thúc!');
            setIsEndConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Không thể kết thúc bữa ăn.');
        }
    };



    const isActive = (path: string) => {
        if (path === baseUrl) {
            return pathname === baseUrl || pathname === `${baseUrl}/ingredients`;
        }
        return pathname.startsWith(path);
    };

    const CheckedInIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    );

    const UncheckinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="17" x2="22" y1="8" y2="13" />
            <line x1="22" x2="17" y1="8" y2="13" />
        </svg>
    );

    const tabs = [
        { key: 'ingredients', label: 'Nguyên liệu', href: `${baseUrl}/ingredients`, icon: IngredientsIcon, badge: 0 },
        { key: 'menu', label: 'Thực đơn', href: `${baseUrl}/menu`, icon: MenuIcon, badge: 0 },
        { key: 'staff', label: 'DS nhân viên', href: `${baseUrl}/staff`, icon: UsersIcon, badge: (meal as MealDetail)?.registrations?.filter((r: any) => !r.isCancelled).length || 0 },
        { key: 'guests', label: 'Khách', href: `${baseUrl}/guests`, icon: GuestIcon, badge: (meal as MealDetail)?.guests?.length || 0 },
        {
            key: 'un-checkin',
            label: 'Chưa checkin',
            href: `${baseUrl}/un-checkin`,
            icon: UncheckinIcon,
            badge: Math.max(0, ((meal as MealDetail)?.registrations?.filter((r: any) => !r.isCancelled).length || 0) + ((meal as MealDetail)?.guests?.length || 0) - ((meal as MealDetail)?.checkins?.length || 0))
        },
        { key: 'checkins', label: 'Đã checkin', href: `${baseUrl}/checkins`, icon: CheckedInIcon, badge: (meal as MealDetail)?.checkins?.length || 0 },
        { key: 'reviews', label: 'Đánh giá', href: `${baseUrl}/reviews`, icon: StarIcon, badge: (meal as any)?.['_count']?.reviews || 0 },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="w-full min-h-screen bg-[#f8fafc] px-7 py-6">
                <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 font-medium mb-4">Không tìm thấy bữa ăn.</p>
                    <Link href="/meals" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all">Quay lại danh sách</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-7 py-6 animate-in fade-in duration-500">

            {/* Optimized Header Area */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <Link
                        href="/meals"
                        className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-vtborder text-vttext-muted hover:text-brand hover:border-brand-soft2 transition-all shadow-sm shrink-0"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">
                                Chi tiết bữa ăn
                            </h1>
                            <span className="text-gray-300 hidden sm:inline">•</span>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-[15px] font-bold text-blue-600 whitespace-nowrap">
                                    {format(new Date(meal.mealDate), 'dd/MM/yyyy')}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[15px] font-bold text-orange-600 whitespace-nowrap">
                                    {meal.mealType === 'LUNCH' ? 'Bữa Trưa' : 'Bữa Tối'}
                                </span>
                            </div>
                            <span className={cn(
                                "text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border whitespace-nowrap",
                                meal.status === 'IN_PROGRESS' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    meal.status === 'COMPLETED' ? "bg-gray-100 text-gray-500 border-gray-200" :
                                        "bg-orange-50 text-orange-600 border-orange-100"
                            )}>
                                {meal.status === 'IN_PROGRESS' ? "Đang diễn ra" : meal.status === 'COMPLETED' ? "Đã kết thúc" : "Nháp"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Single-Line Action Row */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
                    {/* Primary Actions */}
                    <div className="flex items-center gap-2">
                        {meal.status === 'IN_PROGRESS' && isAdmin && (
                            <button
                                onClick={() => window.open(`/scan-station/${id}`, '_blank')}
                                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-md shadow-blue-200 transition-all border border-blue-500"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="7" height="7" x="7" y="7" rx="1" /></svg>
                                <span>ĐIỂM DANH</span>
                            </button>
                        )}

                        <button
                            onClick={() => window.open(`/display/${id}`, '_blank')}
                            className="h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                        >
                            <MonitorIcon className="w-3.5 h-3.5 text-slate-500" /> <span className="hidden sm:inline uppercase">Màn hình TV</span>
                        </button>
                    </div>

                    {/* Primary Control */}
                    {isAdmin && (
                        <div className="flex gap-2">
                            {meal.status === 'DRAFT' && (
                                <button
                                    onClick={() => setIsStartConfirmOpen(true)}
                                    disabled={startMutation.isPending}
                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all uppercase"
                                >
                                    <PlayIcon className="w-3.5 h-3.5 fill-current" /> Bắt đầu
                                </button>
                            )}

                            {meal.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={() => setIsEndConfirmOpen(true)}
                                    disabled={endMutation.isPending}
                                    className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all uppercase"
                                >
                                    <SquareIcon className="w-3.5 h-3.5 fill-current" /> Kết thúc
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* TABBED CONTENT */}
            <main className="bg-white rounded-xl border border-[#eef2f7] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <nav className="px-6 pt-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const active = isActive(tab.href);
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={cn(
                                        "group relative pb-4 flex items-center gap-2 transition-all",
                                        active ? "text-brand" : "text-vttext-muted hover:text-vttext-primary"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 transition-transform", active ? "stroke-[2.5]" : "")} />
                                    <span className="text-sm font-semibold tracking-wide mt-0.5">
                                        {tab.label}
                                    </span>
                                    {tab.badge > 0 && (
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none",
                                            active ? "bg-brand-soft text-brand" : "bg-surface-2 text-vttext-muted"
                                        )}>
                                            {tab.badge}
                                        </span>
                                    )}
                                    {active && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-6 flex-1 flex flex-col">
                    {children}
                </div>
            </main>

            {/* Modals */}


            <ConfirmDialog
                isOpen={isStartConfirmOpen}
                onClose={() => setIsStartConfirmOpen(false)}
                onConfirm={handleStartMeal}
                isLoading={startMutation.isPending}
                title="Bắt đầu phục vụ"
                description="Bạn có chắc chắn muốn bắt đầu phục vụ bữa ăn này? Thao tác này sẽ mở check-in và khóa chỉnh sửa Nguyên liệu/thực đơn."
                type="info"
                confirmText="Bắt đầu ngay"
            />

            <ConfirmDialog
                isOpen={isEndConfirmOpen}
                onClose={() => setIsEndConfirmOpen(false)}
                onConfirm={handleEndMeal}
                isLoading={endMutation.isPending}
                title="Kết thúc buổi ăn"
                description="Bạn có chắc chắn muốn kết thúc bữa ăn này? Thao tác này sẽ khóa toàn bộ dữ liệu và ngừng check-in."
                type="danger"
                confirmText="Kết thúc"
            />
        </div>
    );
}

