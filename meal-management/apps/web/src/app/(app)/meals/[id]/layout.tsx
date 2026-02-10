'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useMealDetail, useStartMeal, useEndMeal, useUpdateMeal } from '@/features/meals/hooks';
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

const PencilIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
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

    React.useEffect(() => {
        if (user && !isAdmin) {
            router.replace('/dashboard');
        }
    }, [user, isAdmin, router]);

    const { data: meal, isLoading } = useMealDetail(id) as { data: MealDetail | undefined, isLoading: boolean };
    const startMutation = useStartMeal();
    const endMutation = useEndMeal();
    const updateMeal = useUpdateMeal();
    const manualCheckin = useManualCheckin();
    const scanEmployee = useScanEmployee();
    const scanGuest = useScanGuest();

    // Checkin State
    const [manualCode, setManualCode] = useState('');
    const [manualSecret, setManualSecret] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isMealQrOpen, setIsMealQrOpen] = useState(false);
    const [mealQrUrl, setMealQrUrl] = useState('');

    const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
    const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState('');
    const [editType, setEditType] = useState<'LUNCH' | 'DINNER'>('LUNCH');

    React.useEffect(() => {
        if (meal) {
            setEditDate(format(new Date(meal.mealDate), 'yyyy-MM-dd'));
            setEditType(meal.mealType);
        }
    }, [meal]);

    const handleSaveMeal = async () => {
        try {
            await updateMeal.mutateAsync({
                id,
                data: { mealDate: editDate, mealType: editType }
            });
            toast.success('Cập nhật thông tin bữa ăn thành công!');
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi cập nhật.');
        }
    };

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

    const handleManualCheckin = async () => {
        if (!manualCode || !manualSecret) {
            toast.error('Vui lòng nhập đầy đủ Mã NV và Mã bí mật');
            return;
        }
        try {
            await manualCheckin.mutateAsync({
                mealEventId: id,
                employeeCode: manualCode,
                secretCode: manualSecret
            });
            playCheckinSuccess();
            setManualCode('');
            setManualSecret('');
        } catch (error) {
            playCheckinError();
        }
    };

    const handleOpenMealQr = async () => {
        if (!meal?.qrToken) {
            toast.error('Bữa ăn chưa có mã QR');
            return;
        }
        setIsMealQrOpen(true);
        try {
            const url = await QRCode.toDataURL(meal.qrToken, {
                width: 400,
                color: { dark: '#1e73d8', light: '#ffffff' }
            });
            setMealQrUrl(url);
        } catch (err) {
            console.error(err);
            toast.error('Không thể tạo mã QR bữa ăn');
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        try {
            // QR format: {"id": "...", "type": "EMPLOYEE" | "GUEST", ...}
            const data = JSON.parse(decodedText);

            if (data.type === 'GUEST') {
                try {
                    await scanGuest.mutateAsync({
                        mealEventId: id,
                        guestId: data.id
                    });
                    playCheckinSuccess();
                    setIsScannerOpen(false);
                } catch (error) {
                    playCheckinError();
                }
            } else {
                // Default to employee if type is missing or is EMPLOYEE
                try {
                    await scanEmployee.mutateAsync({
                        mealEventId: id,
                        employeeId: data.id
                    });
                    playCheckinSuccess();
                    setIsScannerOpen(false);
                } catch (error) {
                    playCheckinError();
                }
            }
        } catch (err) {
            console.error('Scan parse error:', err);
            playCheckinError();
            toast.error('Mã QR không hợp lệ');
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

    const tabs = [
        { key: 'ingredients', label: 'Nguyên vật liệu', href: `${baseUrl}/ingredients`, icon: IngredientsIcon, badge: 0 },
        { key: 'menu', label: 'Thực đơn', href: `${baseUrl}/menu`, icon: MenuIcon, badge: 0 },
        { key: 'staff', label: 'DS nhân viên', href: `${baseUrl}/staff`, icon: UsersIcon, badge: (meal as MealDetail)?.registrations?.filter((r: any) => !r.isCancelled).length || 0 },
        { key: 'guests', label: 'Khách', href: `${baseUrl}/guests`, icon: GuestIcon, badge: (meal as MealDetail)?.guests?.length || 0 },
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

            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link
                        href="/meals"
                        className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-vtborder text-vttext-muted hover:text-brand hover:border-brand-soft2 transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                Chi tiết bữa ăn
                            </h1>
                            <span className={cn(
                                "text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                                meal.status === 'IN_PROGRESS' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    meal.status === 'COMPLETED' ? "bg-gray-100 text-gray-500 border-gray-200" :
                                        "bg-orange-50 text-orange-600 border-orange-100"
                            )}>
                                {meal.status === 'IN_PROGRESS' ? "Đang diễn ra" : meal.status === 'COMPLETED' ? "Đã kết thúc" : "Nháp"}
                            </span>
                        </div>

                        {/* <p className="text-sm text-gray-500 mt-0.5">
                            {format(new Date(meal.mealDate), "EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })} • {meal.mealType === 'LUNCH' ? 'Bữa Trưa' : 'Bữa Tối'}
                        </p> */}
                    </div>
                </div>

                {/* Right Actions */}
                {isAdmin && (
                    <div className="flex gap-3 w-full md:w-auto justify-end">
                        <button
                            onClick={() => window.open(`/display/${id}`, '_blank')}
                            className="h-9 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                        >
                            <MonitorIcon className="w-3.5 h-3.5" /> Màn hình TV
                        </button>

                        {meal.status === 'DRAFT' && (
                            <button
                                onClick={() => setIsStartConfirmOpen(true)}
                                disabled={startMutation.isPending}
                                className="h-9 px-4 bg-brand hover:bg-brand-hover text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                            >
                                {startMutation.isPending ? "Đang xử lý..." : <><PlayIcon className="w-3.5 h-3.5 fill-current" /> Bắt đầu phục vụ</>}
                            </button>
                        )}

                        {meal.status === 'IN_PROGRESS' && (
                            <button
                                onClick={() => setIsEndConfirmOpen(true)}
                                disabled={endMutation.isPending}
                                className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                            >
                                {endMutation.isPending ? "Đang xử lý..." : <><SquareIcon className="w-3.5 h-3.5 fill-current" /> Kết thúc buổi ăn</>}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* INFO & ACTION BAR */}
            <div className="bg-white rounded-xl p-4 border border-[#eef2f7] shadow-sm mb-6 flex flex-col xl:flex-row items-center justify-between gap-4">

                {/* Left: Meal Metadata (or Edit Form) */}
                <div className="flex items-center gap-8 w-full xl:w-auto">
                    {isEditing ? (
                        <div className="flex items-center gap-4 bg-brand-soft p-2 rounded-lg border border-brand-soft2 animate-in fade-in slide-in-from-left-2 w-full">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-brand uppercase tracking-wider">Ngày</label>
                                <input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="h-8 px-2 rounded border border-brand-soft2 text-sm bg-white focus:outline-brand"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-brand uppercase tracking-wider">Loại</label>
                                <select
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value as 'LUNCH' | 'DINNER')}
                                    className="h-8 px-2 rounded border border-brand-soft2 text-sm bg-white focus:outline-brand"
                                >
                                    <option value="LUNCH">Bữa Trưa</option>
                                    <option value="DINNER">Bữa Tối</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                                <button
                                    onClick={handleSaveMeal}
                                    disabled={updateMeal.isPending}
                                    className="h-8 px-3 bg-brand text-white rounded text-xs font-bold hover:bg-brand-hover disabled:opacity-50"
                                >
                                    Lưu
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="h-8 px-3 bg-white border border-brand-soft2 text-brand rounded text-xs font-bold hover:bg-brand-soft"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-6 relative pr-8">
                            {/* Edit Button (Visible only in DRAFT and for Admins) */}
                            {meal.status === 'DRAFT' && isAdmin && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                    title="Chỉnh sửa thông tin"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-soft text-brand rounded-lg flex items-center justify-center">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-vttext-muted uppercase tracking-wider mb-0.5">Thời gian</p>
                                    <p className="text-base font-bold text-vttext-primary">{format(new Date(meal.mealDate), 'dd/MM/yyyy')}</p>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-gray-100 hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                    <MealIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Loại bữa</p>
                                    <p className="text-base font-bold text-gray-900">{meal.mealType === 'LUNCH' ? 'Bữa Trưa' : 'Bữa Tối'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Check-in Actions (Only if IN_PROGRESS and for Admins) */}
                {meal.status === 'IN_PROGRESS' && isAdmin && (
                    <div className="w-full xl:w-auto flex flex-col md:flex-row items-center gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-gray-100">
                        {/* Manual Checkin Compact */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <input
                                className="h-9 border border-vtborder rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-focus w-full md:w-32 placeholder:text-vttext-muted"
                                placeholder="Mã NV"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                            />
                            <input
                                type="password"
                                className="h-9 border border-vtborder rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-focus w-full md:w-32 placeholder:text-vttext-muted"
                                placeholder="Mã bí mật"
                                value={manualSecret}
                                onChange={(e) => setManualSecret(e.target.value)}
                            />
                            <button
                                onClick={handleManualCheckin}
                                disabled={manualCheckin.isPending}
                                className="h-9 px-3 bg-brand text-white hover:bg-brand-hover font-medium rounded-lg text-sm transition-all shadow-sm disabled:opacity-50"
                            >
                                {manualCheckin.isPending ? "..." : "Check"}
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-200 hidden md:block" />

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setIsScannerOpen(true)}
                                className="flex-1 md:flex-none h-9 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="7" height="7" x="7" y="7" rx="1" /></svg>
                                <span>Quét NV</span>
                            </button>
                            <button
                                onClick={handleOpenMealQr}
                                className="flex-1 md:flex-none h-9 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M2 2h20v20H2z" opacity="0.1" /><path d="M16 16h.01" /><path d="M12 12h.01" /><path d="M8 8h.01" /></svg>
                                <span>QR Code</span>
                            </button>
                        </div>
                    </div>
                )}
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
            <Modal
                isOpen={isMealQrOpen}
                onClose={() => setIsMealQrOpen(false)}
                title="Mã QR Bữa ăn"
            >
                <div className="flex flex-col items-center py-6">
                    <div className="w-[300px] h-[300px] bg-white border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center p-6 mb-6 shadow-sm">
                        {mealQrUrl ? (
                            <img src={mealQrUrl} alt="Meal QR" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-8 h-8 border-4 border-brand/10 border-t-brand rounded-full animate-spin"></div>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                            {meal.mealType === 'LUNCH' ? 'Bữa Trưa' : 'Bữa Tối'}
                        </p>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            {format(new Date(meal.mealDate), 'dd/MM/yyyy')}
                        </p>
                    </div>
                </div>
            </Modal>

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScanSuccess}
            />

            <ConfirmDialog
                isOpen={isStartConfirmOpen}
                onClose={() => setIsStartConfirmOpen(false)}
                onConfirm={handleStartMeal}
                isLoading={startMutation.isPending}
                title="Bắt đầu phục vụ"
                description="Bạn có chắc chắn muốn bắt đầu phục vụ bữa ăn này? Hành động này sẽ mở check-in và khóa chỉnh sửa nguyên vật liệu/thực đơn."
                type="info"
                confirmText="Bắt đầu ngay"
            />

            <ConfirmDialog
                isOpen={isEndConfirmOpen}
                onClose={() => setIsEndConfirmOpen(false)}
                onConfirm={handleEndMeal}
                isLoading={endMutation.isPending}
                title="Kết thúc buổi ăn"
                description="Bạn có chắc chắn muốn kết thúc bữa ăn này? Hành động này sẽ khóa toàn bộ dữ liệu và ngừng check-in."
                type="danger"
                confirmText="Kết thúc"
            />
        </div>
    );
}

// Compact Scanner Component
function ScannerModal({ isOpen, onClose, onScan }: { isOpen: boolean; onClose: () => void; onScan: (text: string) => void }) {
    const [scanner, setScanner] = React.useState<Html5Qrcode | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            const newScanner = new Html5Qrcode('qr-reader');
            setScanner(newScanner);
            newScanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScan,
                () => { } // Error silencer
            );
        } else if (scanner) {
            scanner.stop().then(() => scanner.clear());
            setScanner(null);
        }
        return () => {
            if (scanner && isOpen) {
                scanner.stop().then(() => scanner.clear());
            }
        };
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Quét mã QR Nhân viên">
            <div className="py-4">
                <div id="qr-reader" className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200"></div>
                <p className="text-center text-xs font-medium text-slate-400 mt-4 uppercase tracking-widest">Đang tìm mã QR...</p>
            </div>
        </Modal>
    );
}
