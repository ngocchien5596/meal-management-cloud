import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewApi, CreateReviewDTO } from '../api';

export const useCreateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReviewDTO) => reviewApi.createReview(data),
        onSuccess: () => {
            // Invalidate all review-related queries
            queryClient.invalidateQueries({ queryKey: ['meal-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
        },
    });
};

export const useMealReviews = (mealId: string) => {
    return useQuery({
        queryKey: ['meal-reviews', mealId],
        queryFn: () => reviewApi.getMealReviews(mealId),
        enabled: !!mealId,
    });
};

export const useMyReviews = () => {
    return useQuery({
        queryKey: ['my-reviews'],
        queryFn: () => reviewApi.getMyReviews(),
    });
};

export * from './useImageUpload';
