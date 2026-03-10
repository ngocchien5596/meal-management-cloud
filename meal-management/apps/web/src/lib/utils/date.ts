import { format, parseISO, isToday, isBefore, isAfter, startOfDay, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

let serverOffset = 0; // in milliseconds

export const setServerTimeOffset = (serverTimeStr: string) => {
    const serverDate = new Date(serverTimeStr);
    const clientDate = new Date();
    serverOffset = serverDate.getTime() - clientDate.getTime();
};

export const getServerDate = () => {
    return new Date(Date.now() + serverOffset);
};

export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy') => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, formatStr, { locale: vi });
};

export const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm', { locale: vi });
};

export const formatDateTime = (date: Date | string) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm dd/MM/yyyy', { locale: vi });
};

export const isDateAvailable = (mealDate: Date, now: Date, cutoffTime: string | number = 16): boolean => {
    // 1. Get Vietnam Time parts reliably from the provided "now" date
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const vn: any = {};
    parts.forEach(p => { if (p.type !== 'literal') vn[p.type] = parseInt(p.value, 10); });

    // 2. Reconstruct dates in Vietnam context
    const nowVN = new Date(vn.year, vn.month - 1, vn.day, vn.hour, vn.minute, vn.second);
    const today = new Date(vn.year, vn.month - 1, vn.day);

    // 3. Normalize targetDate to 00:00 (of the target date)
    const targetDate = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());

    // 4. Difference in days
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return false; // Past or today: cannot modify
    if (diffDays === 1) {
        // Target is tomorrow: can only modify if before cutoffTime today (in VN time)
        let cutoffHour = 16;
        let cutoffMinute = 0;

        if (typeof cutoffTime === 'string' && cutoffTime.includes(':')) {
            const timeParts = cutoffTime.split(':');
            cutoffHour = parseInt(timeParts[0], 10);
            cutoffMinute = parseInt(timeParts[1], 10);
            if (isNaN(cutoffHour)) cutoffHour = 16;
            if (isNaN(cutoffMinute)) cutoffMinute = 0;
        } else {
            cutoffHour = typeof cutoffTime === 'number' ? cutoffTime : parseInt(cutoffTime as string, 10);
            if (isNaN(cutoffHour)) cutoffHour = 16;
        }

        const currentHour = nowVN.getHours();
        const currentMinute = nowVN.getMinutes();

        if (currentHour < cutoffHour) return true;
        if (currentHour === cutoffHour) return currentMinute < cutoffMinute;
        return false;
    }
    return true; // Further in the future: can modify
};

export const getMonthName = (month: number): string => {
    const months = [
        'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04',
        'Tháng 05', 'Tháng 06', 'Tháng 07', 'Tháng 08',
        'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[month];
};

export { isToday, isBefore, isAfter, startOfDay, addDays };
