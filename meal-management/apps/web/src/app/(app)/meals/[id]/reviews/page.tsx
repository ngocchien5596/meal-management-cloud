'use client';

import React from 'react';
import { ReviewTab } from '@/features/reviews/components/ReviewTab';

export default function MealReviewsPage({ params }: { params: { id: string } }) {
    return <ReviewTab mealId={params.id} />;
}
