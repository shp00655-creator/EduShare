import { getApiBaseUrl } from './api';

/**
 * Resolves static local fallback file paths (like /uploads/filename)
 * to point to the active backend IP address, while passing remote URLs (like Cloudinary) unchanged.
 * @param {String} url - The URL to resolve
 * @returns {String} Resolved URL
 */
export const resolveFileUrl = (url) => {
  if (!url) return '';
  
  if (url.startsWith('/uploads/')) {
    const apiBase = getApiBaseUrl();
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${url}`;
  }
  
  return url;
};
