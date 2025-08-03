/**
 * Validates if a URL string is valid for use with Next.js Image component
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is valid, false otherwise
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path that starts with /
    return url.startsWith('/');
  }
}

/**
 * Safely gets an image URL, returning null if invalid
 * @param {string} url - The URL to validate
 * @returns {string|null} - Valid URL or null
 */
export function getSafeImageUrl(url) {
  return isValidImageUrl(url) ? url : null;
}
