import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView, getAllDocuments } from '../../services/firebase';

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

    const renderContentCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.contentCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
            activeOpacity={0.8}
            onPress={() => handlePlayVideo(item)}
        >
            <View style={[styles.thumbnail, { backgroundColor: theme.accent1 }]}>
                <Ionicons name="play-circle" size={48} color={theme.primary} />
                <View style={styles.playOverlay}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                </View>
            </View>
            <View style={styles.contentInfo}>
                <Text style={[styles.contentTitle, { color: theme.text }]} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.description && (
                    <Text style={[styles.contentDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <View style={styles.contentMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="logo-youtube" size={14} color="#FF0000" />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>YouTube</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="play-circle" size={14} color={theme.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>Watch Now</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#FF8C42', '#FFC107']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>CONTENT</Text>
                        <Text style={styles.headerSubtitle}>Watch and learn</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="play-circle" size={60} color="#FFFFFF" style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Content List */}
            <FlatList
                data={videos}
                renderItem={renderContentCard}
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
    illustrationContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: spacing.lg,
    },
    contentCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    thumbnail: {
        width: 120,
        height: 80,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    playOverlay: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 140, 66, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    contentTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    contentDescription: {
        fontSize: fontSize.sm,
        marginBottom: spacing.xs,
    },
    contentMeta: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: fontSize.xs,
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
