import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { isBookmarked, addBookmark, removeBookmark } from '../services/bookmarkService';

export default function BookmarkButton({ item, type, onToggle, size = 24 }) {
    const { theme } = useTheme();
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
    const scaleAnim = new Animated.Value(1);

    useEffect(() => {
        checkBookmarkStatus();
    }, [item.id]);

    const checkBookmarkStatus = async () => {
        const status = await isBookmarked(item.id);
        setBookmarked(status);
    };

    const handlePress = async () => {
        if (loading) return;

        setLoading(true);

        // Animate button
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        try {
            if (bookmarked) {
                await removeBookmark(item.id);
                setBookmarked(false);
            } else {
                await addBookmark(item, type);
                setBookmarked(true);
            }

            // Notify parent component
            if (onToggle) {
                onToggle(!bookmarked);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={styles.button}
            activeOpacity={0.7}
            disabled={loading}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                    name={bookmarked ? 'heart' : 'heart-outline'}
                    size={size}
                    color={bookmarked ? '#FF6B6B' : theme.textSecondary}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
