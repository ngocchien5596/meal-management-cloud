export type MealType = 'LUNCH' | 'DINNER';
export type MealState = 'eaten' | 'skipped' | 'missed' | 'registered' | 'available' | null;

export interface MealRegistration {
    id: string;
    date: string;
    mealType: MealType;
    status: 'REGISTERED' | 'CHECKED_IN' | 'SKIPPED';
    employeeId: string;
    createdAt: string;
    updatedAt: string;
}

export interface DayData {
    day: number;
    date: Date;
    disabled?: boolean;
    prevMonth?: boolean;
    nextMonth?: boolean;
    lunch: MealState;
    dinner: MealState;
}

export interface CalendarKPI {
    totalEaten: number;
    totalSkipped: number;
    totalCost: number;
}

export interface CalendarMonth {
    year: number;
    month: number;
    days: DayData[];
    kpi: CalendarKPI;
}

export interface RegisterMealRequest {
    date: string;
    mealType: MealType;
}

export interface CancelMealRequest {
    registrationId: string;
}
