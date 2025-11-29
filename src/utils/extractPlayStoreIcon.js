/**
 * Extracts app icon URL from Google Play Store link
 * @param {string} playStoreUrl - The Play Store URL (e.g., https://play.google.com/store/apps/details?id=com.whatsapp)
 * @returns {string|null} - The icon URL or null if extraction fails
 */
export const extractPlayStoreIcon = async (playStoreUrl) => {
    try {
        // Extract package name from Play Store URL
        const packageName = extractPackageName(playStoreUrl);
        if (!packageName) return null;

        // Construct icon URL using Google Play Store's pattern
        // We'll fetch the Play Store page and extract the icon URL
        const iconUrl = await fetchPlayStoreIcon(packageName);
        return iconUrl;
    } catch (error) {
        console.error('Error extracting Play Store icon:', error);
        return null;
    }
};

/**
 * Extracts package name from Play Store URL
 * @param {string} url - The Play Store URL
 * @returns {string|null} - The package name or null
 */
export const extractPackageName = (url) => {
    try {
        // Match patterns like:
        // https://play.google.com/store/apps/details?id=com.example.app
        // https://play.google.com/store/apps/details?id=com.example.app&hl=en
        const match = url.match(/id=([a-zA-Z0-9._]+)/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting package name:', error);
        return null;
    }
};

/**
 * Fetches app icon URL from Play Store
 * @param {string} packageName - The app package name
 * @returns {Promise<string|null>} - The icon URL or null
 */
const fetchPlayStoreIcon = async (packageName) => {
    try {
        // Use a CORS proxy or direct fetch to get Play Store page
        const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;

        // For React Native, we can use a simple approach:
        // The icon URL follows a predictable pattern on Google's CDN
        // We'll construct it directly using the package name

        // Alternative: Use a third-party API like Google Play Scraper
        // For now, we'll use a simple heuristic approach

        // Try to fetch the page metadata
        const response = await fetch(playStoreUrl);
        const html = await response.text();

        // Extract icon URL from HTML
        // Look for the app icon in meta tags or img tags
        const iconMatch = html.match(/"icon":\s*"([^"]+)"/);
        if (iconMatch && iconMatch[1]) {
            return iconMatch[1];
        }

        // Fallback: Look for image with specific pattern
        const imgMatch = html.match(/https:\/\/play-lh\.googleusercontent\.com\/[^"'\s]+/);
        if (imgMatch) {
            return imgMatch[0];
        }

        return null;
    } catch (error) {
        console.error('Error fetching Play Store icon:', error);
        return null;
    }
};

/**
 * Checks if a URL is a valid Play Store link
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a Play Store URL
 */
export const isPlayStoreUrl = (url) => {
    return url && url.includes('play.google.com/store/apps/details');
};
