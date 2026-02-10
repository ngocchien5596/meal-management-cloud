'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui';
import { Guest, MealDetail } from '@/features/meals/api';
import { useAddGuest } from '@/features/meals/hooks';
import toast from 'react-hot-toast';
import { Download, Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface GuestImportExportProps {
    meal: MealDetail;
    id: string; // mealId
}

export function GuestImportExport({ meal, id }: GuestImportExportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const addGuestMutation = useAddGuest();

    // --- EXPORT ---
    const handleExport = () => {
        const guests = meal.guests || [];
        if (guests.length === 0) {
            toast.error('Chưa có khách nào để xuất file.');
            return;
        }

        // Prepare data for Excel
        const data = guests.map((g) => ({
            'Họ và tên': g.fullName,
            'Ghi chú': g.note || '',
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách');

        // Generate filename
        const dateStr = format(new Date(meal.mealDate), 'dd-MM-yyyy');
        const typeStr = meal.mealType === 'LUNCH' ? 'Trua' : 'Toi';
        const fileName = `Khach_${dateStr}_${typeStr}.xlsx`;

        // Write file
        XLSX.writeFile(wb, fileName);
        toast.success('Đã xuất file Excel thành công!');
    };

    // --- IMPORT ---
    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset
            fileInputRef.current.click();
        }
    };

    const processImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    toast.error('File không có dữ liệu');
                    setIsImporting(false);
                    return;
                }

                // Validate and format data
                const guestsToImport: { fullName: string; note?: string }[] = [];

                for (const row of data as any[]) {
                    // Try to find Full Name column (case insensitive or specific key)
                    // We expect 'Họ và tên' from our export, or 'Full Name', or just check keys
                    let fullName = row['Họ và tên'] || row['Full Name'] || row['fullName'] || row['Name'] || row['Tên'];
                    const note = row['Ghi chú'] || row['Note'] || row['note'] || '';

                    if (fullName) {
                        guestsToImport.push({ fullName: String(fullName).trim(), note: String(note).trim() });
                    }
                }

                if (guestsToImport.length === 0) {
                    toast.error('Không tìm thấy cột "Họ và tên" hoặc dữ liệu trống.');
                    setIsImporting(false);
                    return;
                }

                // Execute Loop (Client-side Promise.all or sequential)
                // Sequential to avoid overwhelming server logic if rate limited?
                // Let's do batches of 5 for safety, or just sequential for MVP reliability.

                // Check for duplicates
                const currentGuestNames = new Set((meal.guests || []).map(g => g.fullName.toLowerCase().trim()));
                const uniqueGuestsToImport = guestsToImport.filter(g => !currentGuestNames.has(g.fullName.toLowerCase().trim()));

                const duplicateCount = guestsToImport.length - uniqueGuestsToImport.length;
                if (duplicateCount > 0) {
                    toast(`${duplicateCount} khách trùng tên đã bị bỏ qua.`, { icon: '⚠️' });
                }

                if (uniqueGuestsToImport.length === 0) {
                    toast.success('Tất cả khách trong file đều đã có trong danh sách.');
                    setIsImporting(false);
                    return;
                }

                let successCount = 0;
                const total = uniqueGuestsToImport.length;

                // Using specific toast id to update progress
                const toastId = toast.loading(`Đang nhập 0/${total} khách...`);

                for (let i = 0; i < total; i++) {
                    try {
                        await addGuestMutation.mutateAsync({
                            mealId: id,
                            data: uniqueGuestsToImport[i]
                        });
                        successCount++;
                        if (i % 5 === 0) {
                            toast.loading(`Đang nhập ${i + 1}/${total} khách...`, { id: toastId });
                        }
                    } catch (err) {
                        console.error(`Failed to import guest ${guestsToImport[i].fullName}`, err);
                    }
                }

                toast.success(`Đã nhập thành công ${successCount}/${total} khách!`, { id: toastId });
            } catch (error) {
                console.error('Import error', error);
                toast.error('Lỗi khi đọc file Excel');
            } finally {
                setIsImporting(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={processImport}
                className="hidden"
                accept=".xlsx, .xls"
            />

            <Button
                variant="outline"
                onClick={handleImportClick}
                disabled={isImporting}
                className="gap-2 bg-white border-brand/20 text-brand hover:bg-brand/5 shadow-sm min-w-[110px]"
            >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isImporting ? 'Đang nhập...' : 'Import Excel'}
            </Button>

            <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2 bg-white border-brand/20 text-brand hover:bg-brand/5 shadow-sm"
                title="Xuất danh sách hiện tại ra Excel"
            >
                <Download className="w-4 h-4" />
                Export
            </Button>
        </div>
    );
}
