import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView, getAllDocuments } from '../../services/firebase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { addBookmark, removeBookmark, getBookmarks } from '../../services/bookmarkService';
import { useFocusEffect } from '@react-navigation/native';

export default function YouTubeScreen({ navigation }) {
    const { theme } = useTheme();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookmarkedIds, setBookmarkedIds] = useState([]);

    useEffect(() => {
        trackPageView('Content');
        loadVideos();
    }, []);

    // Reload bookmarks when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadBookmarkedIds();
        }, [])
    );

    const loadBookmarkedIds = async () => {
        try {
            const bookmarks = await getBookmarks();
            const videoBookmarks = bookmarks
                .filter(b => b.type === 'video')
                .map(b => b.id);
            setBookmarkedIds(videoBookmarks);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    };

    const handleBookmark = async (video) => {
        try {
            const videoUrl = video.url || video.link || video.videoUrl || video.youtubeUrl;
            const videoId = video.videoId || getYouTubeVideoId(videoUrl);
            const itemId = video.id || videoId;

            const isBookmarked = bookmarkedIds.includes(itemId);
            if (isBookmarked) {
                await removeBookmark(itemId);
                setBookmarkedIds(prev => prev.filter(id => id !== itemId));
                Alert.alert('Removed', 'Video removed from bookmarks');
            } else {
                const bookmarkData = {
                    id: itemId,
                    title: video.title || 'Untitled Video',
                    description: video.description || '',
                    videoId: videoId,
                    url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoUrl,
                };
                await addBookmark(bookmarkData, 'video');
                setBookmarkedIds(prev => [...prev, itemId]);
                Alert.alert('Saved', 'Video added to bookmarks');
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            Alert.alert('Error', 'Could not update bookmark');
        }
    };

    const loadVideos = async () => {
        try {
            const data = await getAllDocuments('youtubeLinks');
            console.log('Loaded videos:', data);
            setVideos(data);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadVideos();
    };

    const handlePlayVideo = (video) => {
        navigation.navigate('VideoPlayer', { video });
    };

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderVideoCard = ({ item }) => {
        // Try to get video ID directly from item, or extract from URL
        const videoUrl = item.url || item.link || item.videoUrl || item.youtubeUrl;
        const videoId = item.videoId || getYouTubeVideoId(videoUrl);
        const itemId = item.id || videoId;
        const isBookmarked = bookmarkedIds.includes(itemId);

        const thumbnailUrl = videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : null;

        // Format the upload date if available
        const formatDate = (timestamp) => {
            if (!timestamp) return null;
            try {
                const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
                const now = new Date();
                const diffTime = Math.abs(now - date);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Yesterday';
                if (diffDays < 7) return `${diffDays} days ago`;
                if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
                if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
                return `${Math.floor(diffDays / 365)} years ago`;
            } catch (e) {
                return null;
            }
        };

        const uploadDate = formatDate(item.createdAt);

        return (
            <TouchableOpacity
                style={styles.videoCard}
                activeOpacity={0.9}
                onPress={() => handlePlayVideo(item)}
            >
                {/* Thumbnail */}
                <View style={styles.thumbnailContainer}>
                    {thumbnailUrl ? (
                        <Image
                            source={{ uri: thumbnailUrl }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.accent1 }]}>
                            <Ionicons name="play-circle" size={60} color={theme.primary} />
                        </View>
                    )}
                    {/* Play Icon Overlay */}
                    <View style={styles.playOverlay}>
                        <Ionicons name="play-circle" size={50} color="rgba(255,255,255,0.9)" />
                    </View>
                    {/* Bookmark Button on Thumbnail */}
                    <TouchableOpacity
                        style={styles.thumbnailBookmark}
                        onPress={() => handleBookmark(item)}
                    >
                        <Ionicons
                            name={isBookmarked ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isBookmarked ? '#FF6B6B' : '#FFFFFF'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Video Info */}
                <View style={styles.videoInfo}>
                    {/* Channel Avatar */}
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Ionicons name="person" size={20} color={theme.textInverse} />
                    </View>

                    {/* Title and Meta */}
                    <View style={styles.videoDetails}>
                        <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>
                            {item.title || 'Untitled Video'}
                        </Text>
                        <Text style={[styles.videoMeta, { color: theme.textSecondary }]}>
                            NextGenX{uploadDate ? ` • ${uploadDate}` : ''}
                        </Text>
                    </View>

                    {/* Bookmark Button */}
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => handleBookmark(item)}
                    >
                        <Ionicons
                            name={isBookmarked ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isBookmarked ? '#FF6B6B' : theme.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <LoadingSpinner message="Loading videos..." />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>CONTENT</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>Watch and learn</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="play-circle" size={60} color={theme.textInverse} style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Video List */}
            <FlatList
                data={videos}
                renderItem={renderVideoCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyState}>
                            <Ionicons name="play-circle" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No videos available yet
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                Pull down to refresh
                            </Text>
                        </View>
                    )
                }
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
        marginBottom: spacing.sm,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    illustrationContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    videoCard: {
        marginBottom: spacing.lg,
    },
    thumbnailContainer: {
        width: '100%',
        height: 220,
        position: 'relative',
        backgroundColor: '#000',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    thumbnailBookmark: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        padding: spacing.xs,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
    },
    videoInfo: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoDetails: {
        flex: 1,
    },
    videoTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        lineHeight: 20,
        marginBottom: 4,
    },
    videoMeta: {
        fontSize: fontSize.xs,
        lineHeight: 16,
    },
    menuButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
});
