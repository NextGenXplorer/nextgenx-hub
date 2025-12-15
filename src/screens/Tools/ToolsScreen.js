import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Linking, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView, getAllDocuments } from '../../services/firebase';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { addBookmark, removeBookmark, getBookmarks } from '../../services/bookmarkService';
import { useFocusEffect } from '@react-navigation/native';

export default function ToolsScreen({ navigation }) {
    const { theme } = useTheme();
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bookmarkedIds, setBookmarkedIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        trackPageView('Tools');
        loadTools();
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
            const toolBookmarks = bookmarks
                .filter(b => b.type === 'tool')
                .map(b => b.id);
            setBookmarkedIds(toolBookmarks);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    };

    const handleBookmark = async (tool) => {
        try {
            const isBookmarked = bookmarkedIds.includes(tool.id);
            if (isBookmarked) {
                await removeBookmark(tool.id);
                setBookmarkedIds(prev => prev.filter(id => id !== tool.id));
                Alert.alert('Removed', 'Tool removed from bookmarks');
            } else {
                const bookmarkData = {
                    id: tool.id,
                    name: tool.name || tool.title,
                    title: tool.name || tool.title,
                    description: tool.description || '',
                    url: tool.url || '',
                    icon: tool.icon || 'construct',
                    category: tool.category || '',
                };
                await addBookmark(bookmarkData, 'tool');
                setBookmarkedIds(prev => [...prev, tool.id]);
                Alert.alert('Saved', 'Tool added to bookmarks');
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            Alert.alert('Error', 'Could not update bookmark');
        }
    };

    const loadTools = async () => {
        try {
            const data = await getAllDocuments('tools');
            setTools(data);
        } catch (error) {
            console.error('Error loading tools:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadTools();
    };

    const handleOpenTool = (tool) => {
        if (tool.url) {
            Linking.openURL(tool.url).catch(err => console.error('Error opening URL:', err));
        }
    };

    // Filter tools based on search query
    const filteredTools = tools.filter(tool => {
        const name = (tool.name || tool.title || '').toLowerCase();
        const description = (tool.description || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || description.includes(query);
    });

    const renderToolCard = ({ item }) => {
        const isBookmarked = bookmarkedIds.includes(item.id);

        return (
            <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                activeOpacity={0.8}
                onPress={() => handleOpenTool(item)}
            >
                <View style={[styles.toolIcon, { backgroundColor: theme.accent3 }]}>
                    <Ionicons name={item.icon || 'construct'} size={24} color={theme.primary} />
                </View>
                <View style={styles.toolInfo}>
                    <Text style={[styles.toolTitle, { color: theme.text }]}>{item.name || item.title}</Text>
                    <Text style={[styles.toolDescription, { color: theme.textSecondary }]}>
                        {item.description || 'No description'}
                    </Text>
                </View>
                {item.category && (
                    <View style={[styles.categoryBadge, { backgroundColor: theme.accent1 }]}>
                        <Text style={[styles.categoryText, { color: theme.primary }]}>{item.category}</Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => handleBookmark(item)}
                >
                    <Ionicons
                        name={isBookmarked ? 'heart' : 'heart-outline'}
                        size={22}
                        color={isBookmarked ? '#FF6B6B' : theme.textSecondary}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>TOOLS</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>Discover amazing tools</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="construct" size={60} color={theme.textInverse} style={{ opacity: 0.9 }} />
                    </View>
                </View>

                <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.accent }]}>
                    <Ionicons name="search" size={20} color={theme.primary} />
                </TouchableOpacity>
            </LinearGradient>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                <Ionicons name="search" size={20} color={theme.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search tools..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Tools List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <LoadingSpinner message="Loading tools..." />
                </View>
            ) : (
                <FlatList
                    data={filteredTools}
                    renderItem={renderToolCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="construct" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                {searchQuery ? 'No tools found' : 'No tools available yet'}
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                {searchQuery ? 'Try a different search' : 'Pull down to refresh'}
                            </Text>
                        </View>
                    }
                />
            )}
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
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    illustrationContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButton: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: borderRadius.round,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        marginTop: -spacing.lg,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize.md,
        paddingVertical: spacing.xs,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 3,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    toolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    toolIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolInfo: {
        flex: 1,
    },
    toolTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: 2,
    },
    toolDescription: {
        fontSize: fontSize.sm,
    },
    categoryBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    categoryText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },
    bookmarkButton: {
        padding: spacing.sm,
        marginLeft: spacing.xs,
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
