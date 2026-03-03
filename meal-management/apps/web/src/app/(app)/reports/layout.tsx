'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { FileBarChart, CreditCard, Star } from 'lucide-react';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
