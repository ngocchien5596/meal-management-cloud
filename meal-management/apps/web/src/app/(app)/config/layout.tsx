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
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-vtbg-secondary/30">
            <div className="bg-white border-b border-vtborder px-6 pt-6 shrink-0">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-vttext-primary">Cấu hình hệ thống</h1>
                    <p className="text-vttext-muted text-sm">Quản lý tài khoản, phòng ban, chức vụ và các thiết lập vận hành.</p>
                </div>

                <div className="flex space-x-8 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.href);
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 py-4 border-b-2 transition-all font-medium text-sm whitespace-nowrap",
                                    isActive
                                        ? "border-brand text-brand"
                                        : "border-transparent text-vttext-muted hover:text-vttext-primary"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-brand" : "text-vttext-muted")} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {children}
            </div>
        </div>
    );
}
