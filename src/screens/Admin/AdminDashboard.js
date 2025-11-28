import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { logoutUser } from '../../services/firebase';

export default function AdminDashboard({ navigation }) {
    const { theme } = useTheme();
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigation.replace('Home');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const adminOptions = [
        { id: 'tools', title: 'Manage Tools', icon: 'construct', screen: 'ToolsManager', color: '#FF8C42' },
        { id: 'youtube', title: 'Manage Videos', icon: 'play-circle', screen: 'YouTubeManager', color: '#FFC107' },
        { id: 'apps', title: 'Manage Apps', icon: 'apps', screen: 'AppsManager', color: '#FF8C42' },
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Gradient */}
            <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>ADMIN DASHBOARD</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>
                            Welcome, {user?.email || 'Admin'}
                        </Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Ionicons name="speedometer" size={50} color={theme.textInverse} />
                    </View>
                </View>
            </LinearGradient>

            {/* Admin Options */}
            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Management</Text>

                {adminOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[styles.optionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                        onPress={() => navigation.navigate(option.screen)}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                            <Ionicons name={option.icon} size={28} color={option.color} />
                        </View>
                        <Text style={[styles.optionText, { color: theme.text }]}>
                            {option.title}
                        </Text>
                        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                ))}

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                >
                    <View style={[styles.actionIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="notifications" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Send Push Notification
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                            Notify all users
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                >
                    <View style={[styles.actionIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="analytics" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            View Analytics
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                            App usage stats
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.error }, shadows.medium]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out" size={20} color="#FFFFFF" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: spacing.xl,
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
    iconContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    optionIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: fontSize.sm,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
    logoutText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
});
