import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';
import { useLogout } from '@/features/auth';
import { menuItems, MenuItem, ChevronDownIcon } from '@/lib/constants/menu-items';
import { cn } from '@/lib/utils/cn';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    user?: {
        fullName: string;
        employeeCode: string;
    };
    userRole?: string;
    onScanClick?: () => void;
}

export function Header({ user, userRole, onScanClick }: HeaderProps) {
    const { logout } = useLogout();
    const pathname = usePathname();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto expand if current path is a child
    useEffect(() => {
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
        if (item.href === '/dashboard' || item.href === '/') {
            return pathname === '/dashboard' || pathname === '/';
        }
        return pathname.startsWith(item.href);
    };

    if (!mounted) return <header className="h-[72px] bg-white border-b border-gray-200 shadow-sm z-10" />;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const renderMobileMenuItem = (item: MenuItem, depth = 0) => {
        if (item.roles && (!userRole || !item.roles.includes(userRole))) {
            return null;
        }

        const hasChildren = item.children && item.children.length > 0;
        const active = depth === 0 ? isParentActive(item) : pathname === item.href;
        const expanded = expandedKeys.includes(item.key);
        const Icon = item.icon;

        const content = (
            <div className={cn(
                'flex items-center justify-between p-3 rounded-xl transition-all duration-200 group cursor-pointer',
                active && !hasChildren
                    ? (depth === 0 ? 'bg-brand-soft text-brand shadow-sm shadow-brand/5' : 'text-brand font-bold')
                    : 'text-gray-700 hover:bg-slate-50 hover:text-gray-900',
                depth > 0 && 'py-2 pl-12 bg-transparent shadow-none'
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                        active ? "bg-brand text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700",
                        depth > 0 && "w-6 h-6 bg-transparent" // Hide box for nested items
                    )}>
                        <Icon className={cn(depth > 0 ? "w-4 h-4" : "w-[18px] h-[18px]")} />
                    </div>
                    <span className={cn(
                        "text-[15px] transition-all",
                        active ? "font-bold" : "font-medium"
                    )}>
                        {item.label}
                    </span>
                </div>
                {hasChildren && (
                    <ChevronDownIcon className={cn(
                        "w-4 h-4 transition-transform duration-200 text-slate-400",
                        expanded && "rotate-180"
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
                    <button
                        onClick={() => {
                            onScanClick();
                            setIsMenuOpen(false);
                        }}
                        className="w-full text-left outline-none block"
                    >
                        {content}
                    </button>
                ) : (
                    <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full outline-none block"
                    >
                        {content}
                    </Link>
                )}

                {hasChildren && expanded && (
                    <div className="mt-1 flex flex-col gap-1 anime-in fade-in slide-in-from-top-1 duration-200">
                        {item.children!.map(child => renderMobileMenuItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <header className="h-16 md:h-[72px] bg-white border-b border-gray-200 flex items-center px-4 md:px-6 shrink-0 justify-between relative z-50">
                {/* Left - Hamburger (Mobile) + Logo */}
                <div className="flex items-center">
                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <Link href="/" className="flex items-center">
                        <div className="w-10 h-10 md:w-11 md:h-11 bg-white rounded flex items-center justify-center overflow-hidden border border-gray-100">
                            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-3 md:ml-4">
                            <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                                Hệ thống Quản lý suất ăn
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-500 leading-tight hidden sm:block">
                                Công ty CP Xi măng Cẩm phả
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Center - Time (Hidden on Mobile) */}
                <div className="flex-1 flex justify-center hidden md:flex">
                    <div className="text-center">
                        <div className="text-3xl font-semibold text-gray-900">{formatTime(currentTime)}</div>
                        <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
                    </div>
                </div>

                {/* Right - User */}
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="font-semibold text-vttext-primary text-sm md:text-base">{user?.fullName || 'Guest'}</div>
                        <div className="text-xs md:text-sm text-vttext-secondary">MNV: {user?.employeeCode || '---'}</div>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-brand rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                        {user?.fullName ? getInitial(user.fullName) : 'G'}
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 md:p-2 text-vttext-muted hover:text-brand hover:bg-brand-soft rounded-lg transition-all duration-200"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200">
                                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="font-black text-slate-800 text-lg uppercase tracking-tight">Viettel Menu</span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
                            {/* User Info Card */}
                            <div className="p-4 bg-brand-soft/50 rounded-2xl border border-brand/5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-brand/20">
                                    {user?.fullName ? getInitial(user.fullName) : 'G'}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-black text-slate-900 truncate leading-tight">{user?.fullName || 'Guest'}</div>
                                    <div className="text-xs font-bold text-slate-400 mt-1 truncate uppercase tracking-widest">MNV: {user?.employeeCode || '---'}</div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Điều hướng hệ thống</p>
                                <nav className="flex flex-col gap-1">
                                    {menuItems.map(item => renderMobileMenuItem(item))}
                                </nav>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:bg-brand-soft hover:border-brand-soft hover:text-brand text-slate-600 font-black text-sm shadow-sm transition-all active:scale-[0.98]"
                            >
                                <LogOut size={18} />
                                Đăng xuất hệ thống
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
