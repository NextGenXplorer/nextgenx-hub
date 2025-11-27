import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView } from '../../services/firebase';

export default function AboutScreen() {
    const { theme } = useTheme();

    useEffect(() => {
        trackPageView('About');
    }, []);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#FFB380', '#FFD54F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>ABOUT</Text>
                        <Text style={styles.headerSubtitle}>Learn more about us</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="information-circle" size={60} color="#FFFFFF" style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Content Cards */}
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="rocket" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Our Mission</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        To provide the best tools and resources for modern digital creators and professionals.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="eye" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Our Vision</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        Building a community where innovation meets simplicity, empowering everyone to achieve more.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="people" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Our Team</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        A passionate group of developers, designers, and creators dedicated to excellence.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="mail" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Contact Us</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        Have questions? Reach out to us at hello@nextgenx.com
                    </Text>
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
        gap: spacing.md,
    },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    cardText: {
        fontSize: fontSize.md,
        lineHeight: 22,
    },
});
