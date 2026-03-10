'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { useMealDetail } from '@/features/meals/hooks';
import { useScanEmployee, useScanGuest } from '@/features/checkin/hooks';
import { playCheckinSuccess, playCheckinError } from '@/lib/utils/audio';
import { Button } from '@/components/ui';
import { MealDetail } from '@/features/meals/api';

// --- Viettel Professional Icons ---
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

const VIETTEL_RED = "#EE0033";

export default function ScanStationPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: meal, isLoading } = useMealDetail(id) as { data: MealDetail | undefined, isLoading: boolean };

    const scanEmployee = useScanEmployee();
    const scanGuest = useScanGuest();

    const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
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
                        fps: 15,
                        qrbox: (viewWidth, viewHeight) => {
                            const size = Math.min(viewWidth, viewHeight) * 0.7;
                            return { width: size, height: size };
                        }
                    },
                    handleScanSuccess,
                    () => { } // Frame error silencer
                );
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#EE0033]/20 border-t-[#EE0033] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                    <ErrorIcon className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase">KHÔNG TÌM THẤY BỮA ĂN</h1>
                <p className="text-slate-500 mb-8 max-w-md">Vui lòng kiểm tra lại đường dẫn hoặc bữa ăn đã bị xóa khỏi hệ thống.</p>
                <Button onClick={() => window.close()} className="bg-[#EE0033] hover:bg-[#CC002D] text-white px-8">ĐÓNG TAB</Button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
            {/* Viettel Header Station */}
            <header className="h-20 bg-[#EE0033] flex items-center justify-between px-8 shadow-xl relative z-20">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl shadow-inner">
                        <CameraIcon className="w-7 h-7 text-[#EE0033]" />
                    </div>
                    <div className="text-white">
                        <h1 className="text-2xl font-black tracking-tighter leading-tight uppercase">VIETTEL SCAN STATION</h1>
                        <div className="flex items-center gap-2 text-[11px] font-bold opacity-80 mt-0.5">
                            <span>{meal.mealType === 'LUNCH' ? 'BỮA TRƯA' : 'BỮA TỐI'}</span>
                            <span className="w-1 h-1 bg-white rounded-full" />
                            <span>{format(new Date(meal.mealDate), 'dd/MM/yyyy')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Live Clock with High Visibility */}
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-0.5">Giờ hệ thống</p>
                        <p className="text-3xl font-black text-white tabular-nums font-mono leading-none tracking-tight">
                            {format(time, 'HH:mm:ss')}
                        </p>
                    </div>

                    <div className="w-px h-10 bg-white/20" />

                    <button
                        onClick={() => window.close()}
                        className="h-12 px-6 rounded-xl bg-white text-[#EE0033] text-sm font-black transition-all hover:bg-slate-100 shadow-md active:scale-95 uppercase tracking-tight"
                    >
                        Kết thúc phiên
                    </button>
                </div>
            </header>

            {/* Main Station Layout */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                {/* Visual Feedback Overlays */}
                {flash === 'success' && (
                    <div className="absolute inset-0 bg-emerald-500/30 z-[30] pointer-events-none animate-in fade-in fade-out duration-700 flex items-center justify-center">
                        <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_80px_rgba(16,185,129,0.5)]">
                            <SuccessIcon className="w-24 h-24 text-emerald-500" />
                        </div>
                    </div>
                )}
                {flash === 'error' && (
                    <div className="absolute inset-0 bg-rose-500/30 z-[30] pointer-events-none animate-in fade-in fade-out duration-700 flex items-center justify-center">
                        <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_80px_rgba(244,63,94,0.5)]">
                            <ErrorIcon className="w-24 h-24 text-[#EE0033]" />
                        </div>
                    </div>
                )}

                {/* Left Panel: High Quality Camera Viewport */}
                <div className="flex-[1.6] relative bg-slate-900 flex items-center justify-center p-4">
                    <div
                        id={containerId}
                        className="w-full h-full max-w-5xl rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl relative"
                    >
                        {/* Camera Scanline Animation */}
                        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-[#EE0033]/0 via-[#EE0033]/10 to-[#EE0033]/0 h-20 w-full animate-scan-line" />
                    </div>

                    {/* Viewport UI Overlays - Technical Layer */}
                    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-between p-12">
                        <div className="w-full flex justify-between items-start">
                            <div className="flex flex-col gap-3">
                                <div className="px-4 py-1.5 bg-[#EE0033] shadow-lg rounded-lg flex items-center gap-3">
                                    <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_8px_#fff]" />
                                    <span className="text-xs font-black text-white uppercase tracking-widest">CAMERA FEED ACTIVE</span>
                                </div>
                                <div className="px-4 py-1.5 bg-white border-2 border-[#EE0033] rounded-lg shadow-md">
                                    <span className="text-xs font-black text-[#EE0033] uppercase tracking-widest">BATCH MODE: ON</span>
                                </div>
                            </div>

                            <div className="h-24 w-24 border-t-4 border-r-4 border-white/20 rounded-tr-3xl" />
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <p className="text-sm font-black text-white uppercase tracking-[0.4em] bg-black/60 px-8 py-3 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                                ĐẶT MÃ QR VÀO KHUNG QUÉT
                            </p>
                        </div>

                        <div className="w-full flex justify-between items-end">
                            <div className="h-24 w-24 border-b-4 border-l-4 border-white/20 rounded-bl-3xl" />
                            <div className="text-[10px] font-bold text-white/40 font-mono tracking-widest bg-black/40 px-3 py-1 rounded">
                                SYSTEM_ID: VIETTEL_MS_{id.slice(0, 8)}
                            </div>
                        </div>
                    </div>

                    {meal.status !== 'IN_PROGRESS' && (
                        <div className="absolute inset-0 bg-slate-900/95 z-40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-[#EE0033]/10 rounded-3xl flex items-center justify-center mb-6 border border-[#EE0033]/30">
                                <ErrorIcon className="w-10 h-10 text-[#EE0033]" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">BỮA ĂN CHƯA BẮT ĐẦU</h2>
                            <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                                Bạn cần nhấn <span className="text-white font-bold underline">"Bắt đầu phục vụ"</span> tại trang chi tiết để kích hoạt hệ thống quét.
                            </p>
                            <Button onClick={() => window.close()} className="mt-8 bg-white text-[#EE0033] hover:bg-slate-100 px-10 h-14 text-lg font-black rounded-2xl">QUAY LẠI TRANG CHỦ</Button>
                        </div>
                    )}
                </div>

                {/* Right Panel: Live Audit Feed (Viettel Style) */}
                <div className="flex-1 bg-white flex flex-col relative z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]">
                    <div className="p-8 border-b-2 border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <HistoryIcon className="w-6 h-6 text-[#EE0033]" />
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">NHẬT KÝ QUÉT THỜI GIAN THỰC</h2>
                        </div>
                        <span className="px-3 py-1 bg-[#EE0033]/10 rounded-full text-[10px] font-black text-[#EE0033] uppercase">Sự kiện mới nhất</span>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                        {recentScans.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                                    <HistoryIcon className="w-10 h-10 text-slate-300" />
                                </div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Đang kết nối hệ thống...</p>
                                <p className="text-xs text-slate-300 mt-2">Dữ liệu sẽ xuất hiện tại đây khi có nhân viên quét mã.</p>
                            </div>
                        ) : (
                            recentScans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className={cn(
                                        "group p-4 rounded-2xl border-2 transition-all animate-in slide-in-from-bottom-4 duration-500",
                                        scan.type === 'SUCCESS'
                                            ? "bg-emerald-50 border-emerald-100 hover:border-emerald-300 shadow-sm"
                                            : "bg-rose-50 border-rose-100 hover:border-rose-300 shadow-sm"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md",
                                            scan.type === 'SUCCESS' ? "bg-emerald-500 text-white" : "bg-[#EE0033] text-white"
                                        )}>
                                            {scan.type === 'SUCCESS' ? <SuccessIcon className="w-6 h-6" /> : <ErrorIcon className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <p className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    scan.type === 'SUCCESS' ? "text-emerald-600" : "text-[#EE0033]"
                                                )}>
                                                    {scan.type === 'SUCCESS' ? 'XÁC THỰC THÀNH CÔNG' : 'TỪ CHỐI TRUY CẬP'}
                                                </p>
                                                <span className="text-[11px] font-bold text-slate-400 tabular-nums bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                                    {format(scan.timestamp, 'HH:mm:ss')}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-[#EE0033] transition-colors leading-none">
                                                {scan.employee?.fullName || scan.guest?.fullName || '---'}
                                            </h3>

                                            <div className="flex items-center gap-3 mt-2">
                                                {scan.employee?.employeeCode && (
                                                    <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600">
                                                        {scan.employee.employeeCode}
                                                    </span>
                                                )}
                                                <p className="text-xs font-semibold text-slate-500 truncate italic">
                                                    {scan.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Panel Footer Statistics - Viettel Styled */}
                    <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">SỐ CA THÀNH CÔNG</p>
                                <p className="text-3xl font-black text-emerald-500 leading-none tracking-tight">
                                    {recentScans.filter(s => s.type === 'SUCCESS').length}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">SỐ CA THẤT BẠI</p>
                                <p className="text-3xl font-black text-[#EE0033] leading-none tracking-tight">
                                    {recentScans.filter(s => s.type === 'ERROR').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes scan-line {
                    0% { top: 0%; }
                    100% { top: 90%; }
                }
                .animate-scan-line {
                    animation: scan-line 3s linear infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
