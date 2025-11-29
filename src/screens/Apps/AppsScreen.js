import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Linking, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView, getAllDocuments } from '../../services/firebase';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

export default function AppsScreen({ navigation }) {
    const { theme } = useTheme();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        trackPageView('Apps');
        loadApps();
    }, []);

    const loadApps = async () => {
        try {
            const data = await getAllDocuments('apps');
            setApps(data);
        } catch (error) {
            console.error('Error loading apps:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadApps();
    };

    const handleOpenApp = (app) => {
        if (app.url) {
            Linking.openURL(app.url).catch(err => console.error('Error opening URL:', err));
        }
    };

    const renderAppCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.appCard, { backgroundColor: theme.backgroundCard }, shadows.medium]}
            activeOpacity={0.8}
            onPress={() => handleOpenApp(item)}
        >
            {item.iconUrl ? (
                <View style={styles.appIconContainer}>
                    <Image
                        source={{ uri: item.iconUrl }}
                        style={styles.appLogo}
                        resizeMode="cover"
                    />
                </View>
            ) : (
                <LinearGradient
                    colors={[theme.primary, theme.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.appIconContainer}
                >
                    <Ionicons name={item.icon || 'apps'} size={32} color={theme.textInverse} />
                </LinearGradient>
            )}
            <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>
                {item.name}
            </Text>
            <TouchableOpacity
                style={[styles.openButton, { backgroundColor: theme.accent3 }]}
                onPress={() => handleOpenApp(item)}
            >
                <Text style={[styles.openButtonText, { color: theme.primary }]}>Open</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

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
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>APPS</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>Explore our collection</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="apps" size={60} color={theme.textInverse} style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Apps Grid */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <LoadingSpinner message="Loading apps..." />
                </View>
            ) : (
                <FlatList
                    data={apps}
                    renderItem={renderAppCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="apps" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No apps available yet
                            </Text>
                            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                Pull down to refresh
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 3,
    },
    gridContent: {
        padding: spacing.lg,
    },
    row: {
        justifyContent: 'space-between',
    },
    appCard: {
        width: cardWidth,
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    appIconContainer: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    appLogo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    openButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    openButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
        width: width - spacing.lg * 2,
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
