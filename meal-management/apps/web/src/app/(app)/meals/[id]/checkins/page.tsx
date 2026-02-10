'use client';

import React from 'react';
import { useMealDetail } from '@/features/meals/hooks';
import { MealDetail, CheckinLog } from '@/features/meals/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

export default function CheckinsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id);
    const meal: MealDetail | undefined = response;

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;

    const checkins = meal?.checkins || [];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Danh sách đã Check-in</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Lịch sử ra vào nhà ăn thời gian thực (Tổng cộng: {checkins.length})</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Họ và tên</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">MNV / Loại</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Thời gian</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Phương thức</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {checkins.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
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
                                                {String(idx + 1).padStart(2, '0')}
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
    );
}
