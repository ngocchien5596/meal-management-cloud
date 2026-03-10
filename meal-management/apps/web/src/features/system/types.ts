export interface SystemConfig {
    [key: string]: string;
}

export interface RegistrationPreset {
    id: string;
    name: string;
    description: string;
    presetType: string;
    mealType: 'LUNCH' | 'DINNER' | 'BOTH';
    locationId?: string | null;
    location?: {
        id: string;
        name: string;
    } | null;
}

export interface Department {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Position {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateConfigRequest {
    value: string;
}

export interface MealPriceConfig {
    id: string;
    price: number;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface MealLocation {
    id: string;
    name: string;
    isDefault: boolean;
}
