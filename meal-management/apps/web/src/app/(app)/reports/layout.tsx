'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { FileBarChart, CreditCard, Star } from 'lucide-react';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-full bg-vtbg-secondary/30">
            <div className="bg-white border-b border-vtborder px-6 pt-6 pb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-vttext-primary">Báo cáo bữa ăn</h1>
                    <p className="text-vttext-muted text-sm">Theo dõi và trích xuất dữ liệu bữa ăn, chi phí và đánh giá.</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {children}
            </div>
        </div>
    );
}
