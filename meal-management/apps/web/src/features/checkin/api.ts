import { api } from '@/lib/api';

export interface CheckinLog {
    id: string;
    mealEventId: string;
    employeeId?: string;
    guestId?: string;
    checkinTime: string;
    method: 'QR_SCAN' | 'MANUAL' | 'SELF_SCAN';
    employee?: {
        fullName: string;
        employeeCode: string;
    };
    guest?: {
        fullName: string;
    };
}

export const checkinApi = {
    manualCheckin: (data: { mealEventId: string; employeeCode: string; secretCode: string }) =>
        api.post<CheckinLog>('/checkin/manual', data),

    scanEmployee: (data: { mealEventId: string; employeeId: string }) =>
        api.post<CheckinLog>('/checkin/scan-employee', data),

    scanGuest: (data: { mealEventId: string; guestId: string }) =>
        api.post<CheckinLog>('/checkin/scan-guest', data),

    selfScan: (data: { qrToken: string }) =>
        api.post<CheckinLog & { meal?: { mealType: string; mealDate: string } }>('/checkin/self-scan', data),
};
