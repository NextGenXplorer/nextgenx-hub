import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { submitFeedback } from '../../services/firebase';

export default function FeedbackScreen() {
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter your message');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await submitFeedback({
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
                status: 'new'
            });

            Alert.alert(
                'Thank You!',
                'Your feedback has been submitted successfully. We appreciate your input!',
                [{ text: 'OK' }]
            );

            // Reset form
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            Alert.alert('Error', 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with Gradient */}
                <LinearGradient
                    colors={[theme.primary, theme.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={[styles.headerTitle, { color: theme.textInverse }]}>FEEDBACK</Text>
                            <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>We'd love to hear from you</Text>
                        </View>
                        <Ionicons name="chatbubbles" size={60} color={theme.textInverse} style={{ opacity: 0.9 }} />
                    </View>
                </LinearGradient>

                {/* Form */}
                <View style={styles.formContainer}>
                    <View style={[styles.inputCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                        <Text style={[styles.label, { color: theme.text }]}>Name</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            placeholderTextColor={theme.textSecondary}
                        />
                    </View>

                    <View style={[styles.inputCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={[styles.inputCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                        <Text style={[styles.label, { color: theme.text }]}>Message</Text>
                        <TextInput
                            style={[styles.textArea, { color: theme.text, borderColor: theme.border }]}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Tell us what you think..."
                            placeholderTextColor={theme.textSecondary}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.primary },
                            shadows.medium,
                            loading && { opacity: 0.7 }
                        ]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Sending...' : 'Send Feedback'}
                        </Text>
                        <Ionicons name={loading ? 'hourglass' : 'send'} size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: borderRadius.xxl,
        borderBottomRightRadius: borderRadius.xxl,
        marginBottom: spacing.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.extrabold,
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: fontSize.md,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: spacing.xs,
    },
    formContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    inputCard: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    input: {
        fontSize: fontSize.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    textArea: {
        fontSize: fontSize.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        minHeight: 120,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    submitButtonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
});
