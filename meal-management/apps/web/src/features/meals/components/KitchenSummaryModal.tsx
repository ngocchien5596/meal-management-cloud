'use client';

import React from 'react';
import { Modal } from '@/components/ui';
import { useMealSummary } from '../hooks';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface KitchenSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mealId: string | null;
}

const UtensilsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export function KitchenSummaryModal({ isOpen, onClose, mealId }: KitchenSummaryModalProps) {
    const { data: summary, isLoading } = useMealSummary(mealId || '');

    if (!mealId) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tổng hợp suất ăn"
        >
            {isLoading ? (
                <div className="py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                </div>
            ) : summary ? (
                <div className="space-y-6 pt-2 pb-1">
                    {/* Header Info - Matching standard style */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                            summary.mealType === 'LUNCH' ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"
                        )}>
                            <UtensilsIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                Bữa {summary.mealType === 'LUNCH' ? 'Trưa' : 'Tối'}
                            </div>
                            <div className="text-lg font-bold text-slate-800 capitalize leading-tight">
                                {format(new Date(summary.mealDate), 'dd/MM/yyyy')}
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 bg-brand/5 border border-brand/20 rounded-[24px] text-center">
                            <span className="text-brand text-xs font-black uppercase tracking-widest mb-1 block">TỔNG XUẤT</span>
                            <div className="text-5xl font-black text-brand tabular-nums">{summary.totalServings}</div>
                            <div className="mt-4 pt-4 border-t border-brand/10 flex justify-between text-slate-600 font-bold text-sm">
                                <span>Nhân viên: {summary.totalRegistrations}</span>
                                <span>Khách: {summary.totalGuests}</span>
                            </div>
                        </div>
                    </div>

                    {/* Location List - Simplified */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Số lượng theo địa điểm:</h3>
                        <div className="grid gap-2">
                            {summary.locations.map((loc, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-sm">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-slate-700">{loc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UsersIcon className="text-slate-300" />
                                        <span className="font-black text-slate-900 tabular-nums text-lg">{loc.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-[0.98]"
                    >
                        ĐÓNG
                    </button>
                </div>
            ) : (
                <div className="py-12 text-center text-slate-500">
                    Không tìm thấy dữ liệu.
                </div>
            )}
        </Modal>
    );
}
