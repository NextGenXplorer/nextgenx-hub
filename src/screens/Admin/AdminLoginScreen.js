import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { loginUser } from '../../services/firebase';

export default function AdminLoginScreen({ navigation }) {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            await loginUser(email, password);
            Alert.alert('Success', 'Logged in successfully!');
            navigation.replace('AdminDashboard');
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#FF8C42', '#FFC107']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={60} color="#FFFFFF" />
                    </View>
                    <Text style={styles.headerTitle}>ADMIN LOGIN</Text>
                    <Text style={styles.headerSubtitle}>Secure access to dashboard</Text>
                </View>
            </LinearGradient>

            {/* Login Form */}
            <View style={styles.formContainer}>
                <View style={[styles.inputCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                    <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
                        <Ionicons name="mail" size={20} color={theme.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="admin@nextgenx.com"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={[styles.inputCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                    <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
                        <Ionicons name="lock-closed" size={20} color={theme.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor={theme.textSecondary}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={20}
                                color={theme.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.loginButton,
                        { backgroundColor: theme.primary },
                        shadows.medium,
                        loading && styles.loginButtonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <Text style={styles.loginButtonText}>Logging in...</Text>
                    ) : (
                        <>
                            <Text style={styles.loginButtonText}>Login</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xxl,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: borderRadius.xxl,
        borderBottomRightRadius: borderRadius.xxl,
        marginBottom: spacing.xl,
    },
    headerContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.extrabold,
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: fontSize.md,
        color: '#FFFFFF',
        opacity: 0.9,
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSize.md,
        paddingVertical: spacing.sm,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
    forgotPasswordText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
});
