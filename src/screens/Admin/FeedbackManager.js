import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { db } from '../../firebaseConfig';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function FeedbackManager() {
    const { theme } = useTheme();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        try {
            const snapshot = await db.collection('feedback')
                .orderBy('createdAt', 'desc')
                .get();
            const feedbackList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setFeedbacks(feedbackList);
        } catch (error) {
            console.error('Error loading feedbacks:', error);
            Alert.alert('Error', 'Failed to load feedbacks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadFeedbacks();
    };

    const markAsRead = async (id) => {
        try {
            await db.collection('feedback').doc(id).update({
                status: 'read'
            });
            setFeedbacks(prev => prev.map(f =>
                f.id === id ? { ...f, status: 'read' } : f
            ));
        } catch (error) {
            console.error('Error updating feedback:', error);
            Alert.alert('Error', 'Failed to update feedback');
        }
    };

    const deleteFeedback = async (id) => {
        Alert.alert(
            'Delete Feedback',
            'Are you sure you want to delete this feedback?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.collection('feedback').doc(id).delete();
                            setFeedbacks(prev => prev.filter(f => f.id !== id));
                            Alert.alert('Success', 'Feedback deleted');
                        } catch (error) {
                            console.error('Error deleting feedback:', error);
                            Alert.alert('Error', 'Failed to delete feedback');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderFeedbackItem = ({ item }) => (
        <View style={[styles.feedbackCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
            <View style={styles.feedbackHeader}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <View>
                        <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{item.email}</Text>
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'new' ? theme.error + '20' : theme.success + '20' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'new' ? theme.error : theme.success }
                    ]}>
                        {item.status === 'new' ? 'New' : 'Read'}
                    </Text>
                </View>
            </View>

            <Text style={[styles.messageText, { color: theme.text }]}>{item.message}</Text>

            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {formatDate(item.createdAt)}
            </Text>

            <View style={styles.actionButtons}>
                {item.status === 'new' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.success + '20' }]}
                        onPress={() => markAsRead(item.id)}
                    >
                        <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                        <Text style={[styles.actionButtonText, { color: theme.success }]}>Mark Read</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                    onPress={() => deleteFeedback(item.id)}
                >
                    <Ionicons name="trash" size={18} color={theme.error} />
                    <Text style={[styles.actionButtonText, { color: theme.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.backgroundSecondary, justifyContent: 'center' }]}>
                <LoadingSpinner message="Loading feedbacks..." />
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
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>FEEDBACK</Text>
                        <Text style={styles.headerSubtitle}>
                            {feedbacks.length} {feedbacks.length === 1 ? 'submission' : 'submissions'}
                        </Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {feedbacks.filter(f => f.status === 'new').length}
                            </Text>
                            <Text style={styles.statLabel}>New</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {feedbacks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={60} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        No feedback yet
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={feedbacks}
                    renderItem={renderFeedbackItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[theme.primary]}
                        />
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
    statsContainer: {
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    statNumber: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    listContainer: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    feedbackCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: '#FFFFFF',
    },
    userName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    userEmail: {
        fontSize: fontSize.sm,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    messageText: {
        fontSize: fontSize.md,
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    dateText: {
        fontSize: fontSize.sm,
        marginBottom: spacing.md,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    actionButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.lg,
    },
});
