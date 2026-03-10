'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    useSystemConfig,
    useUpdateSystemConfig,
    useRegistrationPresets,
    useUpdateRegistrationPreset
} from '@/features/system';
import toast from 'react-hot-toast';

const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const SmallClockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const SaveIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

export default function DeadlinePage() {
    const { data: config, isLoading: isConfigLoading } = useSystemConfig();
    const updateConfig = useUpdateSystemConfig();
    const { data: presets, isLoading: isPresetsLoading } = useRegistrationPresets();
    const updatePreset = useUpdateRegistrationPreset();

    // Fetch locations for selection
    const { data: locationsResponse } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const res = await api.get<any[]>('/locations');
            return res.data;
        }
    });
    const [locations, setLocations] = useState<any[]>([]);

    const [cutOffHour, setCutOffHour] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (config) {
            setCutOffHour((config as Record<string, string>)['CUT_OFF_HOUR'] || '16');
        }
    }, [config]);

    useEffect(() => {
        if (locationsResponse) {
            setLocations(locationsResponse || []);
        }
    }, [locationsResponse]);

    const handleSaveConfig = async () => {
        if (!cutOffHour) return;
        setIsSaving(true);
        try {
            await updateConfig.mutateAsync({ key: 'CUT_OFF_HOUR', value: cutOffHour });
            toast.success('Lưu cấu hình thành công!');
        } catch (error: any) {
            const msg = (error as any)?.response?.data?.error?.message || error?.message || 'Lỗi không xác định';
            toast.error(`Không thể lưu cấu hình: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePresetLocation = async (presetId: string, locationId: string) => {
        try {
            await updatePreset.mutateAsync({ id: presetId, data: { locationId: locationId || null } });
            toast.success('Cập nhật địa điểm mẫu thành công!');
        } catch (error: any) {
            const msg = (error as any)?.response?.data?.error?.message || error?.message || 'Lỗi không xác định';
            toast.error(`Bị lỗi: ${msg}`);
        }
    };

    if (isConfigLoading || isPresetsLoading) return <div className="p-8 text-center text-vttext-muted">Đang tải cấu hình...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl border border-vtborder shadow-sm p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6">
                            <ClockIcon />
                        </div>

                        <h2 className="text-2xl font-bold text-vttext-primary mb-2">Giờ chốt đăng ký</h2>
                        <p className="text-vttext-muted mb-8 max-w-md">
                            Thiết lập thời gian hết hạn đăng ký suất ăn cho ngày hôm sau. Sau giờ này, nhân viên sẽ không thể đăng ký hoặc hủy phần ăn.
                        </p>

                        <div className="w-full max-w-sm space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="block text-sm font-bold text-vttext-primary pl-1">Thời gian chốt hằng ngày</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cutOffHour}
                                        onChange={(e) => setCutOffHour(e.target.value)}
                                        className="w-full h-12 pl-5 pr-12 bg-vtbg-secondary/30 border border-vtborder rounded-xl text-vttext-primary text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                        placeholder="16"
                                    />
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <SmallClockIcon />
                                    </div>
                                </div>
                                <p className="text-[11px] text-vttext-muted pl-1">Nhập giờ theo định dạng 24h (ví dụ: 16 cho 4:00 PM).</p>
                            </div>

                            <button
                                onClick={handleSaveConfig}
                                disabled={isSaving || !cutOffHour}
                                className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <SaveIcon />
                                )}
                                Lưu thiết lập
                            </button>
                        </div>

                        {/* Presets Configuration Section */}
                        {presets && presets.length > 0 && (
                            <div className="w-full mt-10 pt-10 border-t border-slate-100">
                                <h3 className="text-xl font-bold text-vttext-primary mb-4 text-left">Địa điểm ưu tiên cho mẫu</h3>
                                <p className="text-sm text-vttext-muted mb-6 text-left">
                                    Thiết lập địa điểm mặc định khi nhân viên chọn mẫu đăng ký tương ứng.
                                </p>
                                <div className="space-y-4 text-left">
                                    {presets.map((preset: any) => (
                                        <div key={preset.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 gap-4">
                                            <div>
                                                <div className="font-bold text-slate-800">{preset.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{preset.description}</div>
                                            </div>
                                            <select
                                                className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-[150px] font-medium"
                                                value={preset.locationId || ''}
                                                onChange={(e) => handleUpdatePresetLocation(preset.id, e.target.value)}
                                                disabled={updatePreset.isPending}
                                            >
                                                <option value="">(Không chọn)</option>
                                                {locations.map((loc: any) => (
                                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
