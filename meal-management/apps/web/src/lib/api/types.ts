export interface APIResponse<T> {
    success: boolean;
    data: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface APIError {
    code: string;
    message: string;
    status: number;
}
