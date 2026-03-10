import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { mealsApi, MealDetail } from './api';

export const useMeals = (startDate?: string, endDate?: string, search?: string, status?: string) => {
    return useQuery({
        queryKey: ['meals', startDate, endDate, search, status],
        queryFn: () => mealsApi.getMeals(startDate, endDate, search, status),
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
    return useQuery<MealDetail>({
        queryKey: ['meal', id],
        queryFn: () => mealsApi.getMealDetail(id),
        enabled: !!id,
        ...options
    });
};

export const useCurrentMeal = (options?: any) => {
    return useQuery<MealDetail | null>({
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
        mutationFn: ({ mealId, name, catalogId }: { mealId: string; name: string; catalogId?: string }) => mealsApi.addMenuItem(mealId, name, catalogId),
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

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, mealId, catalogId }: { id: string; mealId: string; catalogId: string }) => mealsApi.updateMenuItem(id, mealId, catalogId),
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

// Ingredient Catalog
export const useCatalog = (search?: string) => {
    return useQuery({
        queryKey: ['ingredient-catalog', search],
        queryFn: () => mealsApi.getCatalog(search),
    });
};

export const useCreateCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => mealsApi.createCatalogItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredient-catalog'] });
        },
    });
};

export const useUpdateCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => mealsApi.updateCatalogItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredient-catalog'] });
        },
    });
};

export const useDeleteCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mealsApi.deleteCatalogItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredient-catalog'] });
        },
    });
};

// Menu Item Catalog
export const useMenuCatalog = (search?: string) => {
    return useQuery({
        queryKey: ['menu-catalog', search],
        queryFn: () => mealsApi.getMenuCatalog(search),
    });
};

export const useCreateMenuCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => mealsApi.createMenuCatalogItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-catalog'] });
        },
    });
};

export const useUpdateMenuCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => mealsApi.updateMenuCatalogItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-catalog'] });
        },
    });
};

export const useDeleteMenuCatalogItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => mealsApi.deleteMenuCatalogItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-catalog'] });
        },
    });
};

export const useMealSocket = (mealEventId: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!mealEventId) return;

        const url = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:6000';
        const socket = io(url);

        socket.on('connect', () => {
            socket.emit('join-meal', mealEventId);
        });

        socket.on('new-checkin', (checkin) => {
            // Invalidate both specific meal detail and the generic 'current' meal queries
            queryClient.invalidateQueries({ queryKey: ['meal', mealEventId] });
            queryClient.invalidateQueries({ queryKey: ['meal', 'current'] });
        });

        return () => {
            socket.emit('leave-meal', mealEventId);
            socket.disconnect();
        };
    }, [mealEventId, queryClient]);
};
