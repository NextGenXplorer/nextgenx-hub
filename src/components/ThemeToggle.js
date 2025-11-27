import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/colors';

export const ThemeToggle = () => {
    const { theme, isDark, toggleTheme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { marginRight: spacing.md }]}
            onPress={toggleTheme}
        >
            <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={theme.text}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.xs,
    },
});
