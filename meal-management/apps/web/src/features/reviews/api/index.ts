import { api } from '@/lib/api';

export interface MealReview {
    id: string;
    mealEventId: string;
    employeeId: string;
    employeeName: string;
    comment: string;
    images: string[];
    isAnonymous: boolean;
    createdAt: string;
}

export interface CreateReviewDTO {
    date: string;
    mealType: 'LUNCH' | 'DINNER';
    comment: string;
    images?: string[];
    isAnonymous?: boolean;
}

export const reviewApi = {
    createReview: (data: CreateReviewDTO) =>
        api.post<MealReview>('/reviews', data),

    getMealReviews: (mealId: string) =>
        api.get<MealReview[]>(`/reviews/meal/${mealId}`),
};
