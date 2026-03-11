import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';

interface UseImageUploadResult {
    uploadImage: (file: File) => Promise<string | null>;
    isUploading: boolean;
    isCompressing: boolean;
}

export const useImageUpload = (): UseImageUploadResult => {
    const [isUploading, setIsUploading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            // 1. Compress Image
            setIsCompressing(true);
            const options = {
                maxSizeMB: 1, // Max 1MB
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            setIsCompressing(false);

            // 2. Upload to Backend
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', compressedFile);

            const response = await apiClient.post<{ url: string }>('/upload/image', formData);

            setIsUploading(false);

            if (response.success && response.data?.url) {
                // Return relative path from backend (e.g., /static/uploads/...)
                return response.data.url;
            } else {
                toast.error('Có lỗi khi tải ảnh lên');
                return null;
            }

        } catch (error) {
            console.error('Upload Error:', error);
            setIsCompressing(false);
            setIsUploading(false);
            toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
            return null;
        }
    };

    return { uploadImage, isUploading, isCompressing };
};
