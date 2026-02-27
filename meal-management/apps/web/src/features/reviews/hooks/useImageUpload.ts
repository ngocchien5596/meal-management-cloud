import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-hot-toast';
import axios from 'axios';

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

            // Access API URL from environment or default
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

            const response = await axios.post(`${API_URL}/upload/image`, formData);

            setIsUploading(false);

            if (response.data.success) {
                // Ensure full URL if backend returns relative path
                const url = response.data.url;
                if (url.startsWith('http')) return url;
                // Construct full URL using 4000 port for now, but ideally uses Env
                const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
                return `${BASE_URL}${url}`;
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
