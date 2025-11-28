import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, shadows } from '../theme/colors';

export default function GlassCard({ children, style, noBorder = false }) {
    const { theme } = useTheme();

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: theme.glassBackground,
                borderColor: noBorder ? 'transparent' : theme.glassBorder,
            },
            shadows.medium,
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        padding: 16,
    },
});
