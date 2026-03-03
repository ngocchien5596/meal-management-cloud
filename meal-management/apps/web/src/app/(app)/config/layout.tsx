'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Users, DollarSign, Clock, Building2, Briefcase } from 'lucide-react';

const tabs = [
    {
        name: 'Cấp tài khoản',
        href: '/config/accounts',
        icon: Users
    },
    {
        name: 'Lịch sử giá',
        href: '/config/prices',
        icon: DollarSign
    },
    {
        name: 'Giờ chốt',
        href: '/config/deadline',
        icon: Clock
    },
    {
        name: 'Phòng ban',
        href: '/config/departments',
        icon: Building2
    },
    {
        name: 'Chức vụ',
        href: '/config/positions',
        icon: Briefcase
    }
];

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-full bg-vtbg-secondary/30">
            <div className="bg-white border-b border-vtborder px-8 py-6 shrink-0">
                <h1 className="text-2xl font-black text-vttext-primary">Cấu hình hệ thống</h1>
                <p className="text-vttext-muted text-sm font-medium mt-1">Quản lý tài khoản, phòng ban, chức vụ và các thiết lập vận hành.</p>
            </div>

            <div className="flex-1 overflow-auto p-8">
                {children}
            </div>
        </div>
    );
}
