'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import { useMealDetail } from '@/features/meals/hooks';
import { useScanEmployee, useScanGuest } from '@/features/checkin/hooks';
import { playCheckinSuccess, playCheckinError } from '@/lib/utils/audio';
import { Button } from '@/components/ui';
import { MealDetail } from '@/features/meals/api';

// --- Premium Icons ---
const CameraIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const HistoryIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SuccessIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ErrorIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

interface ScanResult {
    id: string;
    type: 'SUCCESS' | 'ERROR';
    message: string;
    employee?: {
        fullName: string;
        employeeCode: string;
    };
    guest?: {
        fullName: string;
    };
    timestamp: Date;
}

export default function ScanStationPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: meal, isLoading } = useMealDetail(id) as { data: MealDetail | undefined, isLoading: boolean };

    const scanEmployee = useScanEmployee();
    const scanGuest = useScanGuest();

    const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [flash, setFlash] = useState<'success' | 'error' | null>(null);
    const [time, setTime] = useState(new Date());

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerId = 'scan-station-viewport';

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Scanner Lifecycle
    useEffect(() => {
        const startScanner = async () => {
            try {
                const html5QrCode = new Html5Qrcode(containerId);
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: (viewWidth, viewHeight) => {
                            const size = Math.min(viewWidth, viewHeight) * 0.7;
                            return { width: size, height: size };
                        }
                    },
                    handleScanSuccess,
                    () => { } // Frame error silencer
                );
                setIsScanning(true);
            } catch (err) {
                console.error('Failed to start scanner:', err);
            }
        };

        if (meal?.status === 'IN_PROGRESS') {
            startScanner();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(err => console.error("Cleanup error", err));
            }
        };
    }, [meal?.status]);

    const handleScanSuccess = async (decodedText: string) => {
        // Prevent overlapping scans
        if (flash) return;

        try {
            const data = JSON.parse(decodedText);
            let result: any;
            let scanObj: ScanResult;

            if (data.type === 'GUEST') {
                result = await scanGuest.mutateAsync({
                    mealEventId: id,
                    guestId: data.id
                });

                scanObj = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'SUCCESS',
                    message: `Khách: ${result.data.guest.fullName} check-in thành công`,
                    guest: result.data.guest,
                    timestamp: new Date()
                };
            } else {
                result = await scanEmployee.mutateAsync({
                    mealEventId: id,
                    employeeId: data.id
                });

                scanObj = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'SUCCESS',
                    message: `NV: ${result.data.employee.fullName} check-in thành công`,
                    employee: result.data.employee,
                    timestamp: new Date()
                };
            }

            playCheckinSuccess();
            setFlash('success');
            setRecentScans(prev => [scanObj, ...prev].slice(0, 20));
            setTimeout(() => setFlash(null), 800);

        } catch (err: any) {
            console.error('Scan error:', err);
            playCheckinError();
            setFlash('error');

            const errorMsg = err?.data?.error || err?.message || 'Lỗi không xác định';
            const employee = err?.data?.employee;

            const scanObj: ScanResult = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'ERROR',
                message: errorMsg,
                employee: employee,
                timestamp: new Date()
            };

            setRecentScans(prev => [scanObj, ...prev].slice(0, 20));
            setTimeout(() => setFlash(null), 800);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                    <ErrorIcon className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">KHÔNG TÌM THẤY BỮA ĂN</h1>
                <p className="text-slate-400 mb-8 max-w-md">Vui lòng kiểm tra lại đường dẫn hoặc bữa ăn đã bị xóa khỏi hệ thống.</p>
                <Button onClick={() => window.close()} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">Đóng Tab</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans overflow-hidden">
            {/* Header Station */}
            <header className="h-16 border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand flex items-center justify-center rounded-lg shadow-lg shadow-brand/20">
                        <CameraIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight uppercase">TRẠM QUÉT QR (SCAN STATION)</h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span className="text-brand">@{meal.mealType === 'LUNCH' ? 'BỮA TRƯA' : 'BỮA TỐI'}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span>{format(new Date(meal.mealDate), 'dd/MM/yyyy')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Live Clock */}
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Giờ hệ thống</p>
                        <p className="text-xl font-black text-white tabular-nums font-mono tracking-tighter">{format(time, 'HH:mm:ss')}</p>
                    </div>

                    <div className="w-px h-8 bg-slate-800" />

                    <button
                        onClick={() => window.close()}
                        className="h-10 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black transition-all flex items-center gap-2 border border-slate-700 active:scale-95"
                    >
                        THOÁT CHẾ ĐỘ QUÉT
                    </button>
                </div>
            </header>

            {/* Main Station Layout */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Visual Feedback Overlays */}
                {flash === 'success' && (
                    <div className="absolute inset-0 bg-emerald-500/20 z-[30] pointer-events-none animate-in fade-in fade-out duration-700 flex items-center justify-center">
                        <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_100px_rgba(16,185,129,0.5)]">
                            <SuccessIcon className="w-16 h-16 text-white" />
                        </div>
                    </div>
                )}
                {flash === 'error' && (
                    <div className="absolute inset-0 bg-rose-500/20 z-[30] pointer-events-none animate-in fade-in fade-out duration-700 flex items-center justify-center">
                        <div className="w-32 h-32 bg-rose-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_100px_rgba(244,63,94,0.5)]">
                            <ErrorIcon className="w-16 h-16 text-white" />
                        </div>
                    </div>
                )}

                {/* Left Panel: Camera Viewport */}
                <div className="flex-[1.5] relative bg-black flex items-center justify-center border-r border-slate-800/50">
                    <div
                        id={containerId}
                        className="w-full h-full"
                    />

                    {/* Viewport UI Overlays */}
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-between p-8">
                        <div className="w-full flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LIVE CAMERA ACTIVE</span>
                                </div>
                                <div className="px-3 py-1 bg-brand/10 border border-brand/30 rounded">
                                    <span className="text-[10px] font-black text-brand uppercase tracking-widest">BATCH MODE: ON</span>
                                </div>
                            </div>

                            <div className="h-20 w-20 border-t-2 border-r-2 border-slate-500 opacity-30" />
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="w-1 h-12 bg-gradient-to-v from-brand to-transparent animate-bounce opacity-50" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] bg-black/40 px-4 py-2 backdrop-blur-sm rounded-full">Đặt mã QR vào khung ngắm</p>
                        </div>

                        <div className="w-full flex justify-between items-end">
                            <div className="h-20 w-20 border-b-2 border-l-2 border-slate-500 opacity-30" />
                            <div className="text-[9px] font-bold text-slate-600 font-mono tracking-tighter opacity-50">
                                AUDIT_STREAM_ID: {id.slice(0, 8)} | RESOLUTION: FHD_OPTIMIZED
                            </div>
                        </div>
                    </div>

                    {meal.status !== 'IN_PROGRESS' && (
                        <div className="absolute inset-0 bg-slate-900/90 z-40 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                                <ErrorIcon className="w-8 h-8 text-rose-500" />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2 uppercase">BỮA ĂN CHƯA BẮT ĐẦU</h2>
                            <p className="text-slate-400 text-sm max-w-xs">Bạn cần "Bắt đầu phục vụ" từ trang chi tiết bữa ăn trước khi có thể thực hiện quét mã.</p>
                        </div>
                    )}
                </div>

                {/* Right Panel: Live Feed List */}
                <div className="flex-1 bg-[#0b1121] flex flex-col border-l border-slate-800 relative z-20 shadow-2xl">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <HistoryIcon className="w-5 h-5 text-brand" />
                            <h2 className="text-sm font-black text-white uppercase tracking-wider">Lịch sử quét trực tiếp</h2>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-black text-slate-400 uppercase">Top 20</span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-3">
                        {recentScans.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                                    <HistoryIcon className="w-6 h-6 text-slate-500" />
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đang chờ sự kiện quét...</p>
                            </div>
                        ) : (
                            recentScans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className={cn(
                                        "group p-3 rounded-xl border-l-2 transition-all animate-in slide-in-from-right duration-500",
                                        scan.type === 'SUCCESS'
                                            ? "bg-emerald-500/5 border-emerald-500/50 hover:bg-emerald-500/10"
                                            : "bg-rose-500/5 border-rose-500/50 hover:bg-rose-500/10"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            scan.type === 'SUCCESS' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                        )}>
                                            {scan.type === 'SUCCESS' ? <SuccessIcon className="w-5 h-5" /> : <ErrorIcon className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    scan.type === 'SUCCESS' ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    {scan.type === 'SUCCESS' ? 'CẤP QUYỀN' : 'TỪ CHỐI'}
                                                </p>
                                                <span className="text-[9px] font-bold text-slate-500 tabular-nums">
                                                    {format(scan.timestamp, 'HH:mm:ss')}
                                                </span>
                                            </div>

                                            <h3 className="text-sm font-black text-white truncate group-hover:text-brand transition-colors">
                                                {scan.employee?.fullName || scan.guest?.fullName || '---'}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[11px] font-medium text-slate-400 line-clamp-1 leading-tight">
                                                    {scan.message}
                                                </p>
                                                {scan.employee?.employeeCode && (
                                                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] font-black text-slate-500">
                                                        {scan.employee.employeeCode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Panel Footer Statistics */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Thành công</p>
                                <p className="text-lg font-black text-emerald-500 leading-none">
                                    {recentScans.filter(s => s.type === 'SUCCESS').length}
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Thất bại</p>
                                <p className="text-lg font-black text-rose-500 leading-none">
                                    {recentScans.filter(s => s.type === 'ERROR').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
