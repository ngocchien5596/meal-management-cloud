'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { FileBarChart, CreditCard, Star } from 'lucide-react';

const tabs = [
    {
        name: 'Tổng hợp',
        href: '/reports/summary',
        icon: FileBarChart
    },
    {
        name: 'Chi phí',
        href: '/reports/costs',
        icon: CreditCard
    },
    {
        name: 'Đánh giá',
        href: '/reports/reviews',
        icon: Star
    }
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-vtbg-secondary/30">
            <div className="bg-white border-b border-vtborder px-6 pt-6 shrink-0">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-vttext-primary">Báo cáo bữa ăn</h1>
                    <p className="text-vttext-muted text-sm">Theo dõi và trích xuất dữ liệu bữa ăn, chi phí và đánh giá.</p>
                </div>

                <div className="flex space-x-8">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 py-4 border-b-2 transition-all font-medium text-sm",
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
