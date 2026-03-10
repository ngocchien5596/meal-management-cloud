'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Users, DollarSign, Clock, Building2, Briefcase, MapPin } from 'lucide-react';

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
    },
    {
        name: 'Địa điểm ăn',
        href: '/config/locations',
        icon: MapPin
    },
    {
        name: 'Danh bạ khách',
        href: '/config/guests',
        icon: Users
    }
];

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
