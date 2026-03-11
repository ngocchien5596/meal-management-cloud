const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const resolveBaseUrl = () => {
    let base = API_URL.trim();
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    if (base.endsWith('/api/v1')) {
        base = base.slice(0, -7); // Remove /api/v1
    } else if (base.endsWith('/api')) {
        base = base.slice(0, -4); // Remove /api
    }
    return base;
};

const BASE_URL = resolveBaseUrl();

/**
 * Resolves an image URL.
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // If it's an absolute URL
    if (url.startsWith('http')) {
        // Fix legacy data: if it points to localhost:4000, swap it with the current BASE_URL
        if (url.includes('localhost:4000')) {
            const fixedUrl = url.replace(/http:\/\/localhost:4000/g, BASE_URL);
            return fixedUrl;
        }
        return url;
    }

    // Log warning if we're on localhost but might be in production
    if (typeof window !== 'undefined' && API_URL.includes('localhost') && !window.location.hostname.includes('localhost')) {
        console.warn('[resolveImageUrl] NEXT_PUBLIC_API_URL is set to localhost but app is running on', window.location.hostname);
    }

    if (url.startsWith('/')) {
        return `${BASE_URL}${url}`;
    }

    return `${BASE_URL}/${url}`;
};
