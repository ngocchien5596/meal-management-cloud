'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

// --- Icons (Inline SVG) ---
const ForkIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M18 6V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v4" />
        <path d="M6 6V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4" />
        <path d="M10 8v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8" />
        <path d="M14 8v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8" />
    </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const PackageIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
);

// --- Mock Data ---
const TODAY_MENU = {
    lunch: [
        'Cơm trắng tấm xoan',
        'Sườn non kho tộ',
        'Canh bí đỏ thịt bằm',
        'Rau muống xào tỏi',
        'Tráng miệng: Dưa hấu'
    ],
    dinner: [
        'Cơm chiên dương châu',
        'Gà chiên mắm',
        'Canh cải ngọt nấu tôm',
        'Salad trộn dầu giấm',
        'Tráng miệng: Chuối cau'
    ]
};

const TOMORROW_MENU = {
    lunch: [
        'Phở bò truyền thống',
        'Quẩy giòn',
        'Rau sống tổng hợp',
        'Tráng miệng: Chè hạt sen'
    ],
    dinner: [
        'Bún chả Hà Nội',
        'Nem rán',
        'Canh chua cá lóc',
        'Tráng miệng: Thanh long'
    ]
};

const CHECKIN_HISTORY = [
    { name: 'Nguyễn Văn An', code: 'NV0923', time: '11:28:10', late: false },
    { name: 'Trần Thị Bình', code: 'NV1104', time: '11:27:55', late: true },
    { name: 'Lê Hoàng Cường', code: 'NV0455', time: '11:25:30', late: false },
    { name: 'Phạm Minh Đức', code: 'NV0789', time: '11:24:12', late: false },
];

const INGREDIENTS = {
    left: [
        { name: 'Thịt heo tươi (CP)', qty: '45 Kg', price: '120,000', total: '5,400,000' },
        { name: 'Gạo Tấm xoan', qty: '100 Kg', price: '18,500', total: '1,850,000' },
        { name: 'Gia vị tổng hợp', qty: '5 Kg', price: '40,000', total: '200,000' },
    ],
    right: [
        { name: 'Rau củ Đà Lạt', qty: '30 Kg', price: '25,000', total: '750,000' },
        { name: 'Dầu ăn tinh luyện', qty: '10 Lit', price: '35,000', total: '350,000' },
        { name: 'Trái cây tráng miệng', qty: '20 Kg', price: '22,500', total: '450,000' },
    ]
};

