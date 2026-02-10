'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from './api';
import type { MealType, RegisterMealRequest } from './types';

export function useCalendar(year: number, month: number) {
    return useQuery({
        queryKey: ['calendar', year, month],
        queryFn: () => calendarApi.getCalendar(year, month),
    });
}

export function useRegistrations(year: number, month: number) {
    return useQuery({
        queryKey: ['registrations', year, month],
        queryFn: () => calendarApi.getRegistrations(year, month),
    });
}

export function useRegisterMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterMealRequest) => calendarApi.registerMeal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
        },
    });
}

export function useCancelMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (registrationId: string) => calendarApi.cancelMeal(registrationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
        },
    });
}

export function useQuickRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ startDate, endDate, mealTypes }: { startDate: string; endDate: string; mealTypes: MealType[] }) =>
            calendarApi.quickRegister(startDate, endDate, mealTypes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            queryClient.invalidateQueries({ queryKey: ['registrations'] });
        },
    });
}
