'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useMealDetail, useDeleteGuest, useAddGuest, useUpdateGuest } from '@/features/meals/hooks';
import { MealDetail, Guest } from '@/features/meals/api';
import * as QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { GuestImportExport } from '@/features/meals/components/GuestImportExport';

const PlusIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);

const QrIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
);

interface GuestFormProps {
    mealId: string;
    guest?: Guest;
    onSuccess: () => void;
}

function GuestForm({ mealId, guest, onSuccess }: GuestFormProps) {
    const addMutation = useAddGuest();
    const updateMutation = useUpdateGuest();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get('fullName') as string,
            note: formData.get('note') as string,
        };

        if (guest) {
            await updateMutation.mutateAsync({ id: guest.id, mealId, data });
        } else {
            await addMutation.mutateAsync({ mealId, data });
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Họ và tên khách</label>
                <Input
                    name="fullName"
                    placeholder="Ví dụ: Nguyễn Văn A..."
                    defaultValue={guest?.fullName}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">Ghi chú</label>
                <Input
                    name="note"
                    placeholder="Ví dụ: Khách hàng dự án..."
                    defaultValue={guest?.note}
                />
            </div>
            <Button
                type="submit"
                size="lg"
                className="w-full shadow-xl shadow-blue-200 uppercase"
                disabled={addMutation.isPending || updateMutation.isPending}
            >
                {addMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : (guest ? 'Cập nhật khách mời' : 'Đăng ký khách mời')}
            </Button>
        </form>
    );
}

export default function GuestsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { data: response, isLoading } = useMealDetail(id);
    const meal = response as MealDetail | undefined;
    const deleteMutation = useDeleteGuest();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate({ id: deleteId, mealId: id });
            setDeleteId(null);
        }
    };

    // QR Modal State
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isGeneratingQr, setIsGeneratingQr] = useState(false);

    const guests = meal?.guests || [];

    const handleOpenQr = async (guest: Guest) => {
        setSelectedGuest(guest);
        setIsQrModalOpen(true);
        setIsGeneratingQr(true);
        try {
            const qrData = JSON.stringify({
                id: guest.id,
                name: guest.fullName,
                token: guest.qrToken,
                type: 'GUEST'
            });
            const url = await QRCode.toDataURL(qrData, {
                width: 400,
                margin: 2,
                color: { dark: '#1e73d8', light: '#ffffff' }
            });
            setQrCodeUrl(url);
        } catch (err) {
            console.error('QR Generation failed', err);
            toast.error('Không thể tạo mã QR');
        } finally {
            setIsGeneratingQr(false);
        }
    };

    const handleDownloadQr = () => {
        if (!qrCodeUrl || !selectedGuest) return;
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `QR-GUEST-${selectedGuest.fullName.replace(/\s+/g, '-').toUpperCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Đã tải mã QR!');
    };

    const handleOpenEdit = (guest: Guest) => {
        setEditingGuest(guest);
        setIsEditModalOpen(true);
    };

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Khách mời đặc biệt</h3>
                    <p className="text-[15px] text-gray-500 mt-1">Tổng cộng {guests.length} khách đăng ký suất ăn này</p>
                </div>
                {meal?.status !== 'COMPLETED' && (
                    <div className="flex items-center gap-3">
                        {meal && <GuestImportExport meal={meal} id={id} />}
                        <CreateButton onClick={() => setIsAddModalOpen(true)}>
                            THÊM KHÁCH MỜI
                        </CreateButton>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider w-20 text-center">STT</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Họ và tên</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider">Ghi chú</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">QR Token</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {guests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-500 italic text-[15px]">
                                    Chưa có khách mời nào được đăng ký.
                                </td>
                            </tr>
                        ) : (
                            guests.map((guest: Guest, idx: number) => (
                                <tr key={guest.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group">
                                    <td className="py-4 px-6 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-[15px] font-medium text-gray-900 uppercase tracking-tight">
                                        {guest.fullName}
                                    </td>
                                    <td className="py-4 px-6 text-[15px] text-gray-500 italic">
                                        {guest.note || 'Không có ghi chú'}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button
                                            onClick={() => handleOpenQr(guest)}
                                            className="w-10 h-10 inline-flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-500/10 active:scale-95"
                                            title="Xem mã QR"
                                        >
                                            <QrIcon />
                                        </button>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-3">
                                            {meal?.status !== 'COMPLETED' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenEdit(guest)}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                                                        title="Sửa"
                                                    >
                                                        <EditIcon />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(guest.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                        title="Xóa"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Đã khóa</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Đăng ký khách mời mới"
            >
                <GuestForm mealId={id} onSuccess={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Cập nhật thông tin khách"
            >
                {editingGuest && (
                    <GuestForm
                        mealId={id}
                        guest={editingGuest}
                        onSuccess={() => setIsEditModalOpen(false)}
                    />
                )}
            </Modal>

            {/* QR Modal */}
            <Modal
                isOpen={isQrModalOpen}
                onClose={() => {
                    setIsQrModalOpen(false);
                    setQrCodeUrl('');
                }}
                title="Mã QR Khách mời"
            >
                <div className="flex flex-col items-center py-4">
                    <div className="w-[280px] h-[280px] bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-4 relative mb-6">
                        {isGeneratingQr ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-xs font-bold text-gray-400">ĐANG TẠO MÃ...</p>
                            </div>
                        ) : (
                            qrCodeUrl && (
                                <img
                                    src={qrCodeUrl}
                                    alt="Guest QR"
                                    className="w-full h-full object-contain animate-in fade-in zoom-in duration-300"
                                />
                            )
                        )}
                    </div>

                    <div className="text-center mb-8">
                        <h4 className="text-xl font-bold text-gray-900 uppercase tracking-tight mb-1">
                            {selectedGuest?.fullName}
                        </h4>
                        <p className="text-sm font-medium text-gray-400 italic">
                            {selectedGuest?.note || 'Không có ghi chú'}
                        </p>
                    </div>

                    <Button
                        onClick={handleDownloadQr}
                        className="w-full flex items-center justify-center gap-2 h-12 shadow-lg shadow-blue-100"
                        disabled={!qrCodeUrl}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        TẢI XUỐNG MÃ QR
                    </Button>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
                title="Xác nhận xóa khách mời"
                description="Bạn có chắc chắn muốn xóa khách mời này không? Mọi thông tin check-in liên quan (nếu có) sẽ bị ảnh hưởng."
                type="danger"
            />
        </div>
    );
}
