import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView } from '../../services/firebase';
import { getPrivacyPolicy } from '../../services/legal.service';

const SectionCard = ({ title, content, items, icon, theme }) => {
    return (
        <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
            <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                <Ionicons name={icon} size={24} color={theme.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>

            {content && (
                <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                    {content}
                </Text>
            )}

            {items && Array.isArray(items) && (
                <View style={styles.itemsList}>
                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            {typeof item === 'string' ? (
                                <>
                                    <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                                    <Text style={[styles.itemText, { color: theme.textSecondary }]}>
                                        {item}
                                    </Text>
                                </>
                            ) : (
                                <View style={styles.subSection}>
                                    <Text style={[styles.subTitle, { color: theme.text }]}>
                                        {item.subtitle}
                                    </Text>
                                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                                        {item.content}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const getSectionIcon = (title) => {
    const iconMap = {
        'Introduction': 'document-text',
        'App Permissions': 'key',
        'Permission Usage Principles': 'checkmark-circle',
        'Information We Collect': 'folder-open',
        'How We Use Your Information': 'analytics',
        'Data Storage and Security': 'shield-checkmark',
        'Third-Party Services': 'link',
        'Your Rights': 'person-circle',
        'Data Retention': 'time',
        'Children\'s Privacy': 'people',
        'Changes to This Policy': 'refresh-circle',
        'Contact Us': 'mail',
    };
    return iconMap[title] || 'information-circle';
};

export default function PrivacyPolicyScreen() {
    const { theme } = useTheme();
    const [policyData, setPolicyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        trackPageView('PrivacyPolicy');
        fetchPrivacyPolicy();
    }, []);

    const fetchPrivacyPolicy = async () => {
        try {
            setLoading(true);
            const data = await getPrivacyPolicy();
            if (data.success) {
                setPolicyData(data);
            } else {
                setError('Failed to load privacy policy');
            }
        } catch (err) {
            setError('Failed to load privacy policy');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Loading Privacy Policy...
                </Text>
            </View>
        );
    }

    if (error || !policyData) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <Ionicons name="alert-circle" size={64} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.text }]}>
                    {error || 'Unable to load privacy policy'}
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.primary }]}
                    onPress={fetchPrivacyPolicy}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Gradient */}
            <LinearGradient
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>PRIVACY POLICY</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>
                            How we protect your data
                        </Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="shield-checkmark" size={60} color={theme.textInverse} style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Last Updated Info */}
            <View style={styles.content}>
                <View style={[styles.infoCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={18} color={theme.primary} />
                        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Last Updated:</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>{policyData.lastUpdated}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="document" size={18} color={theme.primary} />
                        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Version:</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>{policyData.version}</Text>
                    </View>
                </View>

                {/* Policy Sections */}
                {policyData.sections.map((section, index) => (
                    <SectionCard
                        key={index}
                        title={section.title}
                        content={section.content}
                        items={section.items}
                        icon={getSectionIcon(section.title)}
                        theme={theme}
                    />
                ))}

                {/* Contact Section */}
                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="help-circle" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Questions?</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        If you have any questions about our Privacy Policy, please contact us.
                    </Text>
                    <TouchableOpacity
                        style={styles.emailButton}
                        onPress={() => Linking.openURL(`mailto:${policyData.contactEmail}`)}
                    >
                        <Ionicons name="mail-outline" size={18} color={theme.primary} />
                        <Text style={[styles.emailText, { color: theme.primary }]}>{policyData.contactEmail}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        marginTop: spacing.md,
        fontSize: fontSize.lg,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: spacing.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.md,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
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
    content: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    infoCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    infoLabel: {
        fontSize: fontSize.sm,
    },
    infoValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    card: {
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    cardText: {
        fontSize: fontSize.md,
        lineHeight: 22,
    },
    itemsList: {
        marginTop: spacing.md,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
        marginRight: spacing.sm,
    },
    itemText: {
        flex: 1,
        fontSize: fontSize.md,
        lineHeight: 22,
    },
    subSection: {
        flex: 1,
        marginBottom: spacing.sm,
    },
    subTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
        padding: spacing.sm,
    },
    emailText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
});
