import { api } from '@/lib/api';
import { format, parseISO } from 'date-fns';

export interface ReportSummary {
    totalMeals: number;
    totalEaten: number;
    totalSkipped: number;
    totalCost: number;
    attendanceRate: number;
    wasteCost: number;
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

export interface CostsResponse {
    summary: {
        totalCost: number;
        avgCostPerMeal: number;
        totalMeals: number;
        topIngredient: string;
    };
    data: any[];
}

export interface ReviewsResponse {
    summary: {
        totalReviews: number;
        avgRating: number;
        withImages: number;
        anonymousCount: number;
        responseRate: number;
    };
    data: any[];
}

export const reportsApi = {
    getSummary: (startDate: string, endDate: string, search?: string, departmentId?: string) => {
        return api.get<ReportResponse>('/reports/summary', {
            params: { startDate, endDate, search, departmentId }
        });
    },
    getCosts: (startDate: string, endDate: string) => {
        return api.get<CostsResponse>('/reports/costs', {
            params: { startDate, endDate }
        });
    },
    exportCosts: async (startDate: string, endDate: string) => {
        const blob = await api.get<any>('/reports/costs/export', {
            params: { startDate, endDate },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(blob as unknown as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bao-cao-chi-phi-${startDate}-${endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },
    getReviews: (startDate: string, endDate: string) => {
        return api.get<ReviewsResponse>('/reports/reviews', {
            params: { startDate, endDate }
        });
    },
    exportReviews: async (startDate: string, endDate: string) => {
        const blob = await api.get<any>('/reports/reviews/export', {
            params: { startDate, endDate },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(blob as unknown as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bao-cao-danh-gia-${startDate}-${endDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    },
    exportExcel: async (startDate: string, endDate: string, search?: string, departmentId?: string) => {
        const blob = await api.get<any>('/reports/export', {
            params: { startDate, endDate, search, departmentId },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(blob as unknown as Blob);
        const a = document.createElement('a');
        a.href = url;
        const dStart = startDate.split('-').reverse().join('-');
        const dEnd = endDate.split('-').reverse().join('-');
        a.download = `Bao-cao-suat-an-${dStart}-${dEnd}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }
};
