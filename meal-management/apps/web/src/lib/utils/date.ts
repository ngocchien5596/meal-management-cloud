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

export const isDateAvailable = (date: Date, cutoffHour: number = 16): boolean => {
    const now = getServerDate();
    const today = startOfDay(now);
    const checkDate = startOfDay(date);

    if (isBefore(checkDate, today)) return false;
    if (checkDate.getTime() === today.getTime() && now.getHours() >= cutoffHour) return false;
    return true;
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
