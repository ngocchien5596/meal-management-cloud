'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsBasePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/reports/summary');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-vttext-muted font-medium">Đang chuyển hướng...</div>
        </div>
    );
}
