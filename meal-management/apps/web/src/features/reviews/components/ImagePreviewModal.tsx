'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
}

export function ImagePreviewModal({ isOpen, onClose, imageUrl }: ImagePreviewModalProps) {
    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !imageUrl) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[70]"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Image Container */}
            <div className="relative z-[65] max-w-full max-h-full flex items-center justify-center pointer-events-none">
                <img
                    src={imageUrl}
                    alt="Full preview"
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                />
            </div>
        </div>
    );
}
