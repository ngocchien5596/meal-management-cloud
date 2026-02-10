'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Home, QrCode, ScanLine, Star, Lock } from 'lucide-react';

interface MobileNavProps {
    onScanClick?: () => void;
    onReviewClick?: () => void;
    userRole?: string;
}

export function MobileNav({ onScanClick, onReviewClick, userRole }: MobileNavProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard' || pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Height spacer to prevent content from being hidden behind nav */}
            <div className="h-16 md:hidden" />

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
                <div className="flex items-center justify-around h-16 px-2">
                    {/* 1. Dashboard */}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                            isActive('/dashboard') ? "text-brand" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Home size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Lịch ăn</span>
                    </Link>

                    {/* 2. My QR */}
                    <Link
                        href="/my-qr"
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                            isActive('/my-qr') ? "text-brand" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <QrCode size={22} strokeWidth={isActive('/my-qr') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">QR Tôi</span>
                    </Link>

                    {/* 3. SCAN BUTTON (Prominent Center) */}
                    <div className="relative -top-5">
                        <button
                            onClick={onScanClick}
                            className="flex items-center justify-center w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-transform active:scale-95"
                        >
                            <ScanLine size={28} />
                        </button>
                    </div>

                    {/* 4. Review Button */}
                    <button
                        onClick={onReviewClick}
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Star size={22} />
                        <span className="text-[10px] font-bold">Đánh giá</span>
                    </button>

                    {/* 5. Change Password (Replaces Menu) */}
                    <Link
                        href="/change-password"
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                            isActive('/change-password') ? "text-brand" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Lock size={22} strokeWidth={isActive('/change-password') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Mật khẩu</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
