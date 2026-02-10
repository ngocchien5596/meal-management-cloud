'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useMealDetail, useToggleRegistration } from '@/features/meals/hooks';
import { MealDetail, Registration } from '@/features/meals/api';

const SearchIcon = () => (
    <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

export default function StaffPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id);
    const meal: MealDetail | undefined = response;
    const toggleMutation = useToggleRegistration();
    const [search, setSearch] = useState('');

    const staff = meal?.registrations || [];
    const filteredStaff = staff.filter((reg: Registration) =>
        reg.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
        reg.employee.employeeCode.toLowerCase().includes(search.toLowerCase())
    );

    const isEditable = meal?.status === 'IN_PROGRESS';

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Danh sách nhân viên</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Tổng cộng {staff.filter(r => !r.isCancelled).length} nhân viên đăng ký suất ăn này</p>
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
                        className="w-full h-10 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">MÃ NHÂN VIÊN</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">HỌ TÊN</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">PHÒNG BAN</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">CHỨC VỤ</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">HỦY SUẤT</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredStaff.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500 italic text-[15px]">
                                    Không tìm thấy nhân viên nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredStaff.map((reg: Registration, idx: number) => (
                                <tr key={reg.id} className={cn("border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors", reg.isCancelled ? "bg-red-50/20" : "")}>
                                    <td className="py-4 px-6 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-[15px] font-medium text-gray-400 font-mono tracking-wider tabular-nums">
                                        {reg.employee.employeeCode}
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className={cn("text-[15px] font-medium", reg.isCancelled ? "text-gray-400 line-through" : "text-gray-900")}>
                                            {reg.employee.fullName}
                                        </p>
                                    </td>
                                    <td className="py-4 px-6 text-[15px] text-gray-600">
                                        {reg.employee.department.name}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-[12px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                                            {reg.employee.position.name}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {isEditable ? (
                                            <input
                                                type="checkbox"
                                                checked={reg.isCancelled}
                                                disabled={toggleMutation.isPending}
                                                onChange={() => toggleMutation.mutate({ id: reg.id })}
                                                className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer disabled:opacity-50 transition-all"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <input
                                                    type="checkbox"
                                                    checked={reg.isCancelled}
                                                    disabled
                                                    className="w-5 h-5 rounded border-gray-300 text-gray-300 cursor-not-allowed opacity-50"
                                                />
                                                <span className="text-[10px] text-gray-400 italic">Khóa</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


        </div >
    );
}
