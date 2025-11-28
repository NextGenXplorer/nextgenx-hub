import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView } from '../../services/firebase';

export default function AboutScreen() {
    const { theme } = useTheme();

    useEffect(() => {
        trackPageView('About');
    }, []);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#FFB380', '#FFD54F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>ABOUT</Text>
                        <Text style={styles.headerSubtitle}>Learn more about us</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="information-circle" size={60} color="#FFFFFF" style={{ opacity: 0.9 }} />
                    </View>
                </View>
            </LinearGradient>

            {/* Content Cards */}
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="rocket" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Our Mission</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        To provide the best tools and resources for modern digital creators and professionals.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="eye" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Our Vision</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        Building a community where innovation meets simplicity, empowering everyone to achieve more.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="people" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Our Team</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        A passionate group of developers, designers, and creators dedicated to excellence.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="mail" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Contact Us</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        Have questions? Reach out to us at hello@nextgenx.com
                    </Text>
                </View>

                {/* Social Media Section */}
                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="share-social" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Follow Us</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        Connect with us on social media
                    </Text>

                    <View style={styles.socialContainer}>
                        {/* Instagram */}
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: '#E4405F' }, shadows.small]}
                            onPress={() => Linking.openURL('https://www.instagram.com/nexgenxplorerr?igsh=YWV0ZHRuZDZ0M2V3')}
                        >
                            <Ionicons name="logo-instagram" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* WhatsApp */}
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: '#25D366' }, shadows.small]}
                            onPress={() => Linking.openURL('https://whatsapp.com/channel/0029VaU05uG9RZAeiXKyEu06')}
                        >
                            <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* YouTube */}
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: '#FF0000' }, shadows.small]}
                            onPress={() => Linking.openURL('https://youtube.com/@nexgenxplorer?si=UG-wBC8UIyeT4bbw')}
                        >
                            <Ionicons name="logo-youtube" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Play Store */}
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: '#34A853' }, shadows.small]}
                            onPress={() => Linking.openURL('https://play.google.com/store/apps/dev?id=8262374975871504599')}
                        >
                            <Ionicons name="logo-google-playstore" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
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
    content: {
        padding: spacing.lg,
        gap: spacing.md,
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
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
