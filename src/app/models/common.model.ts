/**
 * Modelos comunes y utilitarios
 */

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
    success: boolean;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    [key: string]: any;
}

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface ToastMessage {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
}
