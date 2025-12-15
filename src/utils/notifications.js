// Push Notification Service using Native FCM + Expo Notifications
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configuration
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const FCM_TOKEN_KEY = 'push_token';
const TOKEN_TYPE_KEY = 'push_token_type';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async () => {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return false;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permission denied');
            return false;
        }

        // Android needs notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('nextgenx_channel', {
                name: 'NextGenX Notifications',
                description: 'NextGenX Hub - Updates and Alerts',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF8C42',
                sound: 'default',
                enableLights: true,
                enableVibrate: true,
                showBadge: true,
            });
        }

        console.log('Notification permission granted');
        return true;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Get Push Token - Native FCM for production, Expo token for development
 * This is the KEY fix: Use getDevicePushTokenAsync() for native FCM tokens
 */
export const getPushToken = async () => {
    try {
        // Check cached token first
        const cachedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
        const cachedType = await AsyncStorage.getItem(TOKEN_TYPE_KEY);
        if (cachedToken) {
            console.log(`Using cached ${cachedType || 'unknown'} token`);
            return { token: cachedToken, type: cachedType || 'unknown' };
        }

        if (!Device.isDevice) {
            console.log('Push tokens require a physical device');
            return null;
        }

        let token;
        let tokenType;

        // Try to get native FCM token first (works in standalone APK/AAB)
        try {
            const deviceToken = await Notifications.getDevicePushTokenAsync();
            token = deviceToken.data;
            tokenType = 'fcm';
            console.log('FCM Push Token (Production):', token.substring(0, 30) + '...');
        } catch (deviceTokenError) {
            // Fallback to Expo token for Expo Go development
            console.log('Could not get FCM token, falling back to Expo token (Development)');
            console.log('DeviceToken error:', deviceTokenError.message);

            try {
                // Get project ID from app config
                const projectId = Constants.expoConfig?.extra?.eas?.projectId ||
                    Constants.easConfig?.projectId;

                if (!projectId) {
                    console.log('Project ID not found. Configure EAS for push notifications.');
                    return null;
                }

                const expoPushToken = await Notifications.getExpoPushTokenAsync({
                    projectId,
                });
                token = expoPushToken.data;
                tokenType = 'expo';
                console.log('Expo Push Token (Development):', token.substring(0, 30) + '...');
            } catch (expoTokenError) {
                console.error('Error getting Expo push token:', expoTokenError);
                return null;
            }
        }

        if (token) {
            // Cache the token and type
            await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
            await AsyncStorage.setItem(TOKEN_TYPE_KEY, tokenType);
        }

        return { token, type: tokenType };
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
};

/**
 * Register device token with backend
 */
export const registerDeviceToken = async (userId = null) => {
    try {
        const tokenData = await getPushToken();
        if (!tokenData || !tokenData.token) {
            console.log('No push token available');
            return false;
        }

        const { token, type } = tokenData;

        const deviceInfo = {
            platform: Platform.OS,
            deviceName: Device.deviceName || 'Unknown',
            appVersion: Constants.expoConfig?.version || '1.0.0',
            osVersion: Platform.Version,
        };

        const response = await fetch(`${BACKEND_URL}/api/devices/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
                tokenType: type,
                userId,
                deviceInfo,
            }),
        });

        const data = await response.json();

        if (data.success) {
            console.log(`Device registered successfully (${type} token)`);
            return true;
        } else {
            console.error('Device registration failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Error registering device:', error);
        return false;
    }
};

/**
 * Unregister device token (on logout)
 */
export const unregisterDeviceToken = async () => {
    try {
        const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
        if (!token) return true;

        const response = await fetch(`${BACKEND_URL}/api/devices/unregister`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        await AsyncStorage.removeItem(FCM_TOKEN_KEY);
        await AsyncStorage.removeItem(TOKEN_TYPE_KEY);
        console.log('Device unregistered');
        return true;
    } catch (error) {
        console.error('Error unregistering device:', error);
        return false;
    }
};

/**
 * Clear cached token (useful when token becomes invalid)
 */
export const clearCachedToken = async () => {
    try {
        await AsyncStorage.removeItem(FCM_TOKEN_KEY);
        await AsyncStorage.removeItem(TOKEN_TYPE_KEY);
        console.log('Cached token cleared');
        return true;
    } catch (error) {
        console.error('Error clearing cached token:', error);
        return false;
    }
};

/**
 * Add foreground notification listener
 */
export const addNotificationReceivedListener = (callback) => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        callback(notification);
    });
    return subscription;
};

/**
 * Add notification response listener (when user taps notification)
 */
export const addNotificationResponseListener = (callback) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification tapped:', response);
        callback(response);
    });
    return subscription;
};

/**
 * Get last notification response (app opened from notification)
 */
export const getLastNotificationResponse = async () => {
    try {
        const response = await Notifications.getLastNotificationResponseAsync();
        return response;
    } catch (error) {
        console.error('Error getting last notification:', error);
        return null;
    }
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (title, body, data = {}, trigger = null) => {
    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: 'default',
            },
            trigger: trigger || null, // null = immediate
        });
        console.log('Local notification scheduled:', id);
        return id;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (notificationId) => {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        return true;
    } catch (error) {
        console.error('Error canceling notification:', error);
        return false;
    }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        return true;
    } catch (error) {
        console.error('Error canceling all notifications:', error);
        return false;
    }
};

/**
 * Get badge count
 */
export const getBadgeCount = async () => {
    try {
        return await Notifications.getBadgeCountAsync();
    } catch (error) {
        return 0;
    }
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count) => {
    try {
        await Notifications.setBadgeCountAsync(count);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Save notification settings
 */
export const saveNotificationSettings = async (settings) => {
    try {
        await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving notification settings:', error);
        return false;
    }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async () => {
    try {
        const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : {
            enabled: true,
            newTools: true,
            newApps: true,
            newVideos: true,
            updates: true,
        };
    } catch (error) {
        console.error('Error getting notification settings:', error);
        return null;
    }
};

/**
 * Initialize push notifications
 */
export const initializePushNotifications = async (userId = null) => {
    try {
        console.log('Initializing push notifications...');

        // Request permission
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.log('Push notification permission not granted');
            return false;
        }

        // Register device with backend
        const registered = await registerDeviceToken(userId);
        if (!registered) {
            console.log('Failed to register device token');
            // Don't return false - token might still work locally
        }

        console.log('Push notifications initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing push notifications:', error);
        return false;
    }
};

// Legacy exports for backwards compatibility
export const getFCMToken = getPushToken;
export const registerFCMToken = registerDeviceToken;
export const onForegroundMessage = addNotificationReceivedListener;
export const onNotificationOpenedApp = addNotificationResponseListener;
export const getInitialNotification = getLastNotificationResponse;
export const initializeFCM = initializePushNotifications;
