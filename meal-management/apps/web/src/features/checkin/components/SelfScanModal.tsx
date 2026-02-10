'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Modal } from '@/components/ui';
import { Html5Qrcode } from 'html5-qrcode';
import { useSelfScan } from '../hooks';
import { CheckinLog } from '../api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface SelfScanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SelfScanModal({ isOpen, onClose }: SelfScanModalProps) {
    // State
    const [cameraError, setCameraError] = useState(false);

    // Refs for unsafe mutable instances
    // We use ref to hold the scanner instance to avoid re-creating it on every render
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerId = 'self-scan-reader';
    const isScanningRef = useRef(false);
    const isMountedRef = useRef(false);

    const selfScanMutation = useSelfScan();

    // Result State
    const [successData, setSuccessData] = useState<CheckinLog | null>(null);
    const [errorData, setErrorData] = useState<string | null>(null);
    const [mealInfo, setMealInfo] = useState<{ mealType: string; mealDate: string } | null>(null);

    // Initial mount tracking
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Stop scanner helper
    const stopScanner = async () => {
        const scanner = scannerRef.current;
        if (scanner) {
            try {
                if (isScanningRef.current) {
                    await scanner.stop();
                    isScanningRef.current = false;
                }
                scanner.clear();
            } catch (e) {
                console.warn('Scanner stop error (ignored):', e);
            }
            scannerRef.current = null;
        }
    };

    useEffect(() => {
        let isEffectActive = true;

        const startScanner = async () => {
            // Only start scanner if modal is open and we DON'T have success or error data yet
            if (isOpen && !successData && !errorData && !cameraError) {

                // Ensure clean slate
                await stopScanner();

                if (!isEffectActive || !isMountedRef.current) return;

                try {
                    // Create new instance
                    // Note: The element with id={scannerContainerId} MUST exist in DOM at this point
                    const html5QrCode = new Html5Qrcode(scannerContainerId);
                    scannerRef.current = html5QrCode;

                    await html5QrCode.start(
                        { facingMode: 'environment' },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        async (decodedText) => {
                            // If unmounted or pending, ignore
                            if (!isMountedRef.current || !isEffectActive) return;
                            if (selfScanMutation.isPending) return;

                            try {
                                // Pause scanner logic immediately
                                await stopScanner();

                                const response = await selfScanMutation.mutateAsync({ qrToken: decodedText }) as any;

                                if (isMountedRef.current && isEffectActive) {
                                    if (response && response.success && response.data) {
                                        setSuccessData(response.data);
                                        setMealInfo(response.meal || null);
                                    } else {
                                        setErrorData(response.error || 'Dữ liệu phản hồi không hợp lệ');
                                    }
                                }
                            } catch (err: any) {
                                console.error('Scan handling error:', err);
                                if (isMountedRef.current && isEffectActive) {
                                    const errMsg = err?.error || err?.message || 'Có lỗi xảy ra khi quét mã';
                                    setErrorData(errMsg);
                                }
                            }
                        },
                        (errorMessage) => {
                            // Ignore frame errors
                        }
                    );
                    isScanningRef.current = true;
                } catch (err) {
                    console.error('Failed to start scanner:', err);
                    // Only set error if we are still active (avoids setting state on unmount)
                    if (isMountedRef.current && isEffectActive) {
                        setCameraError(true);
                    }
                }
            } else {
                // If modal closed or results shown, ensure scanner is stopped
                await stopScanner();
            }
        };

        // Add a small delay to ensure the DOM element is fully rendered and stable
        const timer = setTimeout(() => {
            startScanner();
        }, 300);

        return () => {
            isEffectActive = false;
            clearTimeout(timer);
            // We cannot await in cleanup, but we must initiate stop
            stopScanner().catch(err => console.error("Cleanup error", err));
        };
    }, [isOpen, successData, errorData]); // Remove cameraError to prevent loop

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Stop any active camera scanning first
            await stopScanner();

            // Create temporary scanner for file
            const html5QrCode = new Html5Qrcode(scannerContainerId);
            // We don't assign to scannerRef because we don't want the effect cleanup to mess with this
            // properly, or maybe we SHOULD to ensure clean up?
            // Let's use a try-finally block with a local instance

            try {
                const result = await html5QrCode.scanFile(file, true);

                if (result) {
                    const response = await selfScanMutation.mutateAsync({ qrToken: result }) as any;
                    if (response && response.success && response.data) {
                        setSuccessData(response.data);
                        setMealInfo(response.meal || null);
                    } else {
                        setErrorData(response.error || 'Dữ liệu phản hồi không hợp lệ');
                    }
                }
            } finally {
                html5QrCode.clear();
            }

        } catch (err: any) {
            console.error('File scan error:', err);
            toast.error('Không tìm thấy mã QR trong ảnh');
            // If we failed, the effect dependency on 'cameraError' or 'isOpen' didn't change,
            // so the camera might not restart automatically. 
            // That's fine, user can try uploading again or close/reopen.
        }

        // Reset file input value
        event.target.value = '';
    };

    const handleReset = () => {
        setSuccessData(null);
        setErrorData(null);
        setMealInfo(null);
        setCameraError(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const formatDateSafe = (dateStr: string | undefined, pattern: string) => {
        if (!dateStr) return '--:--';
        try {
            return format(new Date(dateStr), pattern);
        } catch (e) {
            return '--:--';
        }
    };

    const renderHeaderStatus = (type: 'success' | 'error') => {
        const isSuccess = type === 'success';
        return (
            <div className="flex flex-col items-center mb-6">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mb-4 relative",
                    isSuccess ? "bg-emerald-100" : "bg-rose-100"
                )}>
                    <div className={cn(
                        "absolute inset-0 rounded-full animate-ping opacity-20",
                        isSuccess ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    {isSuccess ? (
                        <svg className="w-10 h-10 text-emerald-600 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg className="w-10 h-10 text-rose-600 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <circle cx="12" cy="12" r="10" strokeWidth="2" className="opacity-20" />
                            <path d="M12 8v4" />
                            <path d="M12 16h.01" />
                        </svg>
                    )}
                </div>
                <h3 className={cn(
                    "text-xl font-black mb-1 tracking-tight uppercase",
                    isSuccess ? "text-emerald-700" : "text-rose-700"
                )}>
                    {isSuccess ? "ĐIỂM DANH THÀNH CÔNG" : "ĐIỂM DANH THẤT BẠI"}
                </h3>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={(successData || errorData) ? "" : "Quét mã nhận cơm"}
        >
            {/* 
                CRITICAL FIX: Keep the scanner container ALWAYS in DOM while result is shown 
                to avoid "Application error" crash when html5-qrcode tries to clean up 
                a removed element.
                We use 'hidden' class instead of conditional rendering for the scanner div.
            */}
            <div className={cn(
                "flex flex-col items-center py-4",
                (successData || errorData) ? "hidden h-0 overflow-hidden" : "block"
            )}>
                {cameraError ? (
                    <div className="w-full aspect-square max-w-[300px] flex flex-col items-center justify-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-1">Không thể mở Camera</p>
                        <p className="text-xs text-slate-400 mb-4">Trình duyệt chặn do bảo mật hoặc không có quyền.</p>

                        <label className="px-4 py-2 bg-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 active:scale-95 transition-transform cursor-pointer">
                            Chọn ảnh QR từ thư viện
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                ) : (
                    <div
                        id="self-scan-reader"
                        className="w-full aspect-square max-w-[300px] overflow-hidden rounded-2xl border-4 border-brand bg-slate-900 shadow-2xl relative"
                    >
                        {/* Fallback upload button overlay */}
                        <label className="absolute bottom-2 right-2 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-lg cursor-pointer transition-colors z-[100]" title="Tải ảnh lên">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                        {/* We don't render an inner div for html5-qrcode, just use the parent container */}
                    </div>
                )}

                <div className="mt-8 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700">Vui lòng quét mã QR tại nhà ăn</p>
                    <p className="text-xs text-slate-400">Giữ camera ổn định trước mã QR để điểm danh</p>
                </div>

                {selfScanMutation.isPending && (
                    <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-brand-soft text-brand rounded-full animate-pulse border border-brand-soft2">
                        <div className="w-2 h-2 bg-brand rounded-full animate-bounce" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Đang chờ quét...</span>
                    </div>
                )}
            </div>

            {successData && (
                <div className="flex flex-col items-center py-2 animate-in fade-in zoom-in duration-500">
                    {renderHeaderStatus('success')}

                    {/* NEW: Meal Info Sub-header */}
                    <h4 className="text-lg font-black text-brand mb-1">
                        {mealInfo?.mealType === 'LUNCH' ? 'BỮA TRƯA' : 'BỮA TỐI'} - {formatDateSafe(mealInfo?.mealDate, 'dd/MM/yyyy')}
                    </h4>

                    {/* UPDATED: Timestamp with Date */}
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-6 px-4 py-1 bg-emerald-50 rounded-full">
                        Ghi nhận lúc: {formatDateSafe(successData.checkinTime, 'HH:mm:ss - dd/MM/yyyy')}
                    </p>

                    <div className="w-full bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-200 relative overflow-hidden">
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nhân viên</p>
                                <h4 className="text-sm font-black text-vttext-primary line-clamp-1">{successData.employee?.fullName || 'Nhân viên'}</h4>
                                <p className="text-xs font-bold text-brand mt-0.5">MSNV: {successData.employee?.employeeCode || '---'}</p>
                            </div>

                            {/* REMOVED: Redundant Meal/Date info below */}
                        </div>
                    </div>

                    <p className="mt-6 text-[11px] font-bold text-slate-400 italic text-center px-4 leading-relaxed">
                        Vui lòng đưa màn hình này cho nhân viên nhà ăn<br />để nhận suất ăn của bạn.
                    </p>

                    <button
                        onClick={handleClose}
                        className="mt-8 w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                    >
                        ĐÓNG
                    </button>
                </div>
            )}

            {errorData && (
                <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-500">
                    {renderHeaderStatus('error')}

                    <div className="w-full bg-rose-50 rounded-2xl p-6 border-2 border-dashed border-rose-200 text-center mb-6">
                        <p className="text-sm font-bold text-rose-800 mb-2">Không thể điểm danh</p>
                        <p className="text-xs text-rose-600 leading-relaxed">{errorData}</p>
                    </div>

                    <p className="text-[11px] font-medium text-slate-400 italic text-center px-4 mb-8">
                        Vui lòng kiểm tra lại trạng thái đăng ký<br />hoặc liên hệ quản lý.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleClose}
                            className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex-1 h-11 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand/20"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
