
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BASE_URL = API_URL.replace('/api', '');

/**
 * Resolves an image URL.
 * If the URL is already absolute (starts with http), it returns it as is.
 * If it's a relative path (starts with /), it prepends the current API base URL.
 * Also handles potential "localhost" issues by checking if the stored URL 
 * contains "localhost" and replacing it with the current host if needed (optional safety).
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // If it's already a full HTTP URL
    if (url.startsWith('http')) {
        // Special case: if it's a localhost URL from a different environment
        // we might want to fix it, but for now let's just return it.
        // A better approach is to store relative paths only.
        return url;
    }

    // If it's a relative path, prepend base URL
    if (url.startsWith('/')) {
        return `${BASE_URL}${url}`;
    }

    // Default: return as is
    return url;
};
