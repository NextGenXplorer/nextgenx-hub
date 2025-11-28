import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../../services/firebase';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function AppsManager({ navigation }) {
    const { theme } = useTheme();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // ... (form fields)

    // ... (useEffect and loadApps)

    // ... (handleAdd, handleEdit, handleSave)

    const handleDelete = (app) => {
        Alert.alert(
            'Delete App',
            `Are you sure you want to delete "${app.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteDocument('apps', app.id);
                            // Alert.alert('Success', 'App deleted successfully');
                            loadApps();
                        } catch (error) {
                            console.error('Error deleting app:', error);
                            Alert.alert('Error', 'Failed to delete app');
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    // ... (renderAppItem)

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                <LoadingSpinner message="Loading apps..." />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* ... (header and list) */}

            {/* Deletion Loading Modal */}
            <Modal
                visible={deleting}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, alignItems: 'center', padding: spacing.xl, borderRadius: borderRadius.xl, marginHorizontal: spacing.xl }]}>
                        <LoadingSpinner message="Deleting app..." />
                    </View>
                </View>
            </Modal>

            <UploadProgress
                visible={uploading}
                progress={uploadProgress}
                onComplete={() => setUploading(false)}
            />
        </View>
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
        marginBottom: spacing.md,
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
    listContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    appCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    appIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appInfo: {
        flex: 1,
    },
    appName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    appDescription: {
        fontSize: fontSize.sm,
        marginBottom: spacing.xs,
    },
    appUrl: {
        fontSize: fontSize.xs,
    },
    appActions: {
        flexDirection: 'column',
        gap: spacing.sm,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        fontSize: fontSize.md,
        marginTop: spacing.md,
    },
    fabButton: {
        position: 'absolute',
        bottom: spacing.xl,
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.xxl,
        borderTopRightRadius: borderRadius.xxl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    modalBody: {
        padding: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
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
    },
    textArea: {
        fontSize: fontSize.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    saveButtonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
});
