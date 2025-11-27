import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserBookmarks, addBookmark as addBookmarkToFirebase, removeBookmark as removeBookmarkFromFirebase } from '../services/firebase';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadBookmarks();
        } else {
            setBookmarks([]);
        }
    }, [user]);

    const loadBookmarks = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const userBookmarks = await getUserBookmarks(user.uid);
            setBookmarks(userBookmarks);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const addBookmark = async (itemId, itemType) => {
        if (!user) return;

        try {
            await addBookmarkToFirebase(user.uid, itemId, itemType);
            setBookmarks([...bookmarks, { itemId, itemType }]);
        } catch (error) {
            console.error('Error adding bookmark:', error);
        }
    };

    const removeBookmark = async (itemId) => {
        if (!user) return;

        try {
            await removeBookmarkFromFirebase(user.uid, itemId);
            setBookmarks(bookmarks.filter(b => b.itemId !== itemId));
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    const isBookmarked = (itemId) => {
        return bookmarks.some(b => b.itemId === itemId);
    };

    return (
        <BookmarkContext.Provider value={{ bookmarks, loading, addBookmark, removeBookmark, isBookmarked }}>
            {children}
        </BookmarkContext.Provider>
    );
};

export const useBookmarks = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarks must be used within BookmarkProvider');
    }
    return context;
};
