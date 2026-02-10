export interface SystemConfig {
    [key: string]: string;
}

export interface RegistrationPreset {
    id: string;
    name: string;
    mealType: string;
    weekdays: string;
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
