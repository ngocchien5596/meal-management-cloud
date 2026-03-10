import { api } from '@/lib/api';

export interface MealEvent {
    id: string;
    mealDate: string;
    mealType: 'LUNCH' | 'DINNER';
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
    qrToken?: string;
    startedAt?: string;
    endedAt?: string;
    _count?: {
        registrations: number;
        guests: number;
        reviews: number;
    };
    menuItems?: MenuItem[];
    reviews?: MealReview[];
}

export interface MealReview {
    id: string;
    mealEventId: string;
    employeeId: string;
    comment: string;
    images?: any;
    isAnonymous: boolean;
    createdAt: string;
    employee?: {
        fullName: string;
        employeeCode: string;
    };
}

export interface Ingredient {
    id: string;
    catalogId: string;
    catalog: IngredientCatalogItem;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}

export interface IngredientCatalogItem {
    id: string;
    name: string;
    defaultUnit: string;
}

export interface MenuItemCatalogItem {
    id: string;
    name: string;
}

export interface MenuItem {
    id: string;
    catalogId: string;
    catalog: MenuItemCatalogItem;
}

export interface Guest {
    id: string;
    fullName: string;
    note?: string;
    qrToken: string;
}

export interface Registration {
    id: string;
    isCancelled: boolean;
    location?: { id: string, name: string } | null;
    employee: {
        id: string;
        fullName: string;
        employeeCode: string;
        department: { name: string };
        position: { name: string };
    };
}

export interface CheckinLog {
    id: string;
    checkinTime: string;
    method: 'QR_SCAN' | 'MANUAL' | 'SELF_SCAN';
    registration?: {
        location?: { id: string, name: string } | null;
    } | null;
    employee?: {
        fullName: string;
        employeeCode: string;
    };
    guest?: {
        fullName: string;
    };
}

export interface MealDetail extends MealEvent {
    ingredients: Ingredient[];
    menuItems: MenuItem[];
    guests: Guest[];
    registrations: Registration[];
    checkins: CheckinLog[];
    reviews: MealReview[];
}

export const mealsApi = {
    getMeals: (startDate?: string, endDate?: string, search?: string, status?: string) =>
        api.get<MealEvent[]>('/meals', { params: { startDate, endDate, search, status } })
            .then(res => res.data),

    getMealDetail: (id: string) =>
        api.get<MealDetail>(`/meals/${id}`)
            .then(res => res.data),

    getCurrentMeal: () =>
        api.get<MealDetail | null>('/meals/current')
            .then(res => res.data),

    createMeal: (data: { mealDate: string; mealType: 'LUNCH' | 'DINNER' }) =>
        api.post<MealEvent>('/meals', data)
            .then(res => res.data),

    updateMeal: (id: string, data: { mealDate?: string; mealType?: 'LUNCH' | 'DINNER' }) =>
        api.patch<MealEvent>(`/meals/${id}`, data)
            .then(res => res.data),

    startMeal: (id: string) =>
        api.post<MealEvent>(`/meals/${id}/start`)
            .then(res => res.data),

    endMeal: (id: string) =>
        api.post<MealEvent>(`/meals/${id}/end`)
            .then(res => res.data),

    // Ingredients
    addIngredient: (mealId: string, data: Omit<Ingredient, 'id' | 'totalPrice'> & { catalogId?: string }) =>
        api.post<Ingredient>(`/meals/${mealId}/ingredients`, data)
            .then(res => res.data),

    updateIngredient: (id: string, data: Partial<Omit<Ingredient, 'id' | 'totalPrice'> & { catalogId?: string }>) =>
        api.patch<Ingredient>(`/meals/ingredients/${id}`, data)
            .then(res => res.data),

    deleteIngredient: (id: string) =>
        api.delete<{ message: string }>(`/meals/ingredients/${id}`)
            .then(res => res.data),

    // Ingredient Catalog
    getCatalog: (search?: string) =>
        api.get<IngredientCatalogItem[]>('/ingredients/catalog', { params: { search } })
            .then(res => res.data),

    createCatalogItem: (data: Omit<IngredientCatalogItem, 'id'>) =>
        api.post<IngredientCatalogItem>('/ingredients/catalog', data)
            .then(res => res.data),

    updateCatalogItem: (id: string, data: Partial<Omit<IngredientCatalogItem, 'id'>>) =>
        api.patch<IngredientCatalogItem>(`/ingredients/catalog/${id}`, data)
            .then(res => res.data),

    deleteCatalogItem: (id: string) =>
        api.delete<{ message: string }>(`/ingredients/catalog/${id}`)
            .then(res => res.data),

    // Menu Items
    addMenuItem: (mealId: string, name: string, catalogId?: string) =>
        api.post<MenuItem>(`/meals/${mealId}/menu-items`, { name, catalogId })
            .then(res => res.data),

    deleteMenuItem: (id: string) =>
        api.delete<{ message: string }>(`/meals/menu-items/${id}`)
            .then(res => res.data),

    // Menu Item Catalog
    getMenuCatalog: (search?: string) =>
        api.get<MenuItemCatalogItem[]>('/menu-items/catalog', { params: { search } })
            .then(res => res.data),

    createMenuCatalogItem: (data: Omit<MenuItemCatalogItem, 'id'>) =>
        api.post<MenuItemCatalogItem>('/menu-items/catalog', data)
            .then(res => res.data),

    updateMenuCatalogItem: (id: string, data: Partial<Omit<MenuItemCatalogItem, 'id'>>) =>
        api.patch<MenuItemCatalogItem>(`/menu-items/catalog/${id}`, data)
            .then(res => res.data),

    deleteMenuCatalogItem: (id: string) =>
        api.delete<{ message: string }>(`/menu-items/catalog/${id}`)
            .then(res => res.data),

    updateMenuItem: (id: string, mealId: string, catalogId: string) =>
        api.patch<MenuItem>(`/meals/menu-items/${id}`, { catalogId })
            .then(res => res.data),

    // Guests
    addGuest: (mealId: string, data: { fullName: string; note?: string }) =>
        api.post<Guest>(`/meals/${mealId}/guests`, data)
            .then(res => res.data),

    deleteGuest: (id: string) =>
        api.delete<{ message: string }>(`/meals/guests/${id}`)
            .then(res => res.data),

    updateGuest: (id: string, data: { fullName?: string; note?: string }) =>
        api.patch<Guest>(`/meals/guests/${id}`, data)
            .then(res => res.data),

    toggleRegistration: (id: string) =>
        api.post<Registration>(`/meals/registrations/${id}/toggle`)
            .then(res => res.data),
};
