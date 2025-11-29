// Admin Session Management with 7-day persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_SESSION_KEY = 'admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Save admin session after successful login
 */
export const saveAdminSession = async (user) => {
    try {
        const session = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION,
        };
        await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        console.log('Admin session saved, expires in 7 days');
        return true;
    } catch (error) {
        console.error('Error saving admin session:', error);
        return false;
    }
};

/**
 * Get admin session if valid (not expired)
 */
export const getAdminSession = async () => {
    try {
        const sessionData = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
        if (!sessionData) {
            return null;
        }

        const session = JSON.parse(sessionData);

        // Check if session has expired
        if (Date.now() > session.expiresAt) {
            console.log('Admin session expired, clearing...');
            await clearAdminSession();
            return null;
        }

        // Calculate remaining time
        const remainingMs = session.expiresAt - Date.now();
        const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        console.log(`Admin session valid, expires in ${remainingDays}d ${remainingHours}h`);

        return session;
    } catch (error) {
        console.error('Error getting admin session:', error);
        return null;
    }
};

/**
 * Check if admin session is valid
 */
export const isAdminSessionValid = async () => {
    const session = await getAdminSession();
    return session !== null;
};

/**
 * Clear admin session (on logout)
 */
export const clearAdminSession = async () => {
    try {
        await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
        console.log('Admin session cleared');
        return true;
    } catch (error) {
        console.error('Error clearing admin session:', error);
        return false;
    }
};

/**
 * Extend admin session (refresh expiry)
 */
export const extendAdminSession = async () => {
    try {
        const session = await getAdminSession();
        if (session) {
            session.expiresAt = Date.now() + SESSION_DURATION;
            await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
            console.log('Admin session extended for another 7 days');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error extending admin session:', error);
        return false;
    }
};

/**
 * Get session info for display
 */
export const getSessionInfo = async () => {
    try {
        const session = await getAdminSession();
        if (!session) {
            return null;
        }

        const remainingMs = session.expiresAt - Date.now();
        const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

        return {
            email: session.email,
            loginTime: new Date(session.loginTime).toLocaleString(),
            expiresAt: new Date(session.expiresAt).toLocaleString(),
            remainingTime: `${remainingDays} days, ${remainingHours} hours`,
        };
    } catch (error) {
        console.error('Error getting session info:', error);
        return null;
    }
};

export default {
    saveAdminSession,
    getAdminSession,
    isAdminSessionValid,
    clearAdminSession,
    extendAdminSession,
    getSessionInfo,
};
