export interface Account {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string | null;
    department: string;
    position: string;
    role: string | null;
    isActive: boolean;
    hasAccount: boolean;
    createdAt: string;
}

export interface CreateAccountRequest {
    employeeCode: string;
    fullName: string;
    email?: string;
    departmentId: string;
    positionId: string;
    role?: string;
    password?: string;
}

export type UpdateAccountRequest = Partial<CreateAccountRequest> & {
    isActive?: boolean;
};
