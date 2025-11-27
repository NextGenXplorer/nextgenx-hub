import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';

const { width } = Dimensions.get('window');

export default function VideoPlayerScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { video } = route.params;
    const [playing, setPlaying] = useState(false);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Video Player */}
            <View style={styles.playerContainer}>
                <YoutubePlayer
                    height={220}
                    play={playing}
                    videoId={video.videoId}
                    onChangeState={(state) => {
                        if (state === 'ended') {
                            setPlaying(false);
                        }
                    }}
                />
            </View>

            {/* Video Info */}
            <View style={[styles.infoCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                <Text style={[styles.videoTitle, { color: theme.text }]}>
                    {video.title}
                </Text>

                {video.description && (
                    <Text style={[styles.videoDescription, { color: theme.textSecondary }]}>
                        {video.description}
                    </Text>
                )}

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                        onPress={() => setPlaying(!playing)}
                    >
                        <Ionicons
                            name={playing ? 'pause' : 'play'}
                            size={20}
                            color={theme.primary}
                        />
                        <Text style={[styles.actionText, { color: theme.primary }]}>
                            {playing ? 'Pause' : 'Play'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                    >
                        <Ionicons name="bookmark-outline" size={20} color={theme.primary} />
                        <Text style={[styles.actionText, { color: theme.primary }]}>
                            Save
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                    >
                        <Ionicons name="share-social" size={20} color={theme.primary} />
                        <Text style={[styles.actionText, { color: theme.primary }]}>
                            Share
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Related Videos Section */}
            <View style={styles.relatedSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    More Videos
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                    Coming soon...
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    playerContainer: {
        width: width,
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
    relatedSection: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: fontSize.md,
    },
});
