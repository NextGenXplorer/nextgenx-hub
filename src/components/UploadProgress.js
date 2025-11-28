import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize, fontWeight, borderRadius } from '../theme/colors';
import { LoadingSpinner } from './LoadingSpinner';

const { width } = Dimensions.get('window');

export default function UploadProgress({ visible, progress = 0, message = 'Uploading...', onComplete }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const successAnim = useRef(new Animated.Value(0)).current;
    const confettiAnims = useRef([...Array(12)].map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (visible) {
            // Entry animation
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();

            // Rotation animation
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            scaleAnim.setValue(0);
            rotateAnim.setValue(0);
            successAnim.setValue(0);
        }
    }, [visible]);

    useEffect(() => {
        if (progress >= 100) {
            // Success animation
            Animated.sequence([
                Animated.spring(successAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.delay(500),
            ]).start(() => {
                // Confetti animation
                const confettiAnimations = confettiAnims.map((anim) =>
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    })
                );
                Animated.parallel(confettiAnimations).start(() => {
                    if (onComplete) {
                        setTimeout(onComplete, 500);
                    }
                });
            });
        }
    }, [progress]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const getStatusMessage = () => {
        if (progress >= 100) return 'Success!';
        if (progress >= 90) return 'Almost done...';
        if (progress >= 60) return 'Processing...';
        if (progress >= 30) return 'Uploading data...';
        return 'Preparing upload...';
    };

    const getGradientColors = () => {
        if (progress >= 100) return ['#4CAF50', '#81C784'];
        return ['#FF8C42', '#FFC107'];
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={getGradientColors()}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        {/* Confetti particles */}
                        {progress >= 100 && confettiAnims.map((anim, index) => {
                            const angle = (index / confettiAnims.length) * Math.PI * 2;
                            const translateX = anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, Math.cos(angle) * 100],
                            });
                            const translateY = anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, Math.sin(angle) * 100],
                            });
                            const opacity = anim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [1, 1, 0],
                            });

                            return (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.confetti,
                                        {
                                            backgroundColor: index % 3 === 0 ? '#FFD700' : index % 3 === 1 ? '#FF6B6B' : '#4CAF50',
                                            transform: [{ translateX }, { translateY }],
                                            opacity,
                                        },
                                    ]}
                                />
                            );
                        })}

                        {/* Progress Circle */}
                        <View style={styles.progressContainer}>
                            {progress < 100 ? (
                                <Animated.View style={{ transform: [{ rotate }] }}>
                                    <LoadingSpinner size={80} color="#FFFFFF" message="" />
                                </Animated.View>
                            ) : (
                                <Animated.View style={{ transform: [{ scale: successAnim }] }}>
                                    <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
                                </Animated.View>
                            )}
                        </View>

                        {/* Progress Percentage */}
                        <Text style={styles.percentage}>{Math.round(progress)}%</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        </View>

                        {/* Status Message */}
                        <Text style={styles.statusMessage}>{message || getStatusMessage()}</Text>

                        {/* Loading dots */}
                        {progress < 100 && (
                            <View style={styles.dotsContainer}>
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.85,
        maxWidth: 350,
    },
    gradient: {
        borderRadius: borderRadius.xxl,
        padding: spacing.xxl,
        alignItems: 'center',
    },
    progressContainer: {
        marginBottom: spacing.lg,
    },
    percentage: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.extrabold,
        color: '#FFFFFF',
        marginBottom: spacing.md,
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: borderRadius.round,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.round,
    },
    statusMessage: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        opacity: 0.7,
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        top: '50%',
        left: '50%',
    },
});
