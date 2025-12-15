import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { addVideo, updateVideo, deleteVideo, getAllVideos } from '../../services/admin.service';
import UploadProgress from '../../components/UploadProgress';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function YouTubeManager({ navigation }) {
    const { theme } = useTheme();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form fields
    const [title, setTitle] = useState('');
    const [videoId, setVideoId] = useState('');
    const [description, setDescription] = useState('');
    const [fetchingTitle, setFetchingTitle] = useState(false);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            const data = await getAllVideos();
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
            /youtube\.com\/shorts\/([^&\n?#]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        // Check if it's already a video ID (11 characters)
        if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
            return url;
        }
        return url; // Return as-is if no pattern matches
    };

    // Fetch YouTube video title using oEmbed API with fallback
    const fetchVideoTitle = async (url, forceUpdate = false) => {
        const extractedId = extractVideoId(url);
        if (!extractedId || extractedId.length !== 11) return null;

        // Don't fetch if title already exists (unless forced)
        if (title && !forceUpdate) return null;

        try {
            setFetchingTitle(true);
            const videoUrl = `https://www.youtube.com/watch?v=${extractedId}`;

            // Try YouTube oEmbed API first
            const response = await fetch(
                `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
                { timeout: 5000 }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.title) {
                    setTitle(data.title);
                    setFetchingTitle(false);
                    return data.title;
                }
            }
        } catch (error) {
            console.log('YouTube oEmbed failed, trying fallback:', error.message);
        }

        // Fallback: Try noembed.com (proxy service)
        try {
            const fallbackResponse = await fetch(
                `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${extractedId}`,
                { timeout: 5000 }
            );

            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.title) {
                    setTitle(fallbackData.title);
                    setFetchingTitle(false);
                    return fallbackData.title;
                }
            }
        } catch (fallbackError) {
            console.log('Fallback API also failed:', fallbackError.message);
        }

        // If all APIs fail, set a placeholder that admin can edit
        setTitle(`Video ${extractedId}`);
        setFetchingTitle(false);
        return null;
    };

    // Handle URL change and auto-fetch title
    const handleUrlChange = (url) => {
        setVideoId(url);

        // Clear title when URL changes significantly
        if (!url || url.length < 5) {
            return;
        }

        // Auto-fetch title if URL looks valid
        const extractedId = extractVideoId(url);
        if (extractedId && extractedId.length === 11) {
            // Small delay to avoid fetching while still typing
            setTimeout(() => {
                if (videoId === url || url.includes(extractedId)) {
                    fetchVideoTitle(url);
                }
            }, 500);
        }
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
                // Update without notification
                await updateVideo(editingVideo.id, videoData, false);
            } else {
                // Add new video with notification
                await addVideo(videoData, true);
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
                        setDeleting(true);
                        try {
                            await deleteVideo(video.id);
                            loadVideos();
                        } catch (error) {
                            console.error('Error deleting video:', error);
                            Alert.alert('Error', 'Failed to delete video');
                        } finally {
                            setDeleting(false);
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

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                <LoadingSpinner message="Loading videos..." />
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
                <Text style={[styles.headerTitle, { color: theme.textInverse }]}>MANAGE VIDEOS</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>{videos.length} videos</Text>
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
                                {editingVideo ? 'Edit Video' : 'Add New Video'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>
                                    Video Title {fetchingTitle ? '(Fetching...)' : '*'}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { backgroundColor: theme.backgroundSecondary, color: theme.text },
                                        fetchingTitle && { opacity: 0.6 }
                                    ]}
                                    value={fetchingTitle ? 'Fetching title...' : title}
                                    onChangeText={setTitle}
                                    placeholder="Auto-filled from YouTube or enter manually"
                                    placeholderTextColor={theme.textSecondary}
                                    editable={!fetchingTitle}
                                />
                                {title && !fetchingTitle && (
                                    <Text style={[styles.hint, { color: theme.success || '#10B981' }]}>
                                        ✓ Title ready
                                    </Text>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>YouTube Link *</Text>
                                <View style={styles.urlInputRow}>
                                    <TextInput
                                        style={[styles.urlInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                                        value={videoId}
                                        onChangeText={handleUrlChange}
                                        placeholder="https://youtube.com/watch?v=..."
                                        placeholderTextColor={theme.textSecondary}
                                        autoCapitalize="none"
                                        keyboardType="url"
                                    />
                                    <TouchableOpacity
                                        style={[
                                            styles.fetchButton,
                                            { backgroundColor: fetchingTitle ? theme.textSecondary : theme.primary }
                                        ]}
                                        onPress={() => fetchVideoTitle(videoId, true)}
                                        disabled={fetchingTitle || !videoId.trim()}
                                    >
                                        {fetchingTitle ? (
                                            <Ionicons name="hourglass" size={20} color={theme.textInverse} />
                                        ) : (
                                            <Ionicons name="refresh" size={20} color={theme.textInverse} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <Text style={[styles.hint, { color: theme.textSecondary }]}>
                                    Paste URL → Title auto-fetches • Tap refresh to re-fetch
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
                                <Text style={[styles.saveButtonText, { color: theme.textInverse }]}>
                                    {editingVideo ? 'Update Video' : 'Add Video'}
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
                        <LoadingSpinner message="Deleting video..." />
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
    urlInputRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    urlInput: {
        flex: 1,
        fontSize: fontSize.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
    },
    fetchButton: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fetchButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
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
    },
});
