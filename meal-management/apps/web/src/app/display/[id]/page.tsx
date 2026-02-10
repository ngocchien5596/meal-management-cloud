'use client';

import React from 'react';
import { addDays, format } from 'date-fns';
import { useMealDetail, useMeals } from '@/features/meals/hooks';
import { CanteenBoardContent } from '@/features/canteen/components/CanteenBoardContent';
import { MealDetail, MealEvent } from '@/features/meals/api';

/**
 * Standalone Canteen Display Page
 * Provides a full-screen, pixel-perfect dashboard without the application's header or sidebar.
 * This is intended for TV display screens.
 */
export default function StandaloneDisplayPage({ params }: { params: { id: string } }) {
    const { id } = params;

    // Fetch current meal details
    const { data: currentMeal, isLoading: isMealLoading } = useMealDetail(id, {
        refetchInterval: 5000, // Refresh every 5s for real-time status
    }) as { data: MealDetail | undefined, isLoading: boolean };

    // Fetch all meals for today and tomorrow based on the current meal's date
    const mealDate = currentMeal?.mealDate;
    const todayStr = mealDate ? format(new Date(mealDate), 'yyyy-MM-dd') : undefined;
    const tomorrowStr = mealDate ? format(addDays(new Date(mealDate), 1), 'yyyy-MM-dd') : undefined;

    const { data: todayMeals, isLoading: isTodayLoading } = useMeals(todayStr, todayStr) as { data: MealEvent[] | undefined, isLoading: boolean };
    const { data: tomorrowMeals, isLoading: isTomorrowLoading } = useMeals(tomorrowStr, tomorrowStr) as { data: MealEvent[] | undefined, isLoading: boolean };

    if (isMealLoading || isTodayLoading || isTomorrowLoading || !currentMeal) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#E11D2E] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <CanteenBoardContent
            currentMeal={currentMeal}
            todayMeals={todayMeals || []}
            tomorrowMeals={tomorrowMeals || []}
        />
    );
}
