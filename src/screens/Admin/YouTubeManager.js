import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '../../services/firebase';
import UploadProgress from '../../components/UploadProgress';

export default function YouTubeManager({ navigation }) {
    const { theme } = useTheme();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form fields
    const [title, setTitle] = useState('');
    const [videoId, setVideoId] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const data = await getAllDocuments('youtubeLinks');
            setVideos(data);
        } catch (error) {
            console.error('Error loading videos:', error);
            Alert.alert('Error', 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingVideo(null);
        setTitle('');
        setVideoId('');
        setDescription('');
        setModalVisible(true);
    };

    const handleEdit = (video) => {
        setEditingVideo(video);
        setTitle(video.title || '');
        setVideoId(video.videoId || '');
        setDescription(video.description || '');
        setModalVisible(true);
    };

    const extractVideoId = (url) => {
        // Extract video ID from various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return url; // Return as-is if no pattern matches
    };

    const handleSave = async () => {
        if (!title.trim() || !videoId.trim()) {
            Alert.alert('Error', 'Please fill in title and YouTube link');
            return;
        }

        setModalVisible(false);
        setUploading(true);
        setUploadProgress(0);

        try {
            // Simulate progress
            setUploadProgress(30);
            await new Promise(resolve => setTimeout(resolve, 500));

            const extractedId = extractVideoId(videoId.trim());

            const videoData = {
                title: title.trim(),
                videoId: extractedId,
                description: description.trim(),
            };

            setUploadProgress(60);
            await new Promise(resolve => setTimeout(resolve, 500));

            if (editingVideo) {
                await updateDocument('youtubeLinks', editingVideo.id, videoData);
            } else {
                await createDocument('youtubeLinks', videoData);
            }

            setUploadProgress(90);
            await new Promise(resolve => setTimeout(resolve, 300));

            setUploadProgress(100);
            await new Promise(resolve => setTimeout(resolve, 500));

            loadVideos();
        } catch (error) {
            console.error('Error saving video:', error);
            setUploading(false);
            Alert.alert('Error', 'Failed to save video');
        }
    };

    const handleDelete = (video) => {
        Alert.alert(
            'Delete Video',
            `Are you sure you want to delete "${video.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDocument('youtubeLinks', video.id);
                            Alert.alert('Success', 'Video deleted successfully');
                            loadVideos();
                        } catch (error) {
                            console.error('Error deleting video:', error);
                            Alert.alert('Error', 'Failed to delete video');
                        }
                    },
                },
            ]
        );
    };

    const renderVideoItem = ({ item }) => (
        <View style={[styles.videoCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
            <View style={[styles.thumbnail, { backgroundColor: theme.accent1 }]}>
                <Ionicons name="play-circle" size={40} color={theme.primary} />
            </View>
            <View style={styles.videoInfo}>
                <Text style={[styles.videoTitle, { color: theme.text }]}>{item.title}</Text>
                {item.description && (
                    <Text style={[styles.videoDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <Text style={[styles.videoId, { color: theme.primary }]} numberOfLines={1}>
                    ID: {item.videoId}
                </Text>
            </View>
            <View style={styles.videoActions}>
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

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header */}
            <LinearGradient
                colors={['#FFC107', '#FFD54F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>MANAGE VIDEOS</Text>
                <Text style={styles.headerSubtitle}>{videos.length} videos</Text>
            </LinearGradient>

            {/* Videos List */}
            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="play-circle" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No videos yet. Add your first video!
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
                                {editingVideo ? 'Edit Video' : 'Add New Video'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Video Title *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="e.g., How to use NextGenX"
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>YouTube Link *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={videoId}
                                    onChangeText={setVideoId}
                                    placeholder="https://youtube.com/watch?v=..."
                                    placeholderTextColor={theme.textSecondary}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                                <Text style={[styles.hint, { color: theme.textSecondary }]}>
                                    Paste full YouTube URL or video ID
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                                <TextInput
                                    style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Brief description of the video"
                                    placeholderTextColor={theme.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: theme.primary }, shadows.medium]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>
                                    {editingVideo ? 'Update Video' : 'Add Video'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    videoCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    thumbnail: {
        width: 80,
        height: 60,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoInfo: {
        flex: 1,
    },
    videoTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    videoDescription: {
        fontSize: fontSize.sm,
        marginBottom: spacing.xs,
    },
    videoId: {
        fontSize: fontSize.xs,
    },
    videoActions: {
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
        minHeight: 80,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
        fontStyle: 'italic',
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
