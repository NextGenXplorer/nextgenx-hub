import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../../services/firebase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import UploadProgress from '../../components/UploadProgress';
import { extractPlayStoreIcon, isPlayStoreUrl, extractPackageName } from '../../utils/extractPlayStoreIcon';

export default function AppsManager({ navigation }) {
    const { theme } = useTheme();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [extractingIcon, setExtractingIcon] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('apps');

    const iconOptions = [
        'apps', 'game-controller', 'musical-notes', 'camera', 'cart',
        'fitness', 'book', 'restaurant', 'car', 'airplane',
        'heart', 'chatbubbles', 'mail', 'calendar', 'calculator'
    ];

    useEffect(() => {
        loadApps();
    }, []);

    // Auto-extract icon when URL changes
    useEffect(() => {
        if (url && isPlayStoreUrl(url)) {
            handleAutoExtractIcon();
        }
    }, [url]);

    const loadApps = async () => {
        try {
            const data = await getAllDocuments('apps');
            setApps(data);
        } catch (error) {
            console.error('Error loading apps:', error);
            Alert.alert('Error', 'Failed to load apps');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoExtractIcon = async () => {
        setExtractingIcon(true);
        try {
            const extractedIconUrl = await extractPlayStoreIcon(url);
            if (extractedIconUrl) {
                setIconUrl(extractedIconUrl);
                Alert.alert('Success', 'App icon automatically extracted from Play Store!');
            } else {
                Alert.alert('Info', 'Could not auto-extract icon. You can select an icon or upload manually.');
            }
        } catch (error) {
            console.error('Error extracting icon:', error);
        } finally {
            setExtractingIcon(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please grant permission to access your photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                // For now, we'll use the local URI
                // In production, you'd upload this to Firebase Storage
                setIconUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleAdd = () => {
        setEditingApp(null);
        setName('');
        setDescription('');
        setUrl('');
        setIconUrl('');
        setSelectedIcon('apps');
        setModalVisible(true);
    };

    const handleEdit = (app) => {
        setEditingApp(app);
        setName(app.name || '');
        setDescription(app.description || '');
        setUrl(app.url || '');
        setIconUrl(app.iconUrl || '');
        setSelectedIcon(app.icon || 'apps');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim() || !url.trim()) {
            Alert.alert('Error', 'Please fill in app name and URL');
            return;
        }

        setModalVisible(false);
        setUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(30);
            await new Promise(resolve => setTimeout(resolve, 500));

            const appData = {
                name: name.trim(),
                description: description.trim(),
                url: url.trim(),
                iconUrl: iconUrl || null,
                icon: selectedIcon,
            };

            setUploadProgress(60);
            await new Promise(resolve => setTimeout(resolve, 500));

            if (editingApp) {
                await updateDocument('apps', editingApp.id, appData);
            } else {
                await createDocument('apps', appData);
            }

            setUploadProgress(90);
            await new Promise(resolve => setTimeout(resolve, 300));

            setUploadProgress(100);
            await new Promise(resolve => setTimeout(resolve, 500));

            loadApps();
        } catch (error) {
            console.error('Error saving app:', error);
            setUploading(false);
            Alert.alert('Error', 'Failed to save app');
        }
    };

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

    const renderAppItem = ({ item }) => (
        <View style={[styles.appCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
            <View style={[styles.appIcon, { backgroundColor: theme.accent1 }]}>
                {item.iconUrl ? (
                    <Image source={{ uri: item.iconUrl }} style={styles.iconImage} />
                ) : (
                    <Ionicons name={item.icon || 'apps'} size={32} color={theme.primary} />
                )}
            </View>
            <View style={styles.appInfo}>
                <Text style={[styles.appName, { color: theme.text }]}>{item.name}</Text>
                {item.description && (
                    <Text style={[styles.appDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <Text style={[styles.appUrl, { color: theme.primary }]} numberOfLines={1}>
                    {item.url}
                </Text>
            </View>
            <View style={styles.appActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FFE0E0' }]}
                    onPress={() => handleDelete(item)}
                >
                    <Ionicons name="trash" size={20} color={theme.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                <LoadingSpinner message="Loading apps..." />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header */}
            <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={[styles.headerTitle, { color: theme.textInverse }]}>MANAGE APPS</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>{apps.length} apps</Text>
            </LinearGradient>

            {/* Apps List */}
            <FlatList
                data={apps}
                renderItem={renderAppItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="apps" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No apps yet. Add your first app!
                        </Text>
                    </View>
                }
            />

            {/* Add Button */}
            <TouchableOpacity
                style={[styles.fabButton, { backgroundColor: theme.primary }, shadows.large]}
                onPress={handleAdd}
            >
                <Ionicons name="add" size={28} color={theme.textInverse} />
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {editingApp ? 'Edit App' : 'Add New App'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>App Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g., WhatsApp"
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>App URL *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder="https://play.google.com/store/apps/details?id=..."
                                    placeholderTextColor={theme.textSecondary}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                                <Text style={[styles.hint, { color: theme.textSecondary }]}>
                                    💡 Paste Play Store link to auto-extract icon
                                </Text>
                            </View>

                            {/* Icon Preview */}
                            {(iconUrl || extractingIcon) && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>App Icon</Text>
                                    <View style={[styles.iconPreview, { backgroundColor: theme.backgroundSecondary }]}>
                                        {extractingIcon ? (
                                            <LoadingSpinner size={40} message="Extracting icon..." />
                                        ) : iconUrl ? (
                                            <Image source={{ uri: iconUrl }} style={styles.previewImage} />
                                        ) : null}
                                    </View>
                                </View>
                            )}

                            {/* Manual Icon Selection */}
                            {!iconUrl && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>Select Icon</Text>
                                    <View style={styles.iconGrid}>
                                        {iconOptions.map((icon) => (
                                            <TouchableOpacity
                                                key={icon}
                                                style={[
                                                    styles.iconOption,
                                                    { backgroundColor: selectedIcon === icon ? theme.accent3 : theme.backgroundSecondary }
                                                ]}
                                                onPress={() => setSelectedIcon(icon)}
                                            >
                                                <Ionicons
                                                    name={icon}
                                                    size={24}
                                                    color={selectedIcon === icon ? theme.primary : theme.textSecondary}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.uploadButton, { backgroundColor: theme.backgroundSecondary }]}
                                        onPress={handlePickImage}
                                    >
                                        <Ionicons name="cloud-upload" size={20} color={theme.primary} />
                                        <Text style={[styles.uploadButtonText, { color: theme.primary }]}>
                                            Upload Custom Icon
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Brief description of the app"
                                    placeholderTextColor={theme.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: theme.primary }, shadows.medium]}
                                onPress={handleSave}
                            >
                                <Text style={[styles.saveButtonText, { color: theme.textInverse }]}>
                                    {editingApp ? 'Update App' : 'Add App'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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

            {/* Upload Progress */}
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
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: fontSize.md,
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
        overflow: 'hidden',
    },
    iconImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
    hint: {
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
    iconPreview: {
        width: 100,
        height: 100,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    uploadButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
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
    },
});
