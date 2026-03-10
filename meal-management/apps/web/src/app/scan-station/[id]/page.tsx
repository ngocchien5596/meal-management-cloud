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

// --- Minimalism Icons ---
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
            <div className="h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#EE0033]/20 border-t-[#EE0033] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                    <ErrorIcon className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase">BỮA ĂN KHÔNG TỒN TẠI</h1>
                <Button onClick={() => window.close()} className="bg-[#EE0033] hover:bg-[#CC002D] text-white px-8 mt-5">ĐÓNG TAB</Button>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden fixed inset-0">
            {/* Minimal Viettel Header */}
            <header className="h-20 bg-[#EE0033] flex items-center justify-between px-8 shadow-lg shrink-0">
                <div className="flex items-center gap-10">
                    <div className="text-white">
                        <h1 className="text-2xl font-black tracking-tight uppercase leading-none">VIETTEL SCAN STATION</h1>
                        <p className="text-[11px] font-bold opacity-80 mt-1 uppercase tracking-widest">
                            {meal.mealType === 'LUNCH' ? 'Bữa Trưa' : 'Bữa Tối'} • {format(new Date(meal.mealDate), 'dd/MM/yyyy')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="flex flex-col items-end">
                        <p className="text-3xl font-black text-white tabular-nums font-mono leading-none">
                            {format(time, 'HH:mm:ss')}
                        </p>
                    </div>

                    <button
                        onClick={() => window.close()}
                        className="h-11 px-6 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-black transition-all border border-white/20 uppercase tracking-wider"
                    >
                        Thoát
                    </button>
                </div>
            </header>

            {/* Main Station Layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Visual Feedback Overlays */}
                {flash === 'success' && (
                    <div className="absolute inset-0 bg-emerald-500/20 z-[30] pointer-events-none animate-in fade-in fade-out duration-700 flex items-center justify-center">
                        <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-2xl scale-110">
                            <SuccessIcon className="w-24 h-24 text-emerald-500" />
                        </div>
                    </div>
                )}
                {flash === 'error' && (
                    <div className="absolute inset-0 bg-rose-500/20 z-[30] pointer-events-none animate-in fade-in fade-out duration-700 flex items-center justify-center">
                        <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-2xl scale-110">
                            <ErrorIcon className="w-24 h-24 text-[#EE0033]" />
                        </div>
                    </div>
                )}

                {/* Left Panel: Camera Viewport */}
                <div className="flex-[1.5] relative bg-slate-900 flex items-center justify-center">
                    <div id={containerId} className="w-full h-full max-w-5xl rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl scale-95" />

                    {meal.status !== 'IN_PROGRESS' && (
                        <div className="absolute inset-0 bg-slate-900/95 z-40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-[#EE0033]/10 rounded-full flex items-center justify-center mb-6 border border-[#EE0033]/30">
                                <ErrorIcon className="w-10 h-10 text-[#EE0033]" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 uppercase">BỮA ĂN CHƯA BẮT ĐẦU</h2>
                            <p className="text-slate-400 text-lg max-w-md mx-auto">Vui lòng quay lại và bấm "Bắt đầu phục vụ" để kích hoạt chế độ quét.</p>
                            <Button onClick={() => window.close()} className="mt-8 bg-white text-[#EE0033] hover:bg-slate-100 px-10 h-14 text-lg font-black rounded-xl">QUAY LẠI</Button>
                        </div>
                    )}
                </div>

                {/* Right Panel: Audit Feed with Top Stats */}
                <div className="flex-1 bg-white flex flex-col relative z-20 border-l border-slate-100 shadow-2xl">
                    {/* Stats Panel moved to Top */}
                    <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
                        <div className="bg-emerald-500 p-5 rounded-2xl flex flex-col items-center shadow-lg shadow-emerald-500/20">
                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Thành công</p>
                            <p className="text-4xl font-black text-white leading-none">
                                {recentScans.filter(s => s.type === 'SUCCESS').length}
                            </p>
                        </div>
                        <div className="bg-[#EE0033] p-5 rounded-2xl flex flex-col items-center shadow-lg shadow-rose-500/20">
                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Thất bại</p>
                            <p className="text-4xl font-black text-white leading-none">
                                {recentScans.filter(s => s.type === 'ERROR').length}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                        {recentScans.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 grayscale opacity-40">
                                <HistoryIcon className="w-16 h-16 text-slate-300 mb-4" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sẵn sàng chờ quét...</p>
                            </div>
                        ) : (
                            recentScans.map((scan) => (
                                <div
                                    key={scan.id}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all animate-in slide-in-from-right-4 duration-300",
                                        scan.type === 'SUCCESS'
                                            ? "bg-slate-50 border-emerald-100"
                                            : "bg-slate-50 border-rose-100"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                            scan.type === 'SUCCESS' ? "bg-emerald-500 text-white" : "bg-[#EE0033] text-white"
                                        )}>
                                            {scan.type === 'SUCCESS' ? <SuccessIcon className="w-6 h-6" /> : <ErrorIcon className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className="text-[16px] font-black text-slate-900 truncate uppercase tracking-tight">
                                                    {scan.employee?.fullName || scan.guest?.fullName || '---'}
                                                </h3>
                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                    {format(scan.timestamp, 'HH:mm:ss')}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-[11px] font-bold uppercase",
                                                scan.type === 'SUCCESS' ? "text-emerald-600" : "text-[#EE0033]"
                                            )}>
                                                {scan.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                video { object-fit: cover !important; }
            `}</style>
        </div>
    );
}
