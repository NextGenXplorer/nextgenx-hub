import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ToolsScreen from '../screens/Tools/ToolsScreen';
import YouTubeScreen from '../screens/YouTube/YouTubeScreen';
import VideoPlayerScreen from '../screens/YouTube/VideoPlayerScreen';
import AppsScreen from '../screens/Apps/AppsScreen';
import AboutScreen from '../screens/About/AboutScreen';
import FeedbackScreen from '../screens/Feedback/FeedbackScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import QRGeneratorScreen from '../screens/QRGenerator/QRGeneratorScreen';
import AdminLoginScreen from '../screens/Admin/AdminLoginScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import ToolsManager from '../screens/Admin/ToolsManager';
import YouTubeManager from '../screens/Admin/YouTubeManager';
import AppsManager from '../screens/Admin/AppsManager';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { theme } = useTheme();

    const screenOptions = {
        headerStyle: {
            backgroundColor: theme.backgroundCard,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
            fontWeight: 'bold',
        },
        headerRight: () => <ThemeToggle />,
    };

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'NextGenX Hub' }} />
                <Stack.Screen name="Tools" component={ToolsScreen} options={{ title: 'Tools' }} />
                <Stack.Screen name="YouTube" component={YouTubeScreen} options={{ title: 'YouTube Hub' }} />
                <Stack.Screen
                    name="VideoPlayer"
                    component={VideoPlayerScreen}
                    options={{ title: 'Watch Video' }}
                />
                <Stack.Screen name="Apps" component={AppsScreen} options={{ title: 'App Links' }} />
                <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
                <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
                <Stack.Screen name="QRGenerator" component={QRGeneratorScreen} options={{ title: 'QR Generator' }} />
                <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Login', headerRight: () => null }} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin Dashboard' }} />
                <Stack.Screen name="ToolsManager" component={ToolsManager} options={{ title: 'Manage Tools' }} />
                <Stack.Screen name="YouTubeManager" component={YouTubeManager} options={{ title: 'Manage Videos' }} />
                <Stack.Screen name="AppsManager" component={AppsManager} options={{ title: 'Manage Apps' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
