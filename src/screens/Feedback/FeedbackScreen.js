import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';

export default function FeedbackScreen() {
    const { theme } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        console.log('Feedback submitted:', { name, email, message });
        // Reset form
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with Gradient */}
                <LinearGradient
                    colors={['#FF8C42', '#FFB380']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>FEEDBACK</Text>
                            <Text style={styles.headerSubtitle}>We'd love to hear from you</Text>
                        </View>
                        <Ionicons name="chatbubbles" size={60} color="#FFFFFF" style={{ opacity: 0.9 }} />
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
                        style={[styles.submitButton, { backgroundColor: theme.primary }, shadows.medium]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Send Feedback</Text>
                        <Ionicons name="send" size={20} color="#FFFFFF" />
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
