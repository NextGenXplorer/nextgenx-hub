// Polyfill for TextEncoder (required for QR code generation)
import 'text-encoding';

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { BookmarkProvider } from './src/context/BookmarkContext';
import AppNavigator from './src/navigation/AppNavigator';
import WelcomeScreen from './src/screens/Welcome/WelcomeScreen';
import { initializeFCM, onForegroundMessage, onNotificationOpenedApp } from './src/utils/notifications';
import { useAuth } from './src/context/AuthContext';

// FCM Initialization Component
function FCMInitializer() {
    const { user } = useAuth();

    useEffect(() => {
        // Initialize FCM for ALL users (logged in or not)
        // Pass userId if available for user-specific notifications
        const userId = user?.uid || null;

        console.log('Initializing FCM...', userId ? `for user: ${userId}` : 'for anonymous user');
        initializeFCM(userId);

        // Handle foreground notifications
        const unsubscribeForeground = onForegroundMessage((notification) => {
            console.log('Foreground notification received:', notification);
            // You can add custom handling here, e.g., show in-app alert
            const { title, body } = notification.request.content;
            console.log(`Notification: ${title} - ${body}`);
        });

        // Handle notification opened app (user tapped notification)
        const unsubscribeResponse = onNotificationOpenedApp((response) => {
            console.log('Notification opened app:', response);
            const data = response.notification.request.content.data;

            // Handle navigation based on notification data
            if (data?.screen) {
                console.log('Navigate to screen:', data.screen);
                // Add navigation logic here if needed
            }
            if (data?.itemId) {
                console.log('Open item:', data.itemId);
            }
        });

        return () => {
            if (unsubscribeForeground && unsubscribeForeground.remove) {
                unsubscribeForeground.remove();
            }
            if (unsubscribeResponse && unsubscribeResponse.remove) {
                unsubscribeResponse.remove();
            }
        };
    }, [user]);

    return null;
}

function AppContent() {
    const [hasCompletedWelcome, setHasCompletedWelcome] = useState(null);

    useEffect(() => {
        checkWelcomeStatus();
    }, []);

    const checkWelcomeStatus = async () => {
        try {
            const completed = await AsyncStorage.getItem('hasCompletedWelcome');
            setHasCompletedWelcome(completed === 'true');
        } catch (error) {
            console.error('Error checking welcome status:', error);
            setHasCompletedWelcome(false);
        }
    };

    const handleWelcomeComplete = () => {
        setHasCompletedWelcome(true);
    };

    // Show loading state while checking
    if (hasCompletedWelcome === null) {
        return null;
    }

    // Show welcome screen if not completed
    if (!hasCompletedWelcome) {
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }

    // Show main app
    return (
        <>
            <FCMInitializer />
            <StatusBar style="auto" />
            <AppNavigator />
        </>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <AuthProvider>
                    <BookmarkProvider>
                        <AppContent />
                    </BookmarkProvider>
                </AuthProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
