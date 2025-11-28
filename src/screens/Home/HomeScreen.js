import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView } from '../../services/firebase';

const { width } = Dimensions.get('window');

const menuItems = [
    { id: 'tools', title: 'Tools', icon: 'construct', screen: 'Tools' },
    { id: 'apps', title: 'Apps', icon: 'apps', screen: 'Apps' },
    { id: 'youtube', title: 'Content', icon: 'play-circle', screen: 'YouTube' },
    { id: 'about', title: 'About', icon: 'information-circle', screen: 'About' },
];

const quickActions = [
    { id: 'feedback', title: 'Feedback', icon: 'chatbubbles', screen: 'Feedback' },
    { id: 'profile', title: 'Profile', icon: 'person', screen: 'Profile' },
    { id: 'qr', title: 'QR Code', icon: 'qr-code', screen: 'QRGenerator' },
];

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();

    useEffect(() => {
        trackPageView('Home');
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header with Gradient */}
                <LinearGradient
                    colors={[theme.primary, theme.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="flame" size={40} color={theme.textInverse} />
                            <Text style={[styles.logoText, { color: theme.textInverse }]}>NEXTGENX</Text>
                        </View>
                    </View>

                    <View style={styles.illustrationPlaceholder}>
                        <Ionicons name="bicycle" size={80} color={theme.textInverse} style={styles.illustration} />
                    </View>
                </LinearGradient>

                {/* Welcome Card */}
                <View style={[styles.welcomeCard, { backgroundColor: theme.backgroundCard }, shadows.large]}>
                    <Text style={[styles.welcomeTitle, { color: theme.text }]}>
                        Welcome to NextgenX
                    </Text>
                    <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
                        Your digital hub for tools, apps, and content
                    </Text>

                    <TouchableOpacity
                        style={[styles.getStartedButton, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('Tools')}
                    >
                        <Text style={[styles.getStartedText, { color: theme.textInverse }]}>
                            Get Started
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color={theme.textInverse} />
                    </TouchableOpacity>
                </View>

                {/* Main Menu Grid */}
                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuCardWrapper}
                            onPress={() => navigation.navigate(item.screen)}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[
                                    styles.menuCard,
                                    { backgroundColor: theme.primary },
                                    shadows.medium
                                ]}
                            >
                                <View style={[styles.menuIconContainer, { backgroundColor: theme.accent }]}>
                                    <Ionicons name={item.icon} size={32} color={theme.primary} />
                                </View>
                                <Text style={[styles.menuCardTitle, { color: theme.textInverse }]}>{item.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={[
                                styles.quickActionCard,
                                { backgroundColor: theme.backgroundCard },
                                shadows.small
                            ]}
                            onPress={() => navigation.navigate(action.screen)}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: theme.accent3 }]}>
                                <Ionicons name={action.icon} size={24} color={theme.primary} />
                            </View>
                            <Text style={[styles.quickActionText, { color: theme.text }]}>
                                {action.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    header: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: borderRadius.xxl,
        borderBottomRightRadius: borderRadius.xxl,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    logoText: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.extrabold,
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    illustrationPlaceholder: {
        alignSelf: 'center',
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustration: {
        opacity: 0.9,
    },
    welcomeCard: {
        marginHorizontal: spacing.lg,
        marginTop: -spacing.xl,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    welcomeTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    welcomeSubtitle: {
        fontSize: fontSize.md,
        marginBottom: spacing.lg,
    },
    getStartedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    getStartedText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    menuCardWrapper: {
        width: (width - spacing.lg * 2 - spacing.md) / 2,
    },
    menuCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    menuIconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.round,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuCardTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    sectionTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    quickActionCard: {
        width: (width - spacing.lg * 2 - spacing.md) / 2,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        flex: 1,
    },
});
