import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius } from '../theme/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

export default function SkeletonLoader({ type = 'tool', count = 6 }) {
    const { theme } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    const renderToolSkeleton = () => (
        <View style={[styles.toolCard, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.shimmerContainer}>
                <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shimmerGradient}
                    />
                </Animated.View>
            </View>
            <View style={[styles.toolIcon, { backgroundColor: theme.accent3 }]} />
            <View style={styles.toolInfo}>
                <View style={[styles.skeletonText, styles.titleText, { backgroundColor: theme.border }]} />
                <View style={[styles.skeletonText, styles.descriptionText, { backgroundColor: theme.border }]} />
            </View>
        </View>
    );

    const renderAppSkeleton = () => (
        <View style={[styles.appCard, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.shimmerContainer}>
                <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shimmerGradient}
                    />
                </Animated.View>
            </View>
            <View style={[styles.appIconContainer, { backgroundColor: theme.accent3 }]} />
            <View style={[styles.skeletonText, styles.appName, { backgroundColor: theme.border }]} />
            <View style={[styles.skeletonButton, { backgroundColor: theme.accent3 }]} />
        </View>
    );

    const renderVideoSkeleton = () => (
        <View style={[styles.videoCard, { backgroundColor: theme.backgroundCard }]}>
            <View style={styles.shimmerContainer}>
                <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shimmerGradient}
                    />
                </Animated.View>
            </View>
            <View style={[styles.thumbnail, { backgroundColor: theme.accent1 }]} />
            <View style={styles.videoInfo}>
                <View style={[styles.skeletonText, styles.videoTitle, { backgroundColor: theme.border }]} />
                <View style={[styles.skeletonText, styles.videoDescription, { backgroundColor: theme.border }]} />
            </View>
        </View>
    );

    const renderSkeleton = () => {
        switch (type) {
            case 'tool':
                return renderToolSkeleton();
            case 'app':
                return renderAppSkeleton();
            case 'video':
                return renderVideoSkeleton();
            default:
                return renderToolSkeleton();
        }
    };

    const containerStyle = type === 'app' ? styles.gridContainer : styles.listContainer;

    return (
        <View style={containerStyle}>
            {[...Array(count)].map((_, index) => (
                <View key={index}>{renderSkeleton()}</View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: spacing.lg,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.lg,
        justifyContent: 'space-between',
    },
    shimmerContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: borderRadius.xl,
    },
    shimmer: {
        width: '100%',
        height: '100%',
    },
    shimmerGradient: {
        flex: 1,
    },
    // Tool skeleton styles
    toolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        gap: spacing.md,
        position: 'relative',
        overflow: 'hidden',
    },
    toolIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
    },
    toolInfo: {
        flex: 1,
    },
    // App skeleton styles
    appCard: {
        width: cardWidth,
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    appIconContainer: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    appName: {
        width: '80%',
        height: 16,
        marginBottom: spacing.sm,
    },
    skeletonButton: {
        width: 60,
        height: 24,
        borderRadius: borderRadius.md,
    },
    // Video skeleton styles
    videoCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        gap: spacing.md,
        position: 'relative',
        overflow: 'hidden',
    },
    thumbnail: {
        width: 120,
        height: 80,
        borderRadius: borderRadius.md,
    },
    videoInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    videoTitle: {
        width: '90%',
        height: 16,
        marginBottom: spacing.xs,
    },
    videoDescription: {
        width: '70%',
        height: 12,
    },
    // Common skeleton text styles
    skeletonText: {
        borderRadius: borderRadius.sm,
    },
    titleText: {
        width: '60%',
        height: 18,
        marginBottom: 4,
    },
    descriptionText: {
        width: '80%',
        height: 14,
    },
});
