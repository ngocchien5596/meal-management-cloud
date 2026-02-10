'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';
import { useApplyPreset } from '@/features/registrations/hooks';

const PRESETS = [
    { id: '0', name: 'Hủy tất cả đăng ký', desc: 'Hủy đăng ký tất cả các ngày trong tháng', icon: '🗑️' },
    { id: '1', name: 'Hành chính – Trưa', desc: 'Đăng ký bữa trưa từ Thứ 2 đến Thứ 6', icon: '🍚' },
    { id: '2', name: 'Hành chính – Trưa+Tối', desc: 'Đăng ký cả ngày từ Thứ 2 đến Thứ 6', icon: '🍲' },
    { id: '3', name: 'Full tháng – Trưa', desc: 'Đăng ký bữa trưa tất cả các ngày', icon: '🌟' },
    { id: '4', name: 'Full tháng – Trưa+Tối', desc: 'Đăng ký cả ngày tất cả các ngày', icon: '🔥' },
];

interface QuickRegisterModalProps {
    year: number;
    month: number;
    isOpen: boolean;
    onClose: () => void;
}

export const QuickRegisterModal = ({ year, month, isOpen, onClose }: QuickRegisterModalProps) => {
    const applyPreset = useApplyPreset();

    const handleApply = async (presetId: string) => {
        try {
            await applyPreset.mutateAsync({ presetId, year, month });
            onClose();
        } catch (err) {
            // Error handled by hook toast
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[480px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-[32px] overflow-hidden">

                    <div className="px-8 pt-8 pb-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <Dialog.Title className="text-xl font-black text-slate-900 leading-tight">
                                Đăng ký nhanh
                            </Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-slate-500 font-medium italic">
                                Chọn mẫu đăng ký cho tháng {month + 1}/{year}
                            </Dialog.Description>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white transition-colors text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 grid gap-3">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handleApply(preset.id)}
                                disabled={applyPreset.isPending}
                                className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left active:scale-[0.99] disabled:opacity-50"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-2xl shadow-sm">
                                    {preset.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-900">{preset.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 font-medium">{preset.desc}</div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-surface-2 group-hover:bg-state-info flex items-center justify-center transition-colors">
                                    <div className="w-1.5 h-1.5 bg-vttext-muted group-hover:bg-white rounded-full" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Hủy bỏ</Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
