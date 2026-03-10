"use client";

import { useState, useEffect } from 'react';
import {
    useSystemConfig,
    useUpdateSystemConfig
} from '@/features/system';
import toast from 'react-hot-toast';
import { Clock, Save, Loader2 } from 'lucide-react';

export default function DeadlinePage() {
    const { data: config, isLoading: isConfigLoading } = useSystemConfig();
    const updateConfig = useUpdateSystemConfig();

    const [cutOffHour, setCutOffHour] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (config) {
            setCutOffHour((config as Record<string, string>)['CUT_OFF_HOUR'] || '16');
        }
    }, [config]);

    const handleSaveConfig = async () => {
        if (!cutOffHour.trim()) return;

        // Simple validation for HH or HH:mm
        const timeRegex = /^([01]?[0-9]|2[0-3])(:[0-5][0-9])?$/;
        if (!timeRegex.test(cutOffHour.trim())) {
            toast.error('Định dạng thời gian không hợp lệ (VD: 16 hoặc 15:30)');
            return;
        }

        setIsSaving(true);
        try {
            await updateConfig.mutateAsync({ key: 'CUT_OFF_HOUR', value: cutOffHour.trim() });
            toast.success('Lưu cấu hình thành công!');
        } catch (error: any) {
            const msg = (error as any)?.response?.data?.error?.message || error?.message || 'Lỗi không xác định';
            toast.error(`Không thể lưu cấu hình: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isConfigLoading) return <div className="p-8 text-center text-vttext-muted font-medium italic">Đang tải cấu hình...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-7 py-6 animate-in fade-in duration-500">

            {/* 1. Header (Standardized - Left Aligned) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                        <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-vttext-primary leading-none">Giờ chốt đăng ký</h1>
                        <p className="text-sm text-vttext-muted mt-1.5 font-medium">Thiết lập thời gian hết hạn đăng ký hằng ngày</p>
                    </div>
                </div>
            </div>

            {/* 2. Main Content (Centered Content Card only) */}
            <div className="flex flex-col items-center pt-8">
                <div className="bg-white rounded-xl border border-[#eef2f7] shadow-sm w-full max-w-xl overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-slate-50/30">
                        <h2 className="text-lg font-bold text-vttext-primary mb-1">Cấu hình thời gian</h2>
                        <p className="text-sm text-vttext-muted">
                            Sau giờ này (trong ngày hôm nay), hệ thống sẽ tự động khóa chức năng đăng ký hoặc hủy phần ăn cho ngày mai.
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Thời gian chốt hằng ngày</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={cutOffHour}
                                    onChange={(e) => setCutOffHour(e.target.value)}
                                    className="w-full h-12 px-5 pr-12 bg-white border border-vtborder rounded-xl text-lg font-bold text-vttext-primary focus:outline-none focus:ring-4 focus:ring-focus/30 focus:border-brand transition-all shadow-sm"
                                    placeholder="VD: 16 hoặc 15:30"
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-vttext-muted group-focus-within:text-brand transition-colors">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-[11px] text-vttext-muted ml-1 font-medium italic">
                                Hỗ trợ định dạng 24h (VD: 16 cho 4:00 PM hoặc 15:30).
                            </p>
                        </div>

                        <button
                            onClick={handleSaveConfig}
                            disabled={isSaving || !cutOffHour.trim()}
                            className="w-full h-12 bg-brand hover:bg-brand-hover text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            LƯU THIẾT LẬP
                        </button>
                    </div>
                </div>

                {/* Decoration under centered card */}
                <div className="mt-8 opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vttext-muted">
                        System Configuration &bull; v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
