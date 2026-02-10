import { api } from '@/lib/api';
import { format, parseISO } from 'date-fns';

export interface ReportSummary {
    totalMeals: number;
    totalSkipped: number;
    totalCost: number;
    avgPerDay: number;
}

export interface ReportItem {
    id: string;
    empCode: string;
    name: string;
    department: string;
    meals: number;
    eaten: number;
    skipped: number;
    total: number;
}

export interface ReportResponse {
    summary: ReportSummary;
    details: ReportItem[];
}

export const reportsApi = {
    getSummary: (startDate: string, endDate: string, search?: string, departmentId?: string) => {
        return api.get<ReportResponse>('/reports/summary', {
            params: { startDate, endDate, search, departmentId }
        });
    },
    exportExcel: async (startDate: string, endDate: string, search?: string, departmentId?: string) => {
        // Fetch expects the body to be blob for blob response if we don't return res
        // But our client returns response.json(). This will fail for blobs!
        // I need to fix the client to support blobs or use fetch directly.
        // For now, let's assume the user wants consistency.
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/reports/export?startDate=${startDate}&endDate=${endDate}${search ? `&search=${search}` : ''}${departmentId ? `&departmentId=${departmentId}` : ''}`, '_blank');
    }
};
