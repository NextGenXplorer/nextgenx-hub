import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { addTool, updateTool, deleteTool, getAllTools } from '../../services/admin.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import UploadProgress from '../../components/UploadProgress';

export default function ToolsManager({ navigation }) {
    const { theme } = useTheme();
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTool, setEditingTool] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('construct');

    const iconOptions = [
        'construct', 'build', 'code-slash', 'terminal', 'server',
        'globe', 'cloud', 'shield-checkmark', 'analytics', 'settings',
        'hammer', 'git-branch', 'cube', 'layers', 'extension-puzzle'
    ];

    useEffect(() => {
        loadTools();
    }, []);

    const loadTools = async () => {
        try {
            const data = await getAllTools();
            setTools(data);
        } catch (error) {
            console.error('Error loading tools:', error);
            Alert.alert('Error', 'Failed to load tools');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingTool(null);
        setName('');
        setDescription('');
        setUrl('');
        setSelectedIcon('construct');
        setModalVisible(true);
    };

    const handleEdit = (tool) => {
        setEditingTool(tool);
        setName(tool.name || '');
        setDescription(tool.description || '');
        setUrl(tool.url || '');
        setSelectedIcon(tool.icon || 'construct');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim() || !url.trim()) {
            Alert.alert('Error', 'Please fill in tool name and URL');
            return;
        }

        setModalVisible(false);
        setUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(30);
            await new Promise(resolve => setTimeout(resolve, 500));

            const toolData = {
                name: name.trim(),
                description: description.trim(),
                url: url.trim(),
                icon: selectedIcon,
            };

            setUploadProgress(60);
            await new Promise(resolve => setTimeout(resolve, 500));

            if (editingTool) {
                // Update without notification
                await updateTool(editingTool.id, toolData, false);
            } else {
                // Add new tool with notification to all users
                await addTool(toolData, true);
            }

            setUploadProgress(90);
            await new Promise(resolve => setTimeout(resolve, 300));

            setUploadProgress(100);
            await new Promise(resolve => setTimeout(resolve, 500));

            loadTools();
        } catch (error) {
            console.error('Error saving tool:', error);
            setUploading(false);
            Alert.alert('Error', 'Failed to save tool');
        }
    };

    const handleDelete = (tool) => {
        Alert.alert(
            'Delete Tool',
            `Are you sure you want to delete "${tool.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteTool(tool.id);
                            loadTools();
                        } catch (error) {
                            console.error('Error deleting tool:', error);
                            Alert.alert('Error', 'Failed to delete tool');
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const renderToolItem = ({ item }) => (
        <View style={[styles.toolCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
            <View style={[styles.toolIcon, { backgroundColor: theme.accent1 }]}>
                <Ionicons name={item.icon || 'construct'} size={28} color={theme.primary} />
            </View>
            <View style={styles.toolInfo}>
                <Text style={[styles.toolName, { color: theme.text }]}>{item.name}</Text>
                {item.description && (
                    <Text style={[styles.toolDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <Text style={[styles.toolUrl, { color: theme.primary }]} numberOfLines={1}>
                    {item.url}
                </Text>
            </View>
            <View style={styles.toolActions}>
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
                <LoadingSpinner message="Loading tools..." />
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
                <Text style={[styles.headerTitle, { color: theme.textInverse }]}>MANAGE TOOLS</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>{tools.length} tools</Text>
            </LinearGradient>

            {/* Tools List */}
            <FlatList
                data={tools}
                renderItem={renderToolItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="construct" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No tools yet. Add your first tool!
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
                                {editingTool ? 'Edit Tool' : 'Add New Tool'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Tool Name *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g., Code Formatter"
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Tool URL *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={url}
                                    onChangeText={setUrl}
                                    placeholder="https://example.com/tool"
                                    placeholderTextColor={theme.textSecondary}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                            </View>

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
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Brief description of the tool"
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
                                    {editingTool ? 'Update Tool' : 'Add Tool'}
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
                    <View style={[styles.deletingModal, { backgroundColor: theme.backgroundCard }]}>
                        <LoadingSpinner message="Deleting tool..." />
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
    toolCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    toolIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolInfo: {
        flex: 1,
    },
    toolName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    toolDescription: {
        fontSize: fontSize.sm,
        marginBottom: spacing.xs,
    },
    toolUrl: {
        fontSize: fontSize.xs,
    },
    toolActions: {
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
    deletingModal: {
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        marginHorizontal: spacing.xl,
        alignSelf: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
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
        minHeight: 80,
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
    },
});
