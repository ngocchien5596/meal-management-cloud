'use client';

import React from 'react';
import { CanteenBoardContent } from '@/features/canteen/components/CanteenBoardContent';

/**
 * DisplayBoardPage component
 * Replaced the single-meal dashboard with the unified "BẢNG THÔNG TIN NHÀ ĂN"
 * as per user's pixel-perfect screenshot requirements.
 */
export default function DisplayBoardPage({ params }: { params: { id: string } }) {
    // Note: id is available but the current requirement is to match the screenshot EXACTLY 
    // using mock data as requested.
    return <CanteenBoardContent />;
}
