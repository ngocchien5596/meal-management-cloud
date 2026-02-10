'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { useAuthStore } from '@/features/auth';
import { registrationApi } from '@/features/registrations/api';
import { setServerTimeOffset } from '@/lib/utils/date';
import { ReviewModal } from '@/features/reviews/components/ReviewModal';
import dynamic from 'next/dynamic';

const SelfScanModal = dynamic(
    () => import('@/features/checkin/components/SelfScanModal').then((mod) => mod.SelfScanModal),
    { ssr: false }
);

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth, _hasHydrated, token } = useAuthStore();
    const [isReady, setIsReady] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // Wait for hydration
    useEffect(() => {
        if (_hasHydrated) {
            setIsReady(true);
        }
    }, [_hasHydrated]);

    useEffect(() => {
        if (!isReady) return;

        checkAuth();

        // Fetch server time to sync offset
        registrationApi.getServerTime().then(res => {
            if (res.success && res.data?.serverTime) {
                setServerTimeOffset(res.data.serverTime);
            }
        }).catch(err => console.error('Failed to sync server time:', err));
    }, [isReady, checkAuth]);

    useEffect(() => {
        // Only redirect AFTER hydration is complete
        // Use token to check for "optimistic" auth status to prevent flicker
        if (isReady && !token) {
            router.push('/login');
        }
    }, [isReady, token, router]);

    // Show nothing or a loader while hydrating
    if (!isReady) {
        return null; // Or a unified loading spinner
    }

    return (
        <>
            <AppShell
                user={user ? { fullName: user.fullName, employeeCode: user.employeeCode } : undefined}
                userRole={user?.role}
                onScanClick={() => setIsScannerOpen(true)}
                onReviewClick={() => setIsReviewOpen(true)}
            >
                {children}
            </AppShell>
            <SelfScanModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />
            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
            />
        </>
    );
}
