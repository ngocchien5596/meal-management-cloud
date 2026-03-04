'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />
            <div className={cn(
                "relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[calc(100vh-2rem)]",
                className
            )}>
                <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
