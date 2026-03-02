const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Remove trailing slash if exists, then remove /api from the end
const resolveBaseUrl = () => {
    let base = API_URL.trim();
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    if (base.endsWith('/api')) {
        base = base.slice(0, -4);
    }
    return base;
};

const BASE_URL = resolveBaseUrl();

/**
 * Resolves an image URL.
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // Log warning if we're on localhost but might be in production
    if (typeof window !== 'undefined' && API_URL.includes('localhost') && !window.location.hostname.includes('localhost')) {
        console.warn('[resolveImageUrl] NEXT_PUBLIC_API_URL is set to localhost but app is running on', window.location.hostname);
    }

    if (url.startsWith('http')) return url;

    if (url.startsWith('/')) {
        return `${BASE_URL}${url}`;
    }

    return `${BASE_URL}/${url}`;
};
