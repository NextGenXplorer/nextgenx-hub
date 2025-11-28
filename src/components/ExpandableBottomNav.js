import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../theme/colors';

const ExpandableBottomNav = ({ navigation, activeRoute = 'Home' }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState(activeRoute);

    const navItems = [
        { id: 'Home', icon: 'home', label: 'Home', screen: 'Home' },
        { id: 'Tools', icon: 'grid-outline', label: 'Tools', screen: 'Tools' },
        { id: 'Bookmarks', icon: 'heart-outline', label: 'Saved', screen: 'Bookmarks' },
        { id: 'Profile', icon: 'person-outline', label: 'Profile', screen: 'Profile' },
    ];

    const NavButton = ({ item }) => {
        const isActive = activeTab === item.id;
        const animatedWidth = useRef(new Animated.Value(isActive ? 1 : 0)).current;
        const animatedPadding = useRef(new Animated.Value(isActive ? 1 : 0)).current;

        useEffect(() => {
            Animated.spring(animatedWidth, {
                toValue: isActive ? 1 : 0,
                useNativeDriver: false,
                tension: 50,
                friction: 7,
            }).start();

            Animated.spring(animatedPadding, {
                toValue: isActive ? 1 : 0,
                useNativeDriver: false,
                tension: 50,
                friction: 7,
            }).start();
        }, [isActive]);

        const paddingHorizontal = animatedPadding.interpolate({
            inputRange: [0, 1],
            outputRange: [spacing.sm, spacing.lg],
        });

        const handlePress = () => {
            setActiveTab(item.id);
            navigation.navigate(item.screen);
        };

        return (
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Animated.View
                    style={[
                        styles.navButton,
                        {
                            backgroundColor: isActive ? theme.backgroundSecondary : 'transparent',
                            paddingHorizontal,
                        },
                    ]}
                >
                    <Ionicons
                        name={item.icon}
                        size={22}
                        color={isActive ? theme.text : theme.textSecondary}
                    />
                    <Animated.View
                        style={{
                            width: animatedWidth.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 60],
                            }),
                            opacity: animatedWidth,
                            overflow: 'hidden',
                        }}
                    >
                        <Text
                            style={[
                                styles.navLabel,
                                {
                                    color: isActive ? theme.text : theme.textSecondary,
                                    fontWeight: isActive ? fontWeight.semibold : fontWeight.medium,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {item.label}
                        </Text>
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundCard }, shadows.large]}>
            {navItems.map((item) => (
                <NavButton key={item.id} item={item} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderTopLeftRadius: borderRadius.xxl,
        borderTopRightRadius: borderRadius.xxl,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        gap: spacing.xs,
    },
    navLabel: {
        fontSize: fontSize.sm,
        marginLeft: spacing.xs,
    },
});

export default ExpandableBottomNav;
