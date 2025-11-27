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
        if (user) {
            initializeFCM(user.uid);
        }

        // Handle foreground notifications
        const unsubscribeForeground = onForegroundMessage((remoteMessage) => {
            console.log('Foreground notification received:', remoteMessage);
        });

        // Handle notification opened app
        onNotificationOpenedApp((remoteMessage) => {
            console.log('Notification opened app:', remoteMessage);
        });

        return () => {
            if (unsubscribeForeground) {
                unsubscribeForeground();
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
