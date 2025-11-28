import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../theme/colors';

export default function NeumorphicButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
    variant = 'primary' // primary, secondary, outline
}) {
    const { theme } = useTheme();

    const getColors = () => {
        switch (variant) {
            case 'secondary':
                return {
                    bg: theme.backgroundSecondary,
                    text: theme.text,
                };
            case 'outline':
                return {
                    bg: 'transparent',
                    text: theme.primary,
                };
            default:
                return {
                    bg: theme.primary,
                    text: '#FFFFFF',
                };
        }
    };

    const colors = getColors();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                {
                    backgroundColor: colors.bg,
                    borderColor: variant === 'outline' ? theme.primary : 'transparent',
                    borderWidth: variant === 'outline' ? 2 : 0,
                },
                variant === 'primary' && shadows.neumorphic,
                disabled && styles.disabled,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={colors.text} />
            ) : (
                <Text style={[
                    styles.text,
                    { color: colors.text },
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    text: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    disabled: {
        opacity: 0.5,
    },
});
