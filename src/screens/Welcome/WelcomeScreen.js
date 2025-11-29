import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';

export default function WelcomeScreen({ onComplete }) {
    const { theme } = useTheme();
    const [name, setName] = useState('');

    const handleContinue = async () => {
        if (name.trim()) {
            try {
                await AsyncStorage.setItem('userName', name.trim());
                await AsyncStorage.setItem('hasCompletedWelcome', 'true');
                onComplete();
            } catch (error) {
                console.error('Error saving name:', error);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Welcome Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="hand-right" size={80} color={theme.textInverse} />
                    </View>

                    {/* Welcome Text */}
                    <Text style={[styles.title, { color: theme.textInverse }]}>Welcome to NextGenX!</Text>
                    <Text style={[styles.subtitle, { color: theme.textInverse }]}>Let's get to know you better</Text>

                    {/* Name Input Card */}
                    <View style={[styles.inputCard, shadows.large]}>
                        <Text style={[styles.label, { color: theme.text }]}>What's your name?</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person" size={24} color={theme.primary} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={theme.textSecondary}
                                autoFocus
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                { backgroundColor: theme.primary },
                                !name.trim() && styles.continueButtonDisabled,
                                shadows.medium
                            ]}
                            onPress={handleContinue}
                            disabled={!name.trim()}
                        >
                            <Text style={[styles.continueButtonText, { color: theme.textInverse }]}>Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color={theme.textInverse} />
                        </TouchableOpacity>
                    </View>

                    {/* Features Preview */}
                    <View style={styles.features}>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.textInverse} />
                            <Text style={[styles.featureText, { color: theme.textInverse }]}>Access amazing tools</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.textInverse} />
                            <Text style={[styles.featureText, { color: theme.textInverse }]}>Discover great apps</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="checkmark-circle" size={24} color={theme.textInverse} />
                            <Text style={[styles.featureText, { color: theme.textInverse }]}>Watch helpful content</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    iconContainer: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.extrabold,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.lg,
        textAlign: 'center',
        opacity: 0.9,
        marginBottom: spacing.xxl,
    },
    inputCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSize.lg,
        paddingVertical: spacing.md,
        color: '#2C2C2C',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    features: {
        gap: spacing.md,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    featureText: {
        fontSize: fontSize.md,
        opacity: 0.9,
    },
});
