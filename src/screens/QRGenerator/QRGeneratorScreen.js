import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export default function QRGeneratorScreen() {
    const { theme } = useTheme();
    const [url, setUrl] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState('');
    const viewShotRef = useRef();

    const handleGenerate = () => {
        if (url.trim()) {
            setGeneratedUrl(url);
        }
    };

    const handleSaveQR = async () => {
        try {
            // Request permission
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please grant permission to save images to your gallery.');
                return;
            }

            // Capture the QR code
            const uri = await viewShotRef.current.capture();

            // Save to gallery
            await MediaLibrary.saveToLibraryAsync(uri);

            Alert.alert('Success', 'QR Code saved to gallery!');
        } catch (error) {
            console.error('Error saving QR code:', error);
            Alert.alert('Error', 'Failed to save QR code. Please try again.');
        }
    };

    const handleShareQR = async () => {
        try {
            await Share.share({
                message: `QR Code Content: ${generatedUrl}`,
                title: 'Share QR Code',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#FF8C42', '#FFC107']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>QR CODE</Text>
                        <Text style={styles.headerSubtitle}>Generate QR codes instantly</Text>
                    </View>
                    <Ionicons name="qr-code" size={60} color="#FFFFFF" style={{ opacity: 0.9 }} />
                </View>
            </LinearGradient>

            {/* Input Section */}
            <View style={styles.content}>
                <View style={[styles.inputCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <Text style={[styles.label, { color: theme.text }]}>Enter URL or Text</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        value={url}
                        onChangeText={setUrl}
                        placeholder="https://example.com"
                        placeholderTextColor={theme.textSecondary}
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={[styles.generateButton, { backgroundColor: theme.primary }, shadows.medium]}
                        onPress={handleGenerate}
                    >
                        <Text style={styles.generateButtonText}>Generate QR Code</Text>
                        <Ionicons name="flash" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* QR Code Display */}
                {generatedUrl ? (
                    <View style={[styles.qrCard, { backgroundColor: theme.backgroundCard }, shadows.large]}>
                        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                            <View style={styles.qrContainer}>
                                <QRCode
                                    value={generatedUrl}
                                    size={200}
                                    color={theme.text}
                                    backgroundColor="#FFFFFF"
                                />
                            </View>
                        </ViewShot>
                        <Text style={[styles.qrUrl, { color: theme.textSecondary }]} numberOfLines={2}>
                            {generatedUrl}
                        </Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                                onPress={handleSaveQR}
                            >
                                <Ionicons name="download" size={20} color={theme.primary} />
                                <Text style={[styles.actionButtonText, { color: theme.primary }]}>Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                                onPress={handleShareQR}
                            >
                                <Ionicons name="share-social" size={20} color={theme.primary} />
                                <Text style={[styles.actionButtonText, { color: theme.primary }]}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.placeholderCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                        <Ionicons name="qr-code-outline" size={80} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                            Your QR code will appear here
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
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
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    inputCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
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
        marginBottom: spacing.md,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    generateButtonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
    qrCard: {
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    qrContainer: {
        padding: spacing.lg,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    qrUrl: {
        fontSize: fontSize.sm,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    actionButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    placeholderCard: {
        padding: spacing.xxl,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        minHeight: 300,
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: fontSize.md,
        marginTop: spacing.md,
    },
});
