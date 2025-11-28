import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Linking, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { getBookmarks, removeBookmark } from '../../services/bookmarkService';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function BookmarksScreen({ navigation }) {
    const { theme } = useTheme();
    const [bookmarks, setBookmarks] = useState([]);
    const [filteredBookmarks, setFilteredBookmarks] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    // Reload bookmarks when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadBookmarks();
        }, [])
    );

    const loadBookmarks = async () => {
        try {
            const data = await getBookmarks();
            setBookmarks(data);
            filterBookmarks(activeTab, data);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const filterBookmarks = (tab, data = bookmarks) => {
        if (tab === 'all') {
            setFilteredBookmarks(data);
        } else {
            setFilteredBookmarks(data.filter(b => b.type === tab));
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        filterBookmarks(tab);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadBookmarks();
    };

    const handleRemoveBookmark = async (itemId) => {
        try {
            await removeBookmark(itemId);
            loadBookmarks();
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    };

    const handleOpenItem = (bookmark) => {
        const item = bookmark.data;

        if (bookmark.type === 'video') {
            navigation.navigate('VideoPlayer', { video: item });
        } else if (bookmark.type === 'tool' || bookmark.type === 'app') {
            if (item.url) {
                Linking.openURL(item.url).catch(err => console.error('Error opening URL:', err));
            }
        }
    };

    const renderBookmarkCard = ({ item }) => {
        const data = item.data;

        return (
            <TouchableOpacity
                style={[styles.bookmarkCard, { backgroundColor: theme.backgroundCard }, shadows.small]}
                activeOpacity={0.8}
                onPress={() => handleOpenItem(item)}
            >
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: item.type === 'tool' ? theme.accent3 : item.type === 'app' ? '#FFE5D0' : theme.accent1 }
                ]}>
                    <Ionicons
                        name={item.type === 'tool' ? 'construct' : item.type === 'app' ? 'apps' : 'play-circle'}
                        size={24}
                        color={theme.primary}
                    />
                </View>

                <View style={styles.bookmarkInfo}>
                    <Text style={[styles.bookmarkTitle, { color: theme.text }]} numberOfLines={1}>
                        {data.title || data.name}
                    </Text>
                    <Text style={[styles.bookmarkDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {data.description || 'No description'}
                    </Text>
                    <View style={styles.bookmarkMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: theme.accent1 }]}>
                            <Text style={[styles.typeText, { color: theme.primary }]}>
                                {item.type.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveBookmark(item.id)}
                >
                    <Ionicons name="heart" size={22} color="#FF6B6B" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const tabs = [
        { key: 'all', label: 'All', icon: 'heart' },
        { key: 'tool', label: 'Tools', icon: 'construct' },
        { key: 'app', label: 'Apps', icon: 'apps' },
        { key: 'video', label: 'Videos', icon: 'play-circle' },
    ];

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
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>BOOKMARKS</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>Your saved items</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="heart" size={60} color={theme.textInverse} style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            activeTab === tab.key && { backgroundColor: theme.accent1 }
                        ]}
                        onPress={() => handleTabChange(tab.key)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={18}
                            color={activeTab === tab.key ? theme.primary : theme.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab.key ? theme.primary : theme.textSecondary }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Bookmarks List */}
            <FlatList
                data={filteredBookmarks}
                renderItem={renderBookmarkCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No bookmarks yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                            Start bookmarking your favorite items
                        </Text>
                    </View>
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
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.xs,
        gap: spacing.xs,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        gap: 4,
    },
    tabText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    bookmarkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookmarkInfo: {
        flex: 1,
    },
    bookmarkTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: 2,
    },
    bookmarkDescription: {
        fontSize: fontSize.sm,
        marginBottom: spacing.xs,
    },
    bookmarkMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    typeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },
    removeButton: {
        padding: spacing.sm,
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
