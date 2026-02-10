import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealsApi } from './api';

export const useMeals = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['meals', startDate, endDate],
        queryFn: () => mealsApi.getMeals(startDate, endDate),
    });
};

export const useCreateMeal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { mealDate: string; mealType: 'LUNCH' | 'DINNER' }) => mealsApi.createMeal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
};

export const useUpdateMeal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { mealDate?: string; mealType?: 'LUNCH' | 'DINNER' } }) => mealsApi.updateMeal(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', id] });
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
};

export const useMealDetail = (id: string, options?: any) => {
    return useQuery({
        queryKey: ['meal', id],
        queryFn: () => mealsApi.getMealDetail(id),
        enabled: !!id,
        ...options
    });
};

export const useCurrentMeal = (options?: any) => {
    return useQuery({
        queryKey: ['meal', 'current'],
        queryFn: () => mealsApi.getCurrentMeal(),
        ...options
    });
};

export const useStartMeal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mealsApi.startMeal(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['meal', id] });
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
};

export const useEndMeal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mealsApi.endMeal(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['meal', id] });
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
};

// Ingredients
export const useAddIngredient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ mealId, data }: { mealId: string; data: any }) => mealsApi.addIngredient(mealId, data),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

export const useUpdateIngredient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, mealId, data }: { id: string; mealId: string; data: any }) => mealsApi.updateIngredient(id, data),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

export const useDeleteIngredient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, mealId }: { id: string; mealId: string }) => mealsApi.deleteIngredient(id),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

// Menu Items
export const useAddMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ mealId, name }: { mealId: string; name: string }) => mealsApi.addMenuItem(mealId, name),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

export const useDeleteMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, mealId }: { id: string; mealId: string }) => mealsApi.deleteMenuItem(id),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

// Guests
export const useAddGuest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ mealId, data }: { mealId: string; data: any }) => mealsApi.addGuest(mealId, data),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

export const useDeleteGuest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, mealId }: { id: string; mealId: string }) => mealsApi.deleteGuest(id),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

export const useUpdateGuest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, mealId, data }: { id: string; mealId: string; data: any }) => mealsApi.updateGuest(id, data),
        onSuccess: (_, { mealId }) => {
            queryClient.invalidateQueries({ queryKey: ['meal', mealId] });
        },
    });
};

export const useToggleRegistration = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: string }) => mealsApi.toggleRegistration(id),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['meal'] }); // Invalidate specific meal detail
            queryClient.invalidateQueries({ queryKey: ['registrations'] }); // Invalidate global calendar/summaries
        },
    });
};
