import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows, themes } from '../../theme/colors';
import { trackPageView } from '../../services/firebase';

export default function SettingsScreen() {
    const { theme, isDark, themeName, toggleTheme, changeTheme } = useTheme();

    useEffect(() => {
        trackPageView('Settings');
    }, []);

    const themeOptions = [
        {
            id: 'classic',
            name: 'Classic',
            description: 'Pure black & white',
            lightColor: '#FFFFFF',
            darkColor: '#000000',
            icon: 'contrast'
        },
        {
            id: 'neonBlue',
            name: 'Neon Blue',
            description: 'Electric blue accents',
            lightColor: '#E6F7FF',
            darkColor: '#0066FF',
            icon: 'flash'
        },
        {
            id: 'purpleDream',
            name: 'Purple Dream',
            description: 'Vibrant purple & pink',
            lightColor: '#F3E8FF',
            darkColor: '#A78BFA',
            icon: 'color-palette'
        },
        {
            id: 'emeraldGreen',
            name: 'Emerald',
            description: 'Fresh green tones',
            lightColor: '#D1FAE5',
            darkColor: '#10B981',
            icon: 'leaf'
        },
        {
            id: 'sunsetOrange',
            name: 'Sunset',
            description: 'Warm orange glow',
            lightColor: '#FFEDD5',
            darkColor: '#FB923C',
            icon: 'sunny'
        },
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>SETTINGS</Text>
                        <Text style={styles.headerSubtitle}>Customize your experience</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="settings" size={60} color="#FFFFFF" style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                {/* Theme Mode Section */}
                <View style={[styles.section, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: theme.accent3 }]}>
                            <Ionicons name="moon" size={24} color={theme.primary} />
                        </View>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Appearance Mode
                            </Text>
                            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                                Choose light or dark mode
                            </Text>
                        </View>
                    </View>

                    <View style={styles.modeContainer}>
                        <TouchableOpacity
                            style={[
                                styles.modeButton,
                                {
                                    backgroundColor: !isDark ? theme.primary : theme.backgroundSecondary,
                                    borderColor: theme.border
                                },
                                shadows.small
                            ]}
                            onPress={() => isDark && toggleTheme()}
                        >
                            <Ionicons
                                name="sunny"
                                size={24}
                                color={!isDark ? theme.textInverse : theme.textSecondary}
                            />
                            <Text style={[
                                styles.modeText,
                                { color: !isDark ? theme.textInverse : theme.textSecondary }
                            ]}>
                                Light
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.modeButton,
                                {
                                    backgroundColor: isDark ? theme.primary : theme.backgroundSecondary,
                                    borderColor: theme.border
                                },
                                shadows.small
                            ]}
                            onPress={() => !isDark && toggleTheme()}
                        >
                            <Ionicons
                                name="moon"
                                size={24}
                                color={isDark ? theme.textInverse : theme.textSecondary}
                            />
                            <Text style={[
                                styles.modeText,
                                { color: isDark ? theme.textInverse : theme.textSecondary }
                            ]}>
                                Dark
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Color Theme Section */}
                <View style={[styles.section, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: theme.accent3 }]}>
                            <Ionicons name="color-palette" size={24} color={theme.primary} />
                        </View>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Color Theme
                            </Text>
                            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                                Select your preferred color scheme
                            </Text>
                        </View>
                    </View>

                    <View style={styles.themesContainer}>
                        {themeOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.themeCard,
                                    {
                                        backgroundColor: theme.backgroundSecondary,
                                        borderColor: themeName === option.id ? theme.primary : theme.border,
                                        borderWidth: themeName === option.id ? 2 : 1,
                                    },
                                    shadows.small
                                ]}
                                onPress={() => changeTheme(option.id)}
                            >
                                <View style={styles.themePreview}>
                                    <View
                                        style={[
                                            styles.themeColorBox,
                                            { backgroundColor: option.darkColor }
                                        ]}
                                    >
                                        <Ionicons name={option.icon} size={24} color="#FFFFFF" />
                                    </View>
                                </View>
                                <Text style={[styles.themeName, { color: theme.text }]}>
                                    {option.name}
                                </Text>
                                <Text style={[styles.themeDescription, { color: theme.textSecondary }]}>
                                    {option.description}
                                </Text>
                                {themeName === option.id && (
                                    <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]}>
                                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preview Section */}
                <View style={[styles.section, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: theme.accent3 }]}>
                            <Ionicons name="eye" size={24} color={theme.primary} />
                        </View>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Theme Preview
                            </Text>
                            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                                See how your theme looks
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.previewContainer, { backgroundColor: theme.backgroundSecondary }]}>
                        <View style={[styles.previewCard, { backgroundColor: theme.background }]}>
                            <Text style={[styles.previewTitle, { color: theme.text }]}>
                                Sample Card
                            </Text>
                            <Text style={[styles.previewText, { color: theme.textSecondary }]}>
                                This is how your content will look with the selected theme.
                            </Text>
                            <TouchableOpacity
                                style={[styles.previewButton, { backgroundColor: theme.primary }]}
                            >
                                <Text style={[styles.previewButtonText, { color: theme.textInverse }]}>
                                    Primary Button
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: borderRadius.xxl,
        borderBottomRightRadius: borderRadius.xxl,
        marginBottom: spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.extrabold,
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: fontSize.md,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: spacing.xs,
    },
    illustrationContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    section: {
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    sectionIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitleContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    sectionDescription: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    modeContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        borderWidth: 1,
    },
    modeText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    themesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    themeCard: {
        width: '47%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        position: 'relative',
    },
    themePreview: {
        marginBottom: spacing.sm,
    },
    themeColorBox: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    themeDescription: {
        fontSize: fontSize.xs,
        textAlign: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    previewCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    previewTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    previewText: {
        fontSize: fontSize.md,
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    previewButton: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    previewButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
});
