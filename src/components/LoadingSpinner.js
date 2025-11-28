import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize, fontWeight } from '../theme/colors';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

export const LoadingSpinner = ({ message = 'Loading...', size = 48, color }) => {
    const { theme } = useTheme();
    const strokeColor = color || theme.primary;
    const dashOffset = useRef(new Animated.Value(192)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.parallel([
                    // Stroke Dash Offset Animation: 192 -> 0 over 1.4s
                    Animated.timing(dashOffset, {
                        toValue: 0,
                        duration: 1400,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    // Opacity Animation: 1 -> 0 over first 72.5% (approx 1015ms)
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 1015, // 72.5% of 1400
                            easing: Easing.linear,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 385, // Remaining time
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        };

        animate();
    }, []);

    // Points for the polyline shape
    const points = "12 2 12 22 22 12 2 12";

    return (
        <View style={styles.container}>
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size} viewBox="0 0 24 24">
                    {/* Background Polyline (Static) */}
                    <Polyline
                        points={points}
                        fill="none"
                        stroke={`${strokeColor}33`} // 20% opacity approx
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Foreground Polyline (Animated) */}
                    <AnimatedPolyline
                        points={points}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={[48, 144]}
                        strokeDashoffset={dashOffset}
                        opacity={opacity}
                    />
                </Svg>
            </View>

            {message && (
                <Text style={[styles.message, { color: theme.textSecondary }]}>
                    {message}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    message: {
        marginTop: spacing.md,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        textAlign: 'center',
    },
});
