import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@nextgenx_bookmarks';

/**
 * Local Bookmark Service
 * Stores bookmarks locally on device using AsyncStorage
 * Works for all users without authentication
 */

// Get all bookmarks from local storage
export const getBookmarks = async () => {
    try {
        const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
        return bookmarksJson ? JSON.parse(bookmarksJson) : [];
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        return [];
    }
};

// Add a bookmark
export const addBookmark = async (item, type) => {
    try {
        const bookmarks = await getBookmarks();

        // Check if already bookmarked
        const exists = bookmarks.some(b => b.id === item.id);
        if (exists) {
            return bookmarks;
        }

        // Add new bookmark with timestamp
        const newBookmark = {
            id: item.id,
            type, // 'tool', 'app', or 'video'
            data: item,
            timestamp: new Date().toISOString(),
        };

        const updatedBookmarks = [...bookmarks, newBookmark];
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
    } catch (error) {
        console.error('Error adding bookmark:', error);
        throw error;
    }
};

// Remove a bookmark
export const removeBookmark = async (itemId) => {
    try {
        const bookmarks = await getBookmarks();
        const updatedBookmarks = bookmarks.filter(b => b.id !== itemId);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
        return updatedBookmarks;
    } catch (error) {
        console.error('Error removing bookmark:', error);
        throw error;
    }
};

// Check if an item is bookmarked
export const isBookmarked = async (itemId) => {
    try {
        const bookmarks = await getBookmarks();
        return bookmarks.some(b => b.id === itemId);
    } catch (error) {
        console.error('Error checking bookmark:', error);
        return false;
    }
};

// Get bookmarks by type
export const getBookmarksByType = async (type) => {
    try {
        const bookmarks = await getBookmarks();
        if (!type || type === 'all') {
            return bookmarks;
        }
        return bookmarks.filter(b => b.type === type);
    } catch (error) {
        console.error('Error getting bookmarks by type:', error);
        return [];
    }
};

// Get bookmark count
export const getBookmarkCount = async () => {
    try {
        const bookmarks = await getBookmarks();
        return bookmarks.length;
    } catch (error) {
        console.error('Error getting bookmark count:', error);
        return 0;
    }
};

// Clear all bookmarks (useful for testing)
export const clearAllBookmarks = async () => {
    try {
        await AsyncStorage.removeItem(BOOKMARKS_KEY);
    } catch (error) {
        console.error('Error clearing bookmarks:', error);
        throw error;
    }
};
