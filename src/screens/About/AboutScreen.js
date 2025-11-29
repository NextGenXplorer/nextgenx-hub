import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import { trackPageView } from '../../services/firebase';


const SocialButton = ({ name, icon, color, url, tooltip }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const handlePressIn = () => {
        setIsPressed(true);
        setShowTooltip(true);
    };

    const handlePressOut = () => {
        setIsPressed(false);
        setTimeout(() => setShowTooltip(false), 200);
    };

    const handlePress = () => {
        Linking.openURL(url);
    };

    return (
        <View style={styles.socialButtonWrapper}>
            {showTooltip && (
                <View style={[styles.tooltip, { backgroundColor: color }]}>
                    <Text style={styles.tooltipText}>{tooltip}</Text>
                    <View style={[styles.tooltipArrow, { backgroundColor: color }]} />
                </View>
            )}
            <TouchableOpacity
                style={[
                    styles.socialIcon,
                    isPressed && { backgroundColor: color },
                    shadows.small
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <Ionicons
                    name={icon}
                    size={18}
                    color={isPressed ? '#FFFFFF' : color}
                />
            </TouchableOpacity>
        </View>
    );
};

const SocialButtons = () => {
    const socialData = [
        {
            name: 'instagram',
            icon: 'logo-instagram',
            color: '#E4405F',
            url: 'https://www.instagram.com/nexgenxplorerr?igsh=YWV0ZHRuZDZ0M2V3',
            tooltip: 'Instagram'
        },
        {
            name: 'whatsapp',
            icon: 'logo-whatsapp',
            color: '#25D366',
            url: 'https://whatsapp.com/channel/0029VaU05uG9RZAeiXKyEu06',
            tooltip: 'WhatsApp'
        },
        {
            name: 'youtube',
            icon: 'logo-youtube',
            color: '#FF0000',
            url: 'https://youtube.com/@nexgenxplorer?si=UG-wBC8UIyeT4bbw',
            tooltip: 'YouTube'
        },
        {
            name: 'playstore',
            icon: 'logo-google-playstore',
            color: '#34A853',
            url: 'https://play.google.com/store/apps/dev?id=8262374975871504599',
            tooltip: 'Play Store'
        }
    ];

    return (
        <View style={styles.socialWrapper}>
            {socialData.map((social) => (
                <SocialButton key={social.name} {...social} />
            ))}
        </View>
    );
};

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
                colors={[theme.primary, theme.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>ABOUT</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>Learn more about us</Text>
                    </View>
                    <View style={styles.illustrationContainer}>
                        <Ionicons name="information-circle" size={60} color={theme.textInverse} style={{ opacity: 0.9 }} />
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

                    {/* Team Members */}
                    <View style={styles.teamMembers}>
                        <TouchableOpacity
                            style={styles.teamMember}
                            onPress={() => Linking.openURL('https://www.instagram.com/appu_kannadigaa?utm_source=qr&igsh=Nmxjbm8zb3Q1NGk4')}
                        >
                            <View style={[styles.memberAvatar, { backgroundColor: theme.accent3 }]}>
                                <Ionicons name="person" size={20} color={theme.primary} />
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={[styles.memberName, { color: theme.text }]}>Manvanth Gowda M</Text>
                                <View style={styles.instagramLink}>
                                    <Ionicons name="logo-instagram" size={14} color="#E4405F" />
                                    <Text style={[styles.memberHandle, { color: theme.textSecondary }]}>@appu_kannadigaa</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.teamMember}
                            onPress={() => Linking.openURL('https://www.instagram.com/mithun.gowda.b?igsh=MWJmODFpZDA1Z3hhZg==')}
                        >
                            <View style={[styles.memberAvatar, { backgroundColor: theme.accent3 }]}>
                                <Ionicons name="person" size={20} color={theme.primary} />
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={[styles.memberName, { color: theme.text }]}>Mithun Gowda B</Text>
                                <View style={styles.instagramLink}>
                                    <Ionicons name="logo-instagram" size={14} color="#E4405F" />
                                    <Text style={[styles.memberHandle, { color: theme.textSecondary }]}>@mithun.gowda.b</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                    <View style={[styles.cardIcon, { backgroundColor: theme.accent3 }]}>
                        <Ionicons name="mail" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Contact Us</Text>
                    <Text style={[styles.cardText, { color: theme.textSecondary }]}>
                        Have questions? Reach out to us
                    </Text>
                    <TouchableOpacity
                        style={styles.emailButton}
                        onPress={() => Linking.openURL('mailto:nxgextra@gmail.com')}
                    >
                        <Ionicons name="mail-outline" size={18} color={theme.primary} />
                        <Text style={[styles.emailText, { color: theme.primary }]}>nxgextra@gmail.com</Text>
                    </TouchableOpacity>
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

                    <SocialButtons />
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
    socialWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
        paddingTop: spacing.xl,
        gap: spacing.sm,
        height: 120,
    },
    socialButtonWrapper: {
        position: 'relative',
        margin: spacing.sm,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.2s',
    },
    tooltip: {
        position: 'absolute',
        top: -45,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 5,
        zIndex: 10,
        elevation: 5,
    },
    tooltipText: {
        fontSize: fontSize.sm,
        color: '#FFFFFF',
        fontWeight: fontWeight.medium,
    },
    tooltipArrow: {
        position: 'absolute',
        bottom: -3,
        left: '50%',
        marginLeft: -4,
        width: 8,
        height: 8,
        transform: [{ rotate: '45deg' }],
    },
    teamMembers: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    teamMember: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.sm,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: 2,
    },
    instagramLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberHandle: {
        fontSize: fontSize.sm,
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
