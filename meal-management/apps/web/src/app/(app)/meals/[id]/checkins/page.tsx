'use client';

import React, { useState, useMemo } from 'react';
import { useMealDetail } from '@/features/meals/hooks';
import { MealDetail, CheckinLog } from '@/features/meals/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { useLocations } from '@/features/system/hooks';
import { MealLocation } from '@/features/system/types';

const SearchIcon = () => (
    <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

export default function CheckinsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id);
    const { data: locations } = useLocations();
    const meal: MealDetail | undefined = response;
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState<string>('all');

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;

    const allCheckins = meal?.checkins || [];

    const locationCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        allCheckins.forEach((log: CheckinLog) => {
            const locId = log.registration?.location?.id;
            if (locId) {
                counts[locId] = (counts[locId] || 0) + 1;
            }
        });
        return counts;
    }, [allCheckins]);

    const checkins = [...allCheckins]
        .filter((log: CheckinLog) => {
            const name = (log.employee?.fullName || log.guest?.fullName || '').toLowerCase();
            const code = (log.employee?.employeeCode || 'khách').toLowerCase();
            const query = search.toLowerCase();
            const matchesSearch = name.includes(query) || code.includes(query);
            
            const matchesLocation = locationFilter === 'all' || log.registration?.location?.id === locationFilter;
            
            return matchesSearch && matchesLocation;
        })
        .sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime());

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Danh sách đã Check-in</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Lịch sử ra vào nhà ăn thời gian thực (Tổng cộng: {checkins.length})</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                        >
                            <option value="all">Tất cả địa điểm ({allCheckins.length})</option>
                            {locations?.map((loc: MealLocation) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name} ({locationCounts[loc.id] || 0})
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm tên hoặc MNV..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Họ và tên</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">MNV / Loại</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Thời gian</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Địa điểm</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Phương thức</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {checkins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                            </div>
                                            <p className="text-gray-500 font-medium text-[15px]">Chưa có dữ liệu check-in</p>
                                            <p className="text-gray-400 text-sm italic">Quét mã hoặc check-in thủ công để bắt đầu ghi nhận</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                checkins.map((log: CheckinLog, idx: number) => {
                                    const name = log.employee?.fullName || log.guest?.fullName || 'Người dùng ẩn';
                                    const code = log.employee?.employeeCode || 'KHÁCH';
                                    return (
                                        <tr key={log.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                                                    {String(checkins.length - idx).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-[15px] font-medium text-gray-900 uppercase tracking-tight">
                                                    {name}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={cn(
                                                    "text-[12px] font-bold px-2 py-0.5 rounded border uppercase",
                                                    log.employee ? "text-blue-600 bg-blue-50 border-blue-100" : "text-amber-600 bg-amber-50 border-amber-100"
                                                )}>
                                                    {code}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-[15px] text-gray-600 font-mono">
                                                {format(new Date(log.checkinTime), 'HH:mm dd/MM/yyyy')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                                    <span className="text-[14px] font-semibold text-slate-700">
                                                        {log.registration?.location?.name || 'Nhà ăn'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    {log.method === 'QR_SCAN' ? 'Quét QR' : log.method === 'MANUAL' ? 'Thủ công' : 'Tự quét'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
