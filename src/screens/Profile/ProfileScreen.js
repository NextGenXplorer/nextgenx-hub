import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { getBookmarkCount } from '../../services/bookmarkService';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [userName, setUserName] = useState('');
    const [bookmarkCount, setBookmarkCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            loadBookmarkCount();
        }, [])
    );

    useEffect(() => {
        loadUserName();
    }, []);

    const loadUserName = async () => {
        try {
            const name = await AsyncStorage.getItem('userName');
            if (name) {
                setUserName(name);
            }
        } catch (error) {
            console.error('Error loading user name:', error);
        }
    };

    const loadBookmarkCount = async () => {
        try {
            const count = await getBookmarkCount();
            setBookmarkCount(count);
        } catch (error) {
            console.error('Error loading bookmark count:', error);
        }
    };

    const handleEditName = async () => {
        // You can add a modal or navigate to edit screen here
        console.log('Edit name');
    };

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
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[theme.primary, theme.primaryLight]}
                            style={styles.avatar}
                        >
                            <Text style={[styles.avatarText, { color: theme.textInverse }]}>
                                {userName ? userName.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </LinearGradient>
                    </View>
                    <Text style={[styles.userName, { color: theme.textInverse }]}>{userName || 'User'}</Text>
                    <Text style={[styles.userEmail, { color: theme.textInverse }]}>{user?.email || 'Not logged in'}</Text>

                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: theme.accent }]}
                        onPress={handleEditName}
                    >
                        <Ionicons name="create" size={16} color={theme.primary} />
                        <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Profile Options */}
            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    style={[styles.optionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <View style={[styles.optionIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="settings" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.optionText, { color: theme.text }]}>Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                >
                    <View style={[styles.optionIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="notifications" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.optionText, { color: theme.text }]}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                    onPress={() => navigation.navigate('Bookmarks')}
                >
                    <View style={[styles.optionIcon, { backgroundColor: '#FFE5E5' }]}>
                        <Ionicons name="heart" size={24} color="#FF6B6B" />
                    </View>
                    <Text style={[styles.optionText, { color: theme.text }]}>My Bookmarks</Text>
                    {bookmarkCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: '#FF6B6B' }]}>
                            <Text style={styles.badgeText}>{bookmarkCount}</Text>
                        </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                >
                    <View style={[styles.optionIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="help-circle" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.optionText, { color: theme.text }]}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.optionCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                    onPress={() => navigation.navigate('AdminLogin')}
                >
                    <View style={[styles.optionIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.optionText, { color: theme.text }]}>Admin Panel</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                {user && (
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: theme.error }, shadows.medium]}
                    >
                        <Ionicons name="log-out" size={20} color="#FFFFFF" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                )}
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
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: borderRadius.xxl,
        borderBottomRightRadius: borderRadius.xxl,
        marginBottom: spacing.lg,
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    avatarText: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
    userName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    userEmail: {
        fontSize: fontSize.md,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: spacing.md,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    editButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: '#FFFFFF',
    },
    optionsContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
    logoutText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
});
