// Legal Service for Privacy Policy and Terms of Service

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

/**
 * Get Privacy Policy from backend
 */
export const getPrivacyPolicy = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/legal/privacy-policy`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get Terms of Service from backend
 */
export const getTermsOfService = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/legal/terms-of-service`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching terms of service:', error);
        return { success: false, error: error.message };
    }
};

export default {
    getPrivacyPolicy,
    getTermsOfService,
};
