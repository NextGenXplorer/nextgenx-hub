import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Switch, Linking } from 'react-native';
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
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [notificationModalVisible, setNotificationModalVisible] = useState(false);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [newContentAlerts, setNewContentAlerts] = useState(true);
    const [updateAlerts, setUpdateAlerts] = useState(false);

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

    const handleEditName = () => {
        setEditName(userName);
        setEditModalVisible(true);
    };

    const handleSaveName = async () => {
        if (editName.trim()) {
            try {
                await AsyncStorage.setItem('userName', editName.trim());
                setUserName(editName.trim());
                setEditModalVisible(false);
                Alert.alert('Success', 'Profile updated successfully!');
            } catch (error) {
                console.error('Error saving user name:', error);
                Alert.alert('Error', 'Failed to update profile');
            }
        } else {
            Alert.alert('Error', 'Please enter a valid name');
        }
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
                    onPress={() => setNotificationModalVisible(true)}
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
                    onPress={() => setHelpModalVisible(true)}
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
            </View>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
                        <TextInput
                            style={[styles.modalInput, {
                                backgroundColor: theme.backgroundSecondary,
                                color: theme.text,
                                borderColor: theme.border
                            }]}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.textSecondary}
                            autoFocus={true}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.primary }]}
                                onPress={handleSaveName}
                            >
                                <Text style={[styles.saveButtonText, { color: theme.textInverse }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Notifications Modal */}
            <Modal
                visible={notificationModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setNotificationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Notifications</Text>
                            <TouchableOpacity onPress={() => setNotificationModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.notificationOption}>
                            <View style={styles.notificationInfo}>
                                <Ionicons name="notifications" size={22} color={theme.primary} />
                                <View style={styles.notificationText}>
                                    <Text style={[styles.notificationTitle, { color: theme.text }]}>Push Notifications</Text>
                                    <Text style={[styles.notificationDesc, { color: theme.textSecondary }]}>Receive push notifications</Text>
                                </View>
                            </View>
                            <Switch
                                value={pushNotifications}
                                onValueChange={setPushNotifications}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor={pushNotifications ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.notificationOption}>
                            <View style={styles.notificationInfo}>
                                <Ionicons name="add-circle" size={22} color={theme.primary} />
                                <View style={styles.notificationText}>
                                    <Text style={[styles.notificationTitle, { color: theme.text }]}>New Content</Text>
                                    <Text style={[styles.notificationDesc, { color: theme.textSecondary }]}>Alert when new tools/apps added</Text>
                                </View>
                            </View>
                            <Switch
                                value={newContentAlerts}
                                onValueChange={setNewContentAlerts}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor={newContentAlerts ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.notificationOption}>
                            <View style={styles.notificationInfo}>
                                <Ionicons name="refresh-circle" size={22} color={theme.primary} />
                                <View style={styles.notificationText}>
                                    <Text style={[styles.notificationTitle, { color: theme.text }]}>App Updates</Text>
                                    <Text style={[styles.notificationDesc, { color: theme.textSecondary }]}>Notify about app updates</Text>
                                </View>
                            </View>
                            <Switch
                                value={updateAlerts}
                                onValueChange={setUpdateAlerts}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor={updateAlerts ? '#FFFFFF' : '#f4f3f4'}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: theme.primary }]}
                            onPress={() => setNotificationModalVisible(false)}
                        >
                            <Text style={[styles.doneButtonText, { color: theme.textInverse }]}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Help & Support Modal */}
            <Modal
                visible={helpModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setHelpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Help & Support</Text>
                            <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.helpOption, { backgroundColor: theme.backgroundSecondary }]}
                            onPress={() => {
                                setHelpModalVisible(false);
                                navigation.navigate('About');
                            }}
                        >
                            <Ionicons name="information-circle" size={24} color={theme.primary} />
                            <View style={styles.helpOptionText}>
                                <Text style={[styles.helpOptionTitle, { color: theme.text }]}>About App</Text>
                                <Text style={[styles.helpOptionDesc, { color: theme.textSecondary }]}>Learn more about NextGenX Hub</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.helpOption, { backgroundColor: theme.backgroundSecondary }]}
                            onPress={() => {
                                setHelpModalVisible(false);
                                navigation.navigate('Feedback');
                            }}
                        >
                            <Ionicons name="chatbubble-ellipses" size={24} color={theme.primary} />
                            <View style={styles.helpOptionText}>
                                <Text style={[styles.helpOptionTitle, { color: theme.text }]}>Send Feedback</Text>
                                <Text style={[styles.helpOptionDesc, { color: theme.textSecondary }]}>Share your thoughts with us</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.helpOption, { backgroundColor: theme.backgroundSecondary }]}
                            onPress={() => Linking.openURL('mailto:nxgennxx@gmail.com')}
                        >
                            <Ionicons name="mail" size={24} color={theme.primary} />
                            <View style={styles.helpOptionText}>
                                <Text style={[styles.helpOptionTitle, { color: theme.text }]}>Contact Us</Text>
                                <Text style={[styles.helpOptionDesc, { color: theme.textSecondary }]}>nxgennxx@gmail.com</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.helpOption, { backgroundColor: theme.backgroundSecondary }]}
                            onPress={() => {
                                setHelpModalVisible(false);
                                navigation.navigate('PrivacyPolicy');
                            }}
                        >
                            <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
                            <View style={styles.helpOptionText}>
                                <Text style={[styles.helpOptionTitle, { color: theme.text }]}>Privacy Policy</Text>
                                <Text style={[styles.helpOptionDesc, { color: theme.textSecondary }]}>How we protect your data</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <View style={[styles.versionInfo, { borderTopColor: theme.border }]}>
                            <Text style={[styles.versionText, { color: theme.textSecondary }]}>
                                NextGenX Hub v1.0.0
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 100, // Extra padding to avoid bottom nav overlap
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    inputLabel: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSize.md,
        marginBottom: spacing.lg,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    saveButton: {},
    saveButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    notificationOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    notificationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.md,
    },
    notificationText: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    notificationDesc: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },
    doneButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    doneButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    helpOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    helpOptionText: {
        flex: 1,
    },
    helpOptionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    helpOptionDesc: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },
    versionInfo: {
        borderTopWidth: 1,
        paddingTop: spacing.md,
        marginTop: spacing.md,
        alignItems: 'center',
    },
    versionText: {
        fontSize: fontSize.sm,
    },
});
