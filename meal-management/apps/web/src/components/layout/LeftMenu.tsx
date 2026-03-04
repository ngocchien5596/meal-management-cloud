'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

import { menuItems, MenuItem, ChevronDownIcon } from '@/lib/constants/menu-items';

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