export function CanteenInfoBoard() {
    const [time, setTime] = useState('10:30:45');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            setTime(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#f2f3f5] p-[16px] font-sans text-slate-900 overflow-hidden flex flex-col items-center">
            {/* Main Board Container */}
            <div className="w-full max-w-[1160px] bg-white rounded-[12px] shadow-2xl border border-gray-200 overflow-hidden flex flex-col">

                {/* TOP HEADER BAR */}
                <div className="h-[70px] border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#E61E23] rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-100">
                            <ForkIcon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black tracking-tight text-[#E61E23] uppercase leading-none">BẢNG THÔNG TIN NHÀ ĂN</h1>
                            <div className="mt-1.5 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-red-50 text-[#E61E23] text-[10px] font-black rounded uppercase tracking-wider border border-red-100">BỮA TRƯA / BỮA TỐI</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">HÔM NAY</p>
                            <p className="text-sm font-black text-slate-800">Thứ Sáu, 24/05/2024</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">CA LÀM VIỆC</p>
                            <p className="text-sm font-black text-slate-800 tracking-tight">Hành chính</p>
                        </div>
                        <div className="w-[180px] h-[44px] bg-[#E61E23] rounded-[10px] flex items-center justify-center shadow-lg shadow-red-200">
                            <span className="text-xl font-black text-white tracking-widest tabular-nums">{time}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="p-5 grid grid-cols-12 gap-5 flex-1">

                    {/* LEFT COLUMN: MENUS */}
                    <div className="col-span-8 flex flex-col gap-5">
                        {/* Card 1: THỰC ĐƠN HÔM NAY */}
                        <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center gap-2.5">
                                <CalendarIcon className="w-5 h-5 text-[#E61E23]" />
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">THỰC ĐƠN HÔM NAY</h2>
                            </div>
                            <div className="flex divide-x divide-gray-100 min-h-[160px]">
                                <div className="flex-1 p-4">
                                    <h3 className="text-xs font-black text-[#2563EB] mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                                        BỮA TRƯA
                                    </h3>
                                    <ul className="space-y-2">
                                        {TODAY_MENU.lunch.map((item, i) => (
                                            <li key={i} className="text-[13px] font-semibold text-slate-600 flex items-start gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex-1 p-4">
                                    <h3 className="text-xs font-black text-[#2563EB] mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                                        BỮA TỐI
                                    </h3>
                                    <ul className="space-y-2">
                                        {TODAY_MENU.dinner.map((item, i) => (
                                            <li key={i} className="text-[13px] font-semibold text-slate-600 flex items-start gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: THỰC ĐƠN NGÀY MAI */}
                        <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center gap-2.5">
                                <CalendarIcon className="w-5 h-5 text-orange-500" />
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">THỰC ĐƠN NGÀY MAI</h2>
                            </div>
                            <div className="flex divide-x divide-gray-100 min-h-[160px] flex-1">
                                <div className="flex-1 p-4">
                                    <h3 className="text-xs font-black text-[#2563EB] mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                                        BỮA TRƯA
                                    </h3>
                                    <ul className="space-y-2">
                                        {TOMORROW_MENU.lunch.map((item, i) => (
                                            <li key={i} className="text-[13px] font-semibold text-slate-600 flex items-start gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex-1 p-4">
                                    <h3 className="text-xs font-black text-[#2563EB] mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                                        BỮA TỐI
                                    </h3>
                                    <ul className="space-y-2">
                                        {TOMORROW_MENU.dinner.map((item, i) => (
                                            <li key={i} className="text-[13px] font-semibold text-slate-600 flex items-start gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STATS & HISTORY */}
                    <div className="col-span-4 flex flex-col gap-5">
                        {/* Card: TÌNH HÌNH CHECK-IN */}
                        <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm p-4 flex flex-col">
                            <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest mb-3">TÌNH HÌNH CHECK-IN</p>
                            <div className="flex items-end justify-between mb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-[#E61E23] leading-none">145</span>
                                    <span className="text-lg font-bold text-gray-400">/200</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-emerald-500 block leading-none">72.5%</span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">HOÀN THÀNH</span>
                                </div>
                            </div>
                            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-gray-100">
                                <div className="h-full bg-[#E61E23] rounded-full shadow-[0_0_8px_rgba(230,30,35,0.3)] transition-all duration-1000" style={{ width: '72.5%' }} />
                            </div>
                        </div>

                        {/* Card: LỊCH SỬ CHECK-IN */}
                        <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <UsersIcon className="w-5 h-5 text-[#E61E23]" />
                                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">LỊCH SỬ CHECK-IN</h2>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-wider">
                                            <th className="px-4 py-3">HỌ TÊN</th>
                                            <th className="px-4 py-3 text-center">MÃ NV</th>
                                            <th className="px-4 py-3 text-right">GIỜ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {CHECKIN_HISTORY.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-[12px] font-bold text-slate-700">{row.name}</td>
                                                <td className="px-4 py-3 text-[12px] font-bold text-slate-500 text-center tracking-tight">{row.code}</td>
                                                <td className={cn(
                                                    "px-4 py-3 text-[12px] font-black tracking-widest text-right tabular-nums",
                                                    row.late ? "text-[#E61E23]" : "text-slate-900"
                                                )}>{row.time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: INGREDIENTS */}
                    <div className="col-span-12">
                        <div className="bg-white rounded-[10px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center gap-2.5">
                                <PackageIcon className="w-5 h-5 text-[#E61E23]" />
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">NGUYÊN LIỆU</h2>
                            </div>
                            <div className="p-4 flex gap-8">
                                {/* Split Table - Left Half */}
                                <div className="flex-1">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-50">
                                                <th className="pb-2 px-1">TÊN NVL</th>
                                                <th className="pb-2 text-center">SỐ LƯỢNG</th>
                                                <th className="pb-2 text-right">ĐƠN GIÁ</th>
                                                <th className="pb-2 text-right">THÀNH TIỀN</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {INGREDIENTS.left.map((row, i) => (
                                                <tr key={i}>
                                                    <td className="py-2.5 px-1 text-[12px] font-bold text-slate-700">{row.name}</td>
                                                    <td className="py-2.5 text-center text-[12px] font-bold text-slate-500">{row.qty}</td>
                                                    <td className="py-2.5 text-right text-[12px] font-bold text-slate-500">{row.price}</td>
                                                    <td className="py-2.5 text-right text-[12px] font-black text-slate-800">{row.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Divider */}
                                <div className="w-px bg-gray-100" />
                                {/* Split Table - Right Half */}
                                <div className="flex-1">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-wider border-b border-gray-50">
                                                <th className="pb-2 px-1">TÊN NVL</th>
                                                <th className="pb-2 text-center">SỐ LƯỢNG</th>
                                                <th className="pb-2 text-right">ĐƠN GIÁ</th>
                                                <th className="pb-2 text-right">THÀNH TIỀN</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {INGREDIENTS.right.map((row, i) => (
                                                <tr key={i}>
                                                    <td className="py-2.5 px-1 text-[12px] font-bold text-slate-700">{row.name}</td>
                                                    <td className="py-2.5 text-center text-[12px] font-bold text-slate-500">{row.qty}</td>
                                                    <td className="py-2.5 text-right text-[12px] font-bold text-slate-500">{row.price}</td>
                                                    <td className="py-2.5 text-right text-[12px] font-black text-slate-800">{row.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Total Line */}
                            <div className="px-6 py-3 bg-slate-50 border-t border-gray-100 flex justify-end items-center gap-4">
                                <span className="text-[11px] font-black text-[#E61E23] uppercase tracking-widest">TỔNG CỘNG</span>
                                <span className="text-2xl font-black text-[#E61E23] tracking-tight">9,000,000 VND</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ANNOUNCEMENT BAR */}
                <div className="h-[40px] bg-slate-50 flex items-center border-t border-gray-100 shrink-0">
                    <div className="h-full px-4 flex items-center bg-gray-900 border-r border-gray-800">
                        <span className="text-[10px] font-black text-white tracking-[0.2em]">THÔNGBÁO</span>
                    </div>
                    <div className="flex-1 h-full bg-[#E61E23] flex items-center justify-center relative overflow-hidden group">
                        {/* Animated overlay feel */}
                        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                        <span className="text-[13px] font-black text-white tracking-wide relative z-10">Kính mời cán bộ công nhân viên thực hiện check-in đúng giờ. Nh</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
