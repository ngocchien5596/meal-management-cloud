'use client';

import React from 'react';
import { Modal } from '@/components/ui';
import { CheckinLog } from '../api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

interface CheckinSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: CheckinLog | null;
    mealInfo?: {
        mealType: string;
        mealDate: string;
    } | null;
}

export function CheckinSuccessModal({ isOpen, onClose, data, mealInfo }: CheckinSuccessModalProps) {
    if (!data) return null;

    const { employee } = data;
    const isLunch = mealInfo?.mealType === 'LUNCH';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
        >
            <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-500">
                {/* Status Icon */}
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                    <svg className="w-12 h-12 text-emerald-600 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-1">XÁC NHẬN THÀNH CÔNG</h3>
                    <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Đã ghi nhận điểm danh</p>
                </div>

                {/* Ticket Style Info */}
                <div className="w-full bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 relative">
                    {/* Punch holes */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-slate-200" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-slate-200" />

                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nhân viên</p>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="text-[15px] font-black text-vttext-primary truncate">{employee?.fullName}</h4>
                                <p className="text-sm font-bold text-brand mt-0.5">MSNV: {employee?.employeeCode}</p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-200" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bữa ăn</p>
                                <div className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
                                    isLunch ? "bg-orange-100 text-orange-700" : "bg-indigo-100 text-indigo-700"
                                )}>
                                    {isLunch ? 'Bữa Trưa' : 'Bữa Tối'}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian</p>
                                <p className="text-sm font-bold text-slate-700">
                                    {format(new Date(data.checkinTime), 'HH:mm:ss')}
                                </p>
                                <p className="text-[10px] font-medium text-slate-400">
                                    {format(new Date(data.checkinTime), 'dd/MM/yyyy')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-xs font-bold text-slate-400 italic text-center px-4">
                    Vui lòng đưa màn hình này cho nhân viên nhà ăn để nhận suất ăn của bạn.
                </p>

                <button
                    onClick={onClose}
                    className="mt-8 w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                >
                    ĐÓNG
                </button>
            </div>
        </Modal>
    );
}
