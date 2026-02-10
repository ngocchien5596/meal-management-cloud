import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewApi, CreateReviewDTO } from '../api';

export const useCreateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReviewDTO) => reviewApi.createReview(data),
        onSuccess: (_, variables) => {
            // Invalidate specific meal queries if needed
            queryClient.invalidateQueries({ queryKey: ['meal-reviews'] });
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

export * from './useImageUpload';
