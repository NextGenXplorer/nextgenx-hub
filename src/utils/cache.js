import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const setCachedData = async (key, data) => {
    try {
        const cacheItem = {
            data,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
        console.error('Error caching data:', error);
    }
};

export const getCachedData = async (key) => {
    try {
        const cached = await AsyncStorage.getItem(`cache_${key}`);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

        if (isExpired) {
            await AsyncStorage.removeItem(`cache_${key}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error getting cached data:', error);
        return null;
    }
};

export const clearCache = async (key) => {
    try {
        if (key) {
            await AsyncStorage.removeItem(`cache_${key}`);
        } else {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(k => k.startsWith('cache_'));
            await AsyncStorage.multiRemove(cacheKeys);
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};
