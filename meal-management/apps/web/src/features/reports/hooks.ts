
import { useQuery } from '@tanstack/react-query';
import { reportsApi, type ReportResponse } from './api';

export const useReportSummary = (startDate: string, endDate: string, search?: string, departmentId?: string) => {
    return useQuery<any, any, ReportResponse>({
        queryKey: ['reports', startDate, endDate, search, departmentId],
        queryFn: async () => {
            console.log('📡 Fetching Reports:', { startDate, endDate, search, departmentId });
            const response = await reportsApi.getSummary(startDate, endDate, search, departmentId);
            return response;
        },
        select: (data: any) => data.data // Flatten the response to { summary, details }
    });
};
