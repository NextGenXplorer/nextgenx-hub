import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView } from '../../services/firebase';

const { width } = Dimensions.get('window');

const menuItems = [
    { id: 'tools', title: 'Tools', icon: 'construct', screen: 'Tools', gradient: ['#FF8C42', '#FFB380'] },
    { id: 'apps', title: 'Apps', icon: 'apps', screen: 'Apps', gradient: ['#FFC107', '#FFD54F'] },
    { id: 'youtube', title: 'Content', icon: 'play-circle', screen: 'YouTube', gradient: ['#FF8C42', '#FFC107'] },
    { id: 'about', title: 'About', icon: 'information-circle', screen: 'About', gradient: ['#FFB380', '#FFD54F'] },
];

const quickActions = [
    { id: 'feedback', title: 'Feedback', icon: 'chatbubbles', screen: 'Feedback' },
    { id: 'profile', title: 'Profile', icon: 'person', screen: 'Profile' },
    { id: 'qr', title: 'QR Code', icon: 'qr-code', screen: 'QRGenerator' },
];

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const [drawerVisible, setDrawerVisible] = useState(false);

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
                    colors={['#FF8C42', '#FFC107']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="flame" size={40} color="#FFFFFF" />
                            <Text style={styles.logoText}>NEXTGENX</Text>
                        </View>

                        {/* Menu Button */}
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => setDrawerVisible(true)}
                        >
                            <Ionicons name="menu" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.illustrationPlaceholder}>
                        <Ionicons name="bicycle" size={80} color="#FFFFFF" style={styles.illustration} />
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
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Main Menu Grid */}
                <View style={styles.menuGrid}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuCardWrapper}
                            onPress={() => navigation.navigate(item.screen)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={item.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.menuCard, shadows.medium]}
                            >
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name={item.icon} size={32} color="#FFFFFF" />
                                </View>
                                <Text style={styles.menuCardTitle}>{item.title}</Text>
                            </LinearGradient>
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

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { backgroundColor: theme.backgroundCard }, shadows.large]}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                    <Ionicons name="home" size={24} color={theme.primary} />
                    <Text style={[styles.navText, { color: theme.primary }]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Tools')}>
                    <Ionicons name="grid" size={24} color={theme.textSecondary} />
                    <Text style={[styles.navText, { color: theme.textSecondary }]}>Tools</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.fabButton, { backgroundColor: theme.primary }, shadows.medium]}
                    onPress={() => navigation.navigate('QRGenerator')}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('YouTube')}>
                    <Ionicons name="play-circle" size={24} color={theme.textSecondary} />
                    <Text style={[styles.navText, { color: theme.textSecondary }]}>Content</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person" size={24} color={theme.textSecondary} />
                    <Text style={[styles.navText, { color: theme.textSecondary }]}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Slide-out Drawer */}
            <Modal
                visible={drawerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setDrawerVisible(false)}
            >
                <TouchableOpacity
                    style={styles.drawerOverlay}
                    activeOpacity={1}
                    onPress={() => setDrawerVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.drawer, { backgroundColor: theme.backgroundCard }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <LinearGradient
                            colors={['#FF8C42', '#FFC107']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.drawerHeader}
                        >
                            <Text style={styles.drawerTitle}>Menu</Text>
                            <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                                <Ionicons name="close" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        </LinearGradient>

                        <ScrollView style={styles.drawerContent}>
                            {/* Admin Section */}
                            <View style={styles.drawerSection}>
                                <Text style={[styles.drawerSectionTitle, { color: theme.textSecondary }]}>
                                    ADMIN
                                </Text>

                                <TouchableOpacity
                                    style={[styles.drawerItem, { backgroundColor: theme.backgroundSecondary }]}
                                    onPress={() => {
                                        setDrawerVisible(false);
                                        navigation.navigate('AdminLogin');
                                    }}
                                >
                                    <View style={[styles.drawerItemIcon, { backgroundColor: theme.accent3 }]}>
                                        <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
                                    </View>
                                    <Text style={[styles.drawerItemText, { color: theme.text }]}>
                                        Admin Login
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.drawerItem, { backgroundColor: theme.backgroundSecondary }]}
                                    onPress={() => {
                                        setDrawerVisible(false);
                                        navigation.navigate('AdminDashboard');
                                    }}
                                >
                                    <View style={[styles.drawerItemIcon, { backgroundColor: theme.accent3 }]}>
                                        <Ionicons name="speedometer" size={24} color={theme.primary} />
                                    </View>
                                    <Text style={[styles.drawerItemText, { color: theme.text }]}>
                                        Dashboard
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Settings Section */}
                            <View style={styles.drawerSection}>
                                <Text style={[styles.drawerSectionTitle, { color: theme.textSecondary }]}>
                                    SETTINGS
                                </Text>

                                <TouchableOpacity
                                    style={[styles.drawerItem, { backgroundColor: theme.backgroundSecondary }]}
                                >
                                    <View style={[styles.drawerItemIcon, { backgroundColor: theme.accent3 }]}>
                                        <Ionicons name="settings" size={24} color={theme.primary} />
                                    </View>
                                    <Text style={[styles.drawerItemText, { color: theme.text }]}>
                                        App Settings
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.drawerItem, { backgroundColor: theme.backgroundSecondary }]}
                                >
                                    <View style={[styles.drawerItemIcon, { backgroundColor: theme.accent3 }]}>
                                        <Ionicons name="help-circle" size={24} color={theme.primary} />
                                    </View>
                                    <Text style={[styles.drawerItemText, { color: theme.text }]}>
                                        Help & Support
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
    menuButton: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
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
        color: '#FFFFFF',
        marginTop: spacing.sm,
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
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
    },
    navItem: {
        alignItems: 'center',
        gap: 2,
    },
    navText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -spacing.xl,
    },
    drawerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    drawer: {
        height: '70%',
        borderTopLeftRadius: borderRadius.xxl,
        borderTopRightRadius: borderRadius.xxl,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderTopLeftRadius: borderRadius.xxl,
        borderTopRightRadius: borderRadius.xxl,
    },
    drawerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
    drawerContent: {
        flex: 1,
        padding: spacing.lg,
    },
    drawerSection: {
        marginBottom: spacing.xl,
    },
    drawerSectionTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        letterSpacing: 1,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    drawerItemIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerItemText: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
});
