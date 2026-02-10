export type CheckInStatus = 'SUCCESS' | 'ALREADY_CHECKED' | 'NOT_REGISTERED' | 'INVALID_TIME';

export interface CheckInRequest {
    employeeCode: string;
    mealType: 'LUNCH' | 'DINNER';
}

export interface CheckInResponse {
    status: CheckInStatus;
    message: string;
    employee?: {
        fullName: string;
        department: string;
    };
    checkinTime?: string;
}

export interface CheckInRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    mealType: 'LUNCH' | 'DINNER';
    checkinTime: string;
    date: string;
}
