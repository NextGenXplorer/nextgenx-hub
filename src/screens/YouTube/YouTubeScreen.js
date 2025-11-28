import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView, getAllDocuments } from '../../services/firebase';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function YouTubeScreen({ navigation }) {
    const { theme } = useTheme();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        trackPageView('Content');
        loadVideos();
    }, []);

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

        const thumbnailUrl = videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : null;

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
                    {/* Duration Badge */}
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>7:26</Text>
                    </View>
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
                            {item.title}
                        </Text>
                        <Text style={[styles.videoMeta, { color: theme.textSecondary }]}>
                            NextGenX • {item.views || '6.7K'} views • {item.uploadTime || '2 days ago'}
                        </Text>
                    </View>

                    {/* Menu Button */}
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="ellipsis-vertical" size={20} color={theme.textSecondary} />
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
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
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
