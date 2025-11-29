import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, shadows } from '../theme/colors';

const { width } = Dimensions.get('window');

const navItems = [
    { id: 'home', label: 'Home', icon: 'home', screen: 'Home' },
    { id: 'tools', label: 'Tools', icon: 'grid', screen: 'Tools' },
    { id: 'qr', label: 'QR Code', icon: 'qr-code', screen: 'QRGenerator' },
    { id: 'youtube', label: 'Videos', icon: 'play-circle', screen: 'YouTube' },
    { id: 'profile', label: 'Profile', icon: 'person', screen: 'Profile' },
];

export default function BottomNavigation({ navigation, currentScreen }) {
    const { theme } = useTheme();
    const currentIndex = navItems.findIndex(item => item.screen === currentScreen);
    const initialIndex = currentIndex >= 0 ? currentIndex : 0;
    const [activeTab, setActiveTab] = useState(initialIndex);

    // Single animation value per item for smooth transitions
    const animations = useRef(
        navItems.map((_, index) => new Animated.Value(index === initialIndex ? 1 : 0))
    ).current;

    // Animate tabs when activeTab changes
    useEffect(() => {
        navItems.forEach((_, index) => {
            Animated.timing(animations[index], {
                toValue: index === activeTab ? 1 : 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        });
    }, [activeTab]);

    // Sync activeTab with currentScreen when navigating
    useEffect(() => {
        const newIndex = navItems.findIndex(item => item.screen === currentScreen);
        if (newIndex !== -1 && newIndex !== activeTab) {
            setActiveTab(newIndex);
        }
    }, [currentScreen]);

    // Don't render if navigation is not ready
    if (!navigation) return null;

    const handleTabPress = (index, screen) => {
        setActiveTab(index);
        navigation.navigate(screen);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.navBar, { backgroundColor: theme.backgroundCard }, shadows.large]}>
                {navItems.map((item, index) => {
                    const isActive = activeTab === index;
                    const animValue = animations[index];

                    // Interpolate background color
                    const backgroundColor = animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(0,0,0,0)', `${theme.primary}15`],
                    });

                    // Interpolate label width
                    const labelWidth = animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 60],
                    });

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.navItem}
                            onPress={() => handleTabPress(index, item.screen)}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                style={[
                                    styles.navItemBackground,
                                    { backgroundColor },
                                ]}
                            />

                            <Ionicons
                                name={item.icon}
                                size={22}
                                color={isActive ? theme.primary : theme.textSecondary}
                                style={{ zIndex: 1 }}
                            />

                            <Animated.View
                                style={{
                                    width: labelWidth,
                                    opacity: animValue,
                                    overflow: 'hidden',
                                    marginLeft: isActive ? 8 : 0,
                                    zIndex: 1,
                                }}
                            >
                                <Text
                                    style={[
                                        styles.label,
                                        { color: theme.primary }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.label}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: 'transparent',
        pointerEvents: 'box-none',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 60,
        borderRadius: 30,
        paddingHorizontal: spacing.xs,
        minWidth: 320,
        maxWidth: width - spacing.lg * 2,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 44,
        minHeight: 40,
        maxHeight: 44,
        position: 'relative',
    },
    navItemBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        zIndex: 0,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
    },
});
