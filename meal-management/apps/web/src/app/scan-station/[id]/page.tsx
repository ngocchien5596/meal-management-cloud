'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { useMealDetail } from '@/features/meals/hooks';
import { useScanEmployee, useScanGuest, useManualCheckin } from '@/features/checkin/hooks';
import { playCheckinSuccess, playCheckinError } from '@/lib/utils/audio';
import { Button } from '@/components/ui';
import { MealDetail } from '@/features/meals/api';
import toast from 'react-hot-toast';

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
    method: 'QR' | 'MANUAL';
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
    const manualCheckin = useManualCheckin();

    const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
    const [flash, setFlash] = useState<'success' | 'error' | null>(null);
    const [time, setTime] = useState(new Date());

    const [manualCode, setManualCode] = useState('');
    const [manualSecret, setManualSecret] = useState('');

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
                    guest: result.data.guest,
                    method: 'QR',
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
                    employee: result.data.employee,
                    method: 'QR',
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

            // The underlying hook (useScanGuest / useScanEmployee) already handles the toast.error
            setTimeout(() => setFlash(null), 800);
        }
    };

    const handleManualSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!manualCode || !manualSecret) {
            toast.error('Vui lòng nhập đầy đủ Mã NV và Mã bí mật');
            return;
        }
        if (flash) return;

        try {
            const result = await manualCheckin.mutateAsync({
                mealEventId: id,
                employeeCode: manualCode,
                secretCode: manualSecret
            });

            const scanObj: ScanResult = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'SUCCESS',
                method: 'MANUAL',
                employee: result.data.employee,
                timestamp: new Date()
            };

            playCheckinSuccess();
            setFlash('success');
            setRecentScans(prev => [scanObj, ...prev].slice(0, 20));
            setManualCode('');
            setManualSecret('');
            setTimeout(() => setFlash(null), 800);

        } catch (err: any) {
            console.error('Manual check-in error:', err);
            playCheckinError();
            setFlash('error');

            // The underlying hook (useManualCheckin) already handles the toast.error
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
                        {/* <h1 className="text-2xl font-black tracking-tight uppercase leading-none">VIETTEL SCAN STATION</h1> */}
                        <p className="text-2xl font-black tracking-tight uppercase leading-none">
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

                {/* Left Panel: Camera Viewport UI & Form */}
                <div className="flex-[1.5] relative bg-slate-900 flex flex-col p-6 gap-6">

                    {/* Manual Input Form */}
                    <form onSubmit={handleManualSubmit} className="relative z-20 w-full max-w-5xl mx-auto bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto w-full md:w-auto text-white">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider">NHẬP MÃ THỦ CÔNG</h3>
                                {/* <p className="text-[10px] text-slate-400">Dành cho thiết bị hỏng camera</p> */}
                            </div>
                        </div>
                        <div className="flex-1 flex gap-3 w-full md:max-w-xl">
                            <input
                                type="text"
                                placeholder="Mã nhân viên"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                className="flex-1 min-w-0 h-10 md:h-12 px-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EE0033]/50 focus:border-[#EE0033] uppercase font-mono transition-all text-sm shadow-inner"
                            />
                            <input
                                type="password"
                                placeholder="Mã bí mật"
                                value={manualSecret}
                                onChange={(e) => setManualSecret(e.target.value)}
                                className="flex-1 min-w-0 h-10 md:h-12 px-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EE0033]/50 focus:border-[#EE0033] font-mono transition-all text-sm shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={manualCheckin.isPending}
                                className="h-10 md:h-12 px-4 md:px-6 bg-[#EE0033] hover:bg-[#CC002D] text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#EE0033]/20 shrink-0 border border-white/10"
                            >
                                {manualCheckin.isPending ? "XỬ LÝ..." : "XÁC NHẬN"}
                            </button>
                        </div>
                    </form>

                    <div className="flex-1 w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl relative">
                        <div id={containerId} className="w-full h-full" />
                    </div>

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
                    <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                        <div className="bg-emerald-500 p-5 rounded-2xl flex flex-col items-center shadow-lg shadow-emerald-500/20">
                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Thành công</p>
                            <p className="text-4xl font-black text-white leading-none">
                                {recentScans.filter(s => s.type === 'SUCCESS').length}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                                <tr>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 w-12 text-center">STT</th>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Nhân viên / Khách</th>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 w-24 text-center">Loại</th>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 w-20 text-right">Giờ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentScans.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center grayscale opacity-40">
                                            <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sẵn sàng chờ quét...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentScans.map((scan, index) => (
                                        <tr key={scan.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-3 py-1.5 text-[11px] font-bold text-slate-400 text-center tabular-nums">
                                                {recentScans.length - index}
                                            </td>
                                            <td className="px-3 py-1.5 min-w-0">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-black text-slate-900 leading-tight uppercase truncate">
                                                        {scan.employee?.fullName || scan.guest?.fullName || '---'}
                                                    </span>
                                                    {scan.employee?.employeeCode && (
                                                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase leading-none mt-0.5">
                                                            ID: {scan.employee.employeeCode}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-1.5 text-center">
                                                <span className={cn(
                                                    "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                                    scan.method === 'QR'
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : "bg-blue-50 text-blue-600 border border-blue-100"
                                                )}>
                                                    {scan.method === 'QR' ? 'QR NV' : 'Thủ công'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 text-right tabular-nums text-[11px] font-bold text-slate-500">
                                                {format(scan.timestamp, 'HH:mm:ss')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
