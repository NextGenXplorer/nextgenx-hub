import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../theme/colors';

export const LoadingSpinner = ({ message = 'Loading...', type = 'general' }) => {
    const { theme } = useTheme();
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const dotOpacity1 = useRef(new Animated.Value(0)).current;
    const dotOpacity2 = useRef(new Animated.Value(0)).current;
    const dotOpacity3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Spin animation
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.2,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Dot animation
        const dotAnimation = Animated.loop(
            Animated.stagger(300, [
                Animated.sequence([
                    Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dotOpacity1, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dotOpacity2, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(dotOpacity3, { toValue: 0, duration: 300, useNativeDriver: true }),
                ]),
            ])
        );
        dotAnimation.start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const getGradientColors = () => {
        switch (type) {
            case 'tool':
                return ['#FF8C42', '#FFB380'];
            case 'app':
                return ['#FFC107', '#FFD54F'];
            case 'video':
                return ['#FF8C42', '#FFC107'];
            default:
                return [theme.primary, theme.accent1];
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'tool':
                return 'construct';
            case 'app':
                return 'apps';
            case 'video':
                return 'play-circle';
            default:
                return 'hourglass';
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            >
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            transform: [{ rotate: spin }, { scale: pulseValue }],
                        },
                    ]}
                >
                    <Ionicons name={getIcon()} size={60} color="#FFFFFF" />
                </Animated.View>

                <Text style={styles.message}>{message}</Text>

                <View style={styles.dotsContainer}>
                    <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
                    <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
                    <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientBackground: {
        width: 200,
        height: 200,
        borderRadius: borderRadius.xxl,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    iconContainer: {
        marginBottom: spacing.md,
    },
    message: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
});
