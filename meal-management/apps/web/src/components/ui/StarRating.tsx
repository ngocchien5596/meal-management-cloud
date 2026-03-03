import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 'md',
    className,
    showNumber = false
}) => {
    const sizeMap = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <div className="flex items-center gap-0.5">
                {[...Array(maxRating)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            sizeMap[size],
                            i < Math.round(rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-100"
                        )}
                    />
                ))}
            </div>
            {showNumber && (
                <span className={cn(
                    "font-bold text-slate-700",
                    size === 'sm' ? "text-xs" : size === 'md' ? "text-sm" : "text-base"
                )}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};
