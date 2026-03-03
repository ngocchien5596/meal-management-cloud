import { api } from '@/lib/api';

export interface MealReview {
    id: string;
    mealEventId: string;
    employeeId: string;
    employeeName: string;
    comment: string;
    images: string[];
    isAnonymous: boolean;
    rating: number;
    adminReply?: string;
    adminReplyAt?: string;
    createdAt: string;
    mealEvent?: {
        mealDate: string;
        mealType: 'LUNCH' | 'DINNER';
    };
    employee?: {
        fullName: string;
        employeeCode: string;
    };
}

export interface CreateReviewDTO {
    date: string;
    mealType: 'LUNCH' | 'DINNER';
    comment: string;
    images?: string[];
    isAnonymous?: boolean;
    rating?: number;
}

export const reviewApi = {
    createReview: (data: CreateReviewDTO) =>
        api.post<MealReview>('/reviews', data),

    getMealReviews: (mealId: string) =>
        api.get<MealReview[]>(`/reviews/meal/${mealId}`),

    getMyReviews: () =>
        api.get<MealReview[]>('/reviews/my'),

    replyToReview: (id: string, reply: string) =>
        api.patch<MealReview>(`/reviews/${id}/reply`, { reply }),
};
