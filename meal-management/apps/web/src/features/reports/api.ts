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
    getCosts: (startDate: string, endDate: string) => {
        return api.get<any[]>('/reports/costs', {
            params: { startDate, endDate }
        });
    },
    exportCosts: (startDate: string, endDate: string) => {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/reports/costs/export?startDate=${startDate}&endDate=${endDate}&token=${localStorage.getItem('token')}`;
        window.open(url, '_blank');
    },
    getReviews: (startDate: string, endDate: string) => {
        return api.get<any[]>('/reports/reviews', {
            params: { startDate, endDate }
        });
    },
    exportReviews: (startDate: string, endDate: string) => {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/reports/reviews/export?startDate=${startDate}&endDate=${endDate}&token=${localStorage.getItem('token')}`;
        window.open(url, '_blank');
    },
    exportExcel: (startDate: string, endDate: string, search?: string, departmentId?: string) => {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/reports/summary/export?startDate=${startDate}&endDate=${endDate}&token=${localStorage.getItem('token')}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (departmentId) url += `&departmentId=${departmentId}`;
        window.open(url, '_blank');
    }
};
