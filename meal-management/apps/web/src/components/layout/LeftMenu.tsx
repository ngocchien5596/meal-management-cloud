'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

// --- Icons ---
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

const DollarIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const ClockIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const BuildingIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M8 10h.01" />
        <path d="M16 10h.01" />
    </svg>
);

const BriefcaseIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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

const CreditCardIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const StarIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// --- Interfaces ---
interface MenuItem {
    key: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
    children?: MenuItem[];
}

// --- Menu Configuration ---
const menuItems: MenuItem[] = [
    { key: 'calendar', label: 'Lịch ăn', href: '/dashboard', icon: CalendarIcon },
    { key: 'checkin', label: 'Quét mã QR', href: '/checkin', icon: QRScanIcon },
    { key: 'meals', label: 'Quản lý bữa ăn', href: '/meals', icon: FoodTrayIcon, roles: ['ADMIN_KITCHEN', 'ADMIN_SYSTEM'] },
    {
        key: 'config',
        label: 'Cấu hình hệ thống',
        href: '/config',
        icon: SettingsIcon,
        roles: ['ADMIN_SYSTEM'],
        children: [
            { key: 'config-accounts', label: 'Cấp tài khoản', href: '/config/accounts', icon: IdCardIcon },
            { key: 'config-prices', label: 'Lịch sử giá', href: '/config/prices', icon: DollarIcon },
            { key: 'config-deadline', label: 'Giờ chốt', href: '/config/deadline', icon: ClockIcon },
            { key: 'config-departments', label: 'Phòng ban', href: '/config/departments', icon: BuildingIcon },
            { key: 'config-positions', label: 'Chức vụ', href: '/config/positions', icon: BriefcaseIcon },
        ]
    },
    { key: 'myqr', label: 'Mã QR của tôi', href: '/my-qr', icon: QRCodeIcon },
    {
        key: 'reports',
        label: 'Báo cáo',
        href: '/reports',
        icon: ReportIcon,
        roles: ['ADMIN_KITCHEN', 'HR', 'ADMIN_SYSTEM'],
        children: [
            { key: 'reports-summary', label: 'Báo cáo tiền ăn', href: '/reports/summary', icon: ReportIcon },
            { key: 'reports-costs', label: 'Báo cáo chi phí', href: '/reports/costs', icon: CreditCardIcon },
            { key: 'reports-reviews', label: 'Báo cáo đánh giá', href: '/reports/reviews', icon: StarIcon },
        ]
    },
    { key: 'review', label: 'Đánh giá bữa ăn', href: '/reviews', icon: StarIcon },
    { key: 'password', label: 'Đổi mật khẩu', href: '/change-password', icon: LockIcon },
];

// --- Main Component ---
export function LeftMenu({ onScanClick, userRole }: { onScanClick?: () => void; userRole?: string }) {
    const pathname = usePathname();
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

    useEffect(() => {
        // Auto expand if current path is a child
        const findParent = (items: MenuItem[]): string | null => {
            for (const item of items) {
                if (item.children) {
                    if (item.children.some(child => pathname.startsWith(child.href))) return item.key;
                    const nestedParent = findParent(item.children);
                    if (nestedParent) return nestedParent;
                }
            }
            return null;
        };

        const parentKey = findParent(menuItems);
        if (parentKey && !expandedKeys.includes(parentKey)) {
            setExpandedKeys(prev => [...prev, parentKey]);
        }
    }, [pathname]);

    const toggleExpand = (key: string) => {
        setExpandedKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const isParentActive = (item: MenuItem) => {
        if (item.children) {
            return item.children.some(child => pathname.startsWith(child.href));
        }
        if (item.href === '/dashboard') {
            return pathname === '/dashboard' || pathname === '/';
        }
        if (item.href === '/reports/summary') {
            return pathname.startsWith('/reports');
        }
        return pathname.startsWith(item.href);
    };

    const renderMenuItem = (item: MenuItem, depth = 0) => {
        if (item.roles && (!userRole || !item.roles.includes(userRole))) {
            return null;
        }

        const hasChildren = item.children && item.children.length > 0;
        const active = depth === 0 ? isParentActive(item) : pathname === item.href;
        const expanded = expandedKeys.includes(item.key);
        const Icon = item.icon;

        const content = (
            <div className={cn(
                'w-full flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
                active && !hasChildren
                    ? 'bg-brand-soft text-brand shadow-sm shadow-brand/5'
                    : 'text-vttext-primary hover:bg-surface-2',
                depth > 0 && 'py-2 pl-12 pr-4 bg-transparent shadow-none' // Indent sub-items
            )}>
                <div className="flex items-center gap-3">
                    <Icon className={cn('w-[18px] h-[18px]', active ? 'stroke-brand' : 'stroke-vttext-primary')} />
                    <span className={cn('text-[15px]', active ? 'font-bold' : 'font-medium')}>
                        {item.label}
                    </span>
                </div>
                {hasChildren && (
                    <ChevronDownIcon className={cn(
                        'w-4 h-4 transition-transform duration-200 text-vttext-muted',
                        expanded && 'rotate-180'
                    )} />
                )}
            </div>
        );

        return (
            <div key={item.key} className="w-full">
                {hasChildren ? (
                    <button
                        onClick={() => toggleExpand(item.key)}
                        className="w-full text-left outline-none"
                    >
                        {content}
                    </button>
                ) : item.key === 'checkin' && onScanClick ? (
                    <button onClick={onScanClick} className="w-full text-left outline-none">
                        {content}
                    </button>
                ) : (
                    <Link href={item.href} className="w-full outline-none">
                        {content}
                    </Link>
                )}

                {hasChildren && expanded && (
                    <div className="mt-1 flex flex-col gap-1">
                        {item.children!.map(child => renderMenuItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="w-[280px] bg-white pt-4 pl-4 pr-3 shrink-0 border-r border-vtborder h-full overflow-y-auto no-scrollbar">
            <nav className="flex flex-col gap-1">
                {menuItems.map(item => renderMenuItem(item))}
            </nav>
            <div className="mt-12 px-4 py-8 border-t border-vtborder/50">
                <p className="text-[10px] font-black text-vttext-muted/30 uppercase tracking-[0.2em] text-center">MEAL MANAGEMENT V1.0</p>
            </div>
        </aside>
    );
}
