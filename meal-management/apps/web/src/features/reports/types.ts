export type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'DEPARTMENT';

export interface ReportFilter {
    type: ReportType;
    startDate: string;
    endDate: string;
    departmentId?: string;
}

export interface DailyReport {
    date: string;
    lunchRegistered: number;
    lunchCheckedIn: number;
    dinnerRegistered: number;
    dinnerCheckedIn: number;
    totalCost: number;
}

export interface DepartmentSummary {
    departmentId: string;
    departmentName: string;
    totalMeals: number;
    totalCost: number;
    employeeCount: number;
}

export interface MonthlyReport {
    year: number;
    month: number;
    dailyReports: DailyReport[];
    departmentSummaries: DepartmentSummary[];
    totalMeals: number;
    totalCost: number;
}
