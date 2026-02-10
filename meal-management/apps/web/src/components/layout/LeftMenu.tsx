'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

// Icons
const CalendarIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const QRScanIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
);

const FoodTrayIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17h18" />
        <path d="M5 17v2h14v-2" />
        <path d="M12 5c-4.5 0-8 3-8 7h16c0-4-3.5-7-8-7z" />
        <path d="M12 2v3" />
    </svg>
);

const IdCardIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="8" cy="12" r="2" />
        <path d="M14 10h4" />
        <path d="M14 14h4" />
    </svg>
);

const QRCodeIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="3" height="3" />
        <rect x="18" y="14" width="3" height="3" />
        <rect x="14" y="18" width="3" height="3" />
        <rect x="18" y="18" width="3" height="3" />
    </svg>
);

const ReportIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const LockIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const SettingsIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const StarIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

interface MenuItem {
    key: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[]; // Allowed roles. If undefined, allowed for all.
}

const menuItems: MenuItem[] = [
    { key: 'calendar', label: 'Lịch ăn', href: '/dashboard', icon: CalendarIcon },
    { key: 'checkin', label: 'Quét mã QR', href: '/checkin', icon: QRScanIcon },
    { key: 'meals', label: 'Quản lý bữa ăn', href: '/meals', icon: FoodTrayIcon, roles: ['ADMIN_KITCHEN', 'ADMIN_SYSTEM'] },
    { key: 'accounts', label: 'Cấp tài khoản', href: '/accounts', icon: IdCardIcon, roles: ['HR', 'ADMIN_SYSTEM'] },
    { key: 'config', label: 'Cấu hình hệ thống', href: '/config', icon: SettingsIcon, roles: ['ADMIN_SYSTEM'] },
    { key: 'myqr', label: 'Mã QR của tôi', href: '/my-qr', icon: QRCodeIcon },
    { key: 'review', label: 'Đánh giá bữa ăn', href: '#', icon: StarIcon },
    { key: 'reports', label: 'Báo cáo', href: '/reports', icon: ReportIcon, roles: ['ADMIN_KITCHEN', 'HR', 'ADMIN_SYSTEM'] },
    { key: 'password', label: 'Đổi mật khẩu', href: '/change-password', icon: LockIcon },
];

export function LeftMenu({ onScanClick, onReviewClick, userRole }: { onScanClick?: () => void; onReviewClick?: () => void; userRole?: string }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard' || pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-[220px] bg-white pt-4 pl-4 pr-3 shrink-0">
            <nav className="space-y-1">
                {menuItems.map((item) => {
                    // Role check
                    if (item.roles && (!userRole || !item.roles.includes(userRole))) {
                        return null;
                    }

                    const active = isActive(item.href);
                    const Icon = item.icon;

                    const content = (
                        <div className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors duration-150',
                            active
                                ? 'bg-brand-soft text-brand'
                                : 'text-vttext-primary hover:bg-surface-2'
                        )}>
                            <Icon className={cn('w-[18px] h-[18px]', active ? 'stroke-brand' : 'stroke-vttext-primary')} />
                            <span className="text-[15px] font-medium">{item.label}</span>
                        </div>
                    );

                    if (item.key === 'checkin' && onScanClick) {
                        return (
                            <button
                                key={item.key}
                                onClick={onScanClick}
                                className="w-full text-left"
                            >
                                {content}
                            </button>
                        );
                    }

                    if (item.key === 'review' && onReviewClick) {
                        return (
                            <button
                                key={item.key}
                                onClick={onReviewClick}
                                className="w-full text-left"
                            >
                                {content}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className="w-full"
                        >
                            {content}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
