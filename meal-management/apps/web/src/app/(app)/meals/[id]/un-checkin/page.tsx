'use client';

import React, { useMemo, useState } from 'react';
import { useMealDetail } from '@/features/meals/hooks';
import { MealDetail } from '@/features/meals/api';
import { Input } from '@/components/ui';
import { Search, UserX, Phone, Building2, User } from 'lucide-react';

export default function UnCheckinPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: meal, isLoading } = useMealDetail(id);
    const [search, setSearch] = useState('');

    const uncheckinList = useMemo(() => {
        if (!meal) return [];

        const checkins = (meal as MealDetail).checkins || [];
        const registrations = (meal as MealDetail).registrations || [];
        const guests = (meal as MealDetail).guests || [];

        // 1. Get IDs of checked-in employees and guests
        const checkedInEmployeeIds = new Set(
            checkins
                .filter(c => c.employee?.id)
                .map(c => c.employee!.id)
        );
        const checkedInGuestIds = new Set(
            checkins
                .filter(c => c.guest?.id)
                .map(c => c.guest!.id)
        );

        // 2. Filter un-checkin registrations
        const uncheckinEmployees = registrations
            .filter(r => !r.isCancelled && !checkedInEmployeeIds.has(r.employee.id))
            .map(r => ({
                id: r.employee.id,
                fullName: r.employee.fullName,
                employeeCode: r.employee.employeeCode,
                phoneNumber: r.employee.phoneNumber,
                department: r.employee.department.name,
                type: 'EMPLOYEE' as const
            }));

        // 3. Filter un-checkin guests
        const uncheckinGuests = guests
            .filter(g => !checkedInGuestIds.has(g.id))
            .map(g => ({
                id: g.id,
                fullName: g.fullName,
                employeeCode: 'KHÁCH',
                phoneNumber: g.phoneNumber,
                department: g.note || 'Khách mời',
                type: 'GUEST' as const
            }));

        // 4. Combine and Filter by Search
        const combined = [...uncheckinEmployees, ...uncheckinGuests];

        if (!search.trim()) return combined;

        const s = search.toLowerCase();
        return combined.filter(item =>
            item.fullName.toLowerCase().includes(s) ||
            item.employeeCode.toLowerCase().includes(s) ||
            item.phoneNumber?.toLowerCase().includes(s)
        );
    }, [meal, search]);

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;
    if (!meal) return null;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Danh sách chưa check-in</h3>
                    <p className="text-[15px] text-gray-500 mt-1">
                        Tổng cộng {uncheckinList.length} người chưa nhận suất ăn
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm tên, mã, SĐT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 border-slate-200"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Mã/Loại</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Họ và tên</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Số điện thoại</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Phòng ban/Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {uncheckinList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                                <UserX className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                {search ? 'KHÔNG TÌM THẤY KẾT QUẢ' : 'TẤT CẢ ĐÃ CHECK-IN'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                uncheckinList.map((item, idx) => (
                                    <tr key={item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase border ${item.type === 'GUEST'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                }`}>
                                                {item.type === 'GUEST' ? <User className="w-3 h-3" /> : null}
                                                {item.employeeCode}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-[15px] font-bold text-gray-900 uppercase tracking-tight">
                                                {item.fullName}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {item.phoneNumber ? (
                                                <div className="flex items-center gap-2 text-[15px] font-medium text-slate-700">
                                                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </div>
                                                    {item.phoneNumber}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-300 italic">Chưa cập nhật</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-[14px] text-slate-500 font-medium">
                                                <Building2 className="w-4 h-4 text-slate-300" />
                                                {item.department}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
