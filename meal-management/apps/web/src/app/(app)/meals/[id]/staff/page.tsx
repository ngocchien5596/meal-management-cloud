'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { useMealDetail, useToggleRegistration } from '@/features/meals/hooks';
import { MealDetail, Registration } from '@/features/meals/api';
import { useLocations } from '@/features/system/hooks';
import { MealLocation } from '@/features/system/types';
import { useAuthStore } from '@/features/auth';

const SearchIcon = () => (
    <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

export default function StaffPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id);
    const { data: locations } = useLocations();
    const meal: MealDetail | undefined = response;
    const toggleMutation = useToggleRegistration();
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState<string>('all');

    const staff = meal?.registrations || [];

    const locationCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        staff.forEach((reg: Registration) => {
            if (!reg.isCancelled && reg.location?.id) {
                counts[reg.location.id] = (counts[reg.location.id] || 0) + 1;
            }
        });
        return counts;
    }, [staff]);

    const filteredStaff = staff.filter((reg: Registration) => {
        const matchesSearch = reg.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
            reg.employee.employeeCode.toLowerCase().includes(search.toLowerCase());

        const matchesLocation = locationFilter === 'all' || reg.location?.id === locationFilter;

        return matchesSearch && matchesLocation;
    });

    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN_KITCHEN' || user?.role === 'ADMIN_SYSTEM';
    const isEditable = meal?.status === 'IN_PROGRESS' && isAdmin;

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Danh sách nhân viên</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Tổng cộng {staff.filter(r => !r.isCancelled).length} nhân viên đăng ký suất ăn này</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-48">
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                        >
                            <option value="all">Tất cả địa điểm ({staff.filter(r => !r.isCancelled).length})</option>
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
                    <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">MÃ NHÂN VIÊN</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">HỌ TÊN</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">PHÒNG BAN</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">CHỨC VỤ</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">ĐỊA ĐIỂM ĂN</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">HỦY SUẤT</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500 italic text-[15px]">
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
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                                <span className="text-[14px] font-semibold text-slate-700">
                                                    {reg.location?.name || 'Chưa chọn'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {isEditable ? (
                                                <input
                                                    type="checkbox"
                                                    checked={reg.isCancelled}
                                                    disabled={toggleMutation.isPending}
                                                    onChange={() => toggleMutation.mutate({ id: reg.id, isCancelled: !reg.isCancelled })}
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
            </div>


        </div >
    );
}
