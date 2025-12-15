import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Linking, Share } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { addBookmark, removeBookmark, isBookmarked as checkIsBookmarked } from '../../services/bookmarkService';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';

const { width } = Dimensions.get('window');

export default function VideoPlayerScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { video } = route.params || {};
    const [playing, setPlaying] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = useCallback((url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }, []);

    // Get video properties safely
    const videoTitle = video?.title || video?.name || 'Untitled Video';
    const videoDescription = video?.description || '';
    const videoUrl = video?.url || video?.link || video?.videoUrl || video?.youtubeUrl || '';
    const videoId = video?.videoId || getYouTubeVideoId(videoUrl);
    const itemId = video?.id || videoId || Date.now().toString();

    const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

    // Check if video is bookmarked on load
    useEffect(() => {
        const checkBookmarkStatus = async () => {
            try {
                if (itemId) {
                    const saved = await checkIsBookmarked(itemId);
                    setIsSaved(saved);
                }
            } catch (error) {
                console.error('Error checking bookmark status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkBookmarkStatus();
    }, [itemId]);

    // Handle player state changes
    const onStateChange = useCallback((state) => {
        if (state === 'ended') {
            setPlaying(false);
        }
    }, []);

    // Handle Save/Bookmark
    const handleSave = async () => {
        try {
            if (isSaved) {
                await removeBookmark(itemId);
                setIsSaved(false);
                Alert.alert('Removed', 'Video removed from bookmarks');
            } else {
                // Create bookmark data with all necessary fields
                const bookmarkData = {
                    id: itemId,
                    title: videoTitle,
                    description: videoDescription,
                    videoId: videoId,
                    url: youtubeUrl,
                };
                await addBookmark(bookmarkData, 'video');
                setIsSaved(true);
                Alert.alert('Saved', 'Video added to bookmarks');
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            Alert.alert('Error', 'Could not save video');
        }
    };

    // Handle Share
    const handleShare = async () => {
        if (!youtubeUrl) {
            Alert.alert('Error', 'No video URL to share');
            return;
        }

        try {
            await Share.share({
                message: `🎬 ${videoTitle}\n\nWatch here: ${youtubeUrl}`,
                url: youtubeUrl,
                title: videoTitle,
            });
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Error', 'Could not share video');
        }
    };

    // Handle Open in YouTube
    const handleOpenInYouTube = () => {
        if (!youtubeUrl) {
            Alert.alert('Error', 'No video URL available');
            return;
        }

        Linking.openURL(youtubeUrl).catch(() => {
            Alert.alert('Error', 'Could not open YouTube');
        });
    };

    // Handle back navigation
    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('YouTube');
        }
    };

    // Show error if no video data
    if (!video || !videoId) {
        return (
            <View style={[styles.container, styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <Ionicons name="alert-circle" size={80} color={theme.error || '#FF6B6B'} />
                <Text style={[styles.errorTitle, { color: theme.text }]}>Video Not Found</Text>
                <Text style={[styles.errorText, { color: theme.textSecondary }]}>
                    The video could not be loaded. It may have been removed or the link is invalid.
                </Text>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.primary }]}
                    onPress={handleGoBack}
                >
                    <Ionicons name="arrow-back" size={20} color={theme.textInverse} />
                    <Text style={[styles.backButtonText, { color: theme.textInverse }]}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Video Player */}
            <View style={styles.playerContainer}>
                <YoutubePlayer
                    height={220}
                    width={width}
                    play={playing}
                    videoId={videoId}
                    onChangeState={onStateChange}
                    webViewProps={{
                        allowsInlineMediaPlayback: true,
                    }}
                />
            </View>

            {/* Video Info */}
            <View style={[styles.infoCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                <Text style={[styles.videoTitle, { color: theme.text }]}>
                    {videoTitle}
                </Text>

                {videoDescription ? (
                    <Text style={[styles.videoDescription, { color: theme.textSecondary }]}>
                        {videoDescription}
                    </Text>
                ) : null}

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: isSaved ? theme.primary : theme.accent3 }
                        ]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Ionicons
                            name={isSaved ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={isSaved ? theme.textInverse : theme.primary}
                        />
                        <Text style={[
                            styles.actionText,
                            { color: isSaved ? theme.textInverse : theme.primary }
                        ]}>
                            {isSaved ? 'Saved' : 'Save'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-social" size={20} color={theme.primary} />
                        <Text style={[styles.actionText, { color: theme.primary }]}>
                            Share
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                        onPress={handleOpenInYouTube}
                    >
                        <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                        <Text style={[styles.actionText, { color: theme.primary }]}>
                            YouTube
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Channel Info */}
            <View style={[styles.channelCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                <View style={[styles.channelAvatar, { backgroundColor: theme.primary }]}>
                    <Ionicons name="play" size={24} color={theme.textInverse} />
                </View>
                <View style={styles.channelInfo}>
                    <Text style={[styles.channelName, { color: theme.text }]}>NextGenX</Text>
                    <Text style={[styles.channelMeta, { color: theme.textSecondary }]}>Official Channel</Text>
                </View>
            </View>

            {/* Spacer for bottom */}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    errorText: {
        fontSize: fontSize.md,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    backButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    playerContainer: {
        width: width,
        height: 220,
        backgroundColor: '#000',
    },
    infoCard: {
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    videoTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    videoDescription: {
        fontSize: fontSize.md,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    actionText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    channelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        gap: spacing.md,
    },
    channelAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    channelInfo: {
        flex: 1,
    },
    channelName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    channelMeta: {
        fontSize: fontSize.sm,
    },
});
