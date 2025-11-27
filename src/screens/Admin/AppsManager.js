import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../../services/firebase';

export default function AppsManager({ navigation }) {
    const { theme } = useTheme();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingApp, setEditingApp] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('apps');

    useEffect(() => {
        loadApps();
    }, []);

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

    const handleAdd = () => {
        setEditingApp(null);
        setName('');
        setUrl('');
        setDescription('');
        setIcon('apps');
        setModalVisible(true);
    };

    const handleEdit = (app) => {
        setEditingApp(app);
        setName(app.name || '');
        setUrl(app.url || '');
        setDescription(app.description || '');
        setIcon(app.icon || 'apps');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim() || !url.trim()) {
            Alert.alert('Error', 'Please fill in app name and URL');
            return;
        }

        try {
            const appData = {
                name: name.trim(),
                url: url.trim(),
                description: description.trim(),
                icon: icon || 'apps',
            };

            if (editingApp) {
                await updateDocument('apps', editingApp.id, appData);
                Alert.alert('Success', 'App updated successfully');
            } else {
                await createDocument('apps', appData);
                Alert.alert('Success', 'App added successfully');
            }

            setModalVisible(false);
            loadApps();
        } catch (error) {
            console.error('Error saving app:', error);
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
                        try {
                            await deleteDocument('apps', app.id);
                            Alert.alert('Success', 'App deleted successfully');
                            loadApps();
                        } catch (error) {
                            console.error('Error deleting app:', error);
                            Alert.alert('Error', 'Failed to delete app');
                        }
                    },
                },
            ]
        );
    };

    const renderAppItem = ({ item }) => (
        <View style={[styles.appCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
            <View style={[styles.appIcon, { backgroundColor: theme.accent3 }]}>
                <Ionicons name={item.icon || 'apps'} size={32} color={theme.primary} />
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

    const iconOptions = ['apps', 'game-controller', 'musical-notes', 'camera', 'book', 'calculator', 'fitness', 'restaurant'];

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header */}
            <LinearGradient
                colors={['#FF8C42', '#FFC107']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>MANAGE APPS</Text>
                <Text style={styles.headerSubtitle}>{apps.length} apps</Text>
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
                <Ionicons name="add" size={28} color="#FFFFFF" />
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
                                    placeholder="e.g., Instagram"
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>App URL *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder="https://example.com or app://..."
                                    placeholderTextColor={theme.textSecondary}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Brief description of the app"
                                    placeholderTextColor={theme.textSecondary}
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Icon</Text>
                                <View style={styles.iconGrid}>
                                    {iconOptions.map((iconName) => (
                                        <TouchableOpacity
                                            key={iconName}
                                            style={[
                                                styles.iconOption,
                                                { backgroundColor: icon === iconName ? theme.primary : theme.backgroundSecondary }
                                            ]}
                                            onPress={() => setIcon(iconName)}
                                        >
                                            <Ionicons
                                                name={iconName}
                                                size={24}
                                                color={icon === iconName ? '#FFFFFF' : theme.text}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: theme.primary }, shadows.medium]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingApp ? 'Update App' : 'Add App'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
