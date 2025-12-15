import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    FlatList,
    Dimensions,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, shadows } from '../../theme/colors';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from '@react-navigation/native';
import {
    getQRHistory,
    addToQRHistory,
    removeFromQRHistory,
    clearQRHistory,
    getQRTypeIcon,
    getQRTypeColor,
    formatHistoryTime,
    getHistoryWithFavorites,
    toggleFavorite,
    searchHistory,
    filterHistoryByType,
    copyToClipboard,
    exportHistory,
    getQRTemplates,
    generateWiFiQR,
    generateContactQR,
    generateEmailQR,
    generateSmsQR,
    generatePhoneQR,
    generateGeoQR,
    generateEventQR,
    getHistoryStats,
    detectQRType,
} from '../../services/qrHistoryService';

const { width } = Dimensions.get('window');

// QR Color presets
const QR_COLORS = [
    { name: 'Classic', fg: '#000000', bg: '#FFFFFF' },
    { name: 'Blue', fg: '#1E3A8A', bg: '#FFFFFF' },
    { name: 'Green', fg: '#166534', bg: '#FFFFFF' },
    { name: 'Purple', fg: '#7C3AED', bg: '#FFFFFF' },
    { name: 'Red', fg: '#DC2626', bg: '#FFFFFF' },
    { name: 'Orange', fg: '#EA580C', bg: '#FFFFFF' },
    { name: 'Teal', fg: '#0D9488', bg: '#FFFFFF' },
    { name: 'Pink', fg: '#DB2777', bg: '#FFFFFF' },
];

// Filter types
const FILTER_TYPES = [
    { id: 'all', name: 'All', icon: 'apps-outline' },
    { id: 'url', name: 'URLs', icon: 'globe-outline' },
    { id: 'text', name: 'Text', icon: 'document-text-outline' },
    { id: 'wifi', name: 'WiFi', icon: 'wifi-outline' },
    { id: 'contact', name: 'Contact', icon: 'person-outline' },
    { id: 'email', name: 'Email', icon: 'mail-outline' },
    { id: 'phone', name: 'Phone', icon: 'call-outline' },
];

export default function QRGeneratorScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('generate');
    const [url, setUrl] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedColor, setSelectedColor] = useState(QR_COLORS[0]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateData, setTemplateData] = useState({});
    const [stats, setStats] = useState({ total: 0, favorites: 0 });
    const viewShotRef = useRef();

    // Load history when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadHistory();
            loadStats();
        }, [])
    );

    // Filter history when search or filter changes
    useEffect(() => {
        filterHistory();
    }, [searchQuery, activeFilter, history]);

    const loadHistory = async () => {
        try {
            const data = await getHistoryWithFavorites();
            setHistory(data);
            setFilteredHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await getHistoryStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const filterHistory = async () => {
        let result = history;

        // Apply search filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase().trim();
            result = result.filter(item =>
                item.data.toLowerCase().includes(lowerQuery) ||
                item.type.toLowerCase().includes(lowerQuery)
            );
        }

        // Apply type filter
        if (activeFilter !== 'all') {
            result = result.filter(item => item.type === activeFilter);
        }

        setFilteredHistory(result);
    };

    const handleGenerate = async () => {
        if (url.trim()) {
            setGeneratedUrl(url);
            try {
                await addToQRHistory(url);
                loadHistory();
                loadStats();
            } catch (error) {
                console.error('Error saving to history:', error);
            }
        }
    };

    const handleGenerateFromTemplate = async () => {
        if (!selectedTemplate) return;

        let qrData = '';

        switch (selectedTemplate.id) {
            case 'url':
                qrData = templateData.url || '';
                break;
            case 'text':
                qrData = templateData.text || '';
                break;
            case 'wifi':
                qrData = generateWiFiQR(
                    templateData.ssid || '',
                    templateData.password || '',
                    templateData.encryption || 'WPA'
                );
                break;
            case 'contact':
                qrData = generateContactQR(templateData);
                break;
            case 'email':
                qrData = generateEmailQR(
                    templateData.email || '',
                    templateData.subject || '',
                    templateData.body || ''
                );
                break;
            case 'sms':
                qrData = generateSmsQR(templateData.phone || '', templateData.message || '');
                break;
            case 'phone':
                qrData = generatePhoneQR(templateData.phone || '');
                break;
            case 'location':
                qrData = generateGeoQR(
                    templateData.latitude || '0',
                    templateData.longitude || '0',
                    templateData.label || ''
                );
                break;
            case 'event':
                qrData = generateEventQR(templateData);
                break;
            default:
                qrData = templateData.text || '';
        }

        if (qrData) {
            setUrl(qrData);
            setGeneratedUrl(qrData);
            setShowTemplateModal(false);
            setSelectedTemplate(null);
            setTemplateData({});

            try {
                await addToQRHistory(qrData);
                loadHistory();
                loadStats();
            } catch (error) {
                console.error('Error saving to history:', error);
            }
        }
    };

    const handleSelectFromHistory = (item) => {
        setUrl(item.data);
        setGeneratedUrl(item.data);
        setActiveTab('generate');
    };

    const handleToggleFavorite = async (itemId) => {
        try {
            await toggleFavorite(itemId);
            loadHistory();
            loadStats();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleCopyToClipboard = async (text) => {
        const success = await copyToClipboard(text);
        if (success) {
            Alert.alert('Copied', 'Text copied to clipboard');
        } else {
            Alert.alert('Error', 'Failed to copy to clipboard');
        }
    };

    const handleDeleteHistoryItem = async (itemId) => {
        try {
            await removeFromQRHistory(itemId);
            loadHistory();
            loadStats();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleClearHistory = () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to clear all QR code history?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearQRHistory();
                            setHistory([]);
                            setFilteredHistory([]);
                            loadStats();
                            Alert.alert('Cleared', 'History has been cleared');
                        } catch (error) {
                            console.error('Error clearing history:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleExportHistory = async () => {
        const result = await exportHistory();
        if (result.success) {
            // Sharing dialog will appear automatically
        } else {
            Alert.alert('Error', 'Failed to export history');
        }
    };

    const handleSaveQR = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            const filename = `QRCode_${Date.now()}.png`;
            const newUri = FileSystem.documentDirectory + filename;
            await FileSystem.copyAsync({ from: uri, to: newUri });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(newUri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Save QR Code',
                });
            } else {
                Alert.alert('Success', `QR Code saved to: ${newUri}`);
            }
        } catch (error) {
            console.error('Error saving QR code:', error);
            Alert.alert('Error', 'Failed to save QR code. Please try again.');
        }
    };

    const handleShareQR = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Share QR Code',
                });
            } else {
                Alert.alert('Info', `QR Code Content: ${generatedUrl}`);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Error', 'Failed to share QR code.');
        }
    };

    // Open/Execute QR content based on type
    const handleOpenQRContent = async (data, type) => {
        try {
            let urlToOpen = data;
            let actionLabel = 'Open';

            // Determine what action to take based on type
            switch (type) {
                case 'url':
                case 'youtube':
                case 'instagram':
                case 'facebook':
                case 'twitter':
                case 'linkedin':
                case 'github':
                case 'playstore':
                case 'appstore':
                    // URLs - open directly
                    actionLabel = 'Open Link';
                    break;

                case 'phone':
                    // Phone - make call
                    if (!data.startsWith('tel:')) {
                        urlToOpen = `tel:${data}`;
                    }
                    actionLabel = 'Call';
                    break;

                case 'email':
                    // Email - compose email
                    if (!data.startsWith('mailto:')) {
                        urlToOpen = `mailto:${data}`;
                    }
                    actionLabel = 'Send Email';
                    break;

                case 'sms':
                    // SMS - compose message
                    if (!data.startsWith('sms:') && !data.startsWith('smsto:')) {
                        urlToOpen = `sms:${data}`;
                    }
                    actionLabel = 'Send SMS';
                    break;

                case 'location':
                    // Location - open in maps
                    if (data.startsWith('geo:')) {
                        // Convert geo: to maps URL for better compatibility
                        const coords = data.replace('geo:', '').split('?')[0];
                        urlToOpen = Platform.OS === 'ios'
                            ? `maps:?q=${coords}`
                            : `geo:${coords}?q=${coords}`;
                    }
                    actionLabel = 'Open in Maps';
                    break;

                case 'wifi':
                    // WiFi - show details (can't auto-connect on most devices)
                    Alert.alert(
                        'WiFi Network',
                        `Network details:\n${data}\n\nCopy the password and connect manually in WiFi settings.`,
                        [
                            { text: 'Copy Details', onPress: () => handleCopyToClipboard(data) },
                            { text: 'OK' }
                        ]
                    );
                    return;

                case 'contact':
                    // vCard - try to open contacts app
                    Alert.alert(
                        'Contact Card',
                        'Contact information detected. Copy to clipboard?',
                        [
                            { text: 'Copy', onPress: () => handleCopyToClipboard(data) },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                    return;

                case 'event':
                    // Calendar event
                    Alert.alert(
                        'Calendar Event',
                        'Event information detected. Copy to clipboard?',
                        [
                            { text: 'Copy', onPress: () => handleCopyToClipboard(data) },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                    return;

                default:
                    // Plain text - just copy
                    Alert.alert(
                        'Text Content',
                        data.length > 100 ? data.substring(0, 100) + '...' : data,
                        [
                            { text: 'Copy', onPress: () => handleCopyToClipboard(data) },
                            { text: 'OK' }
                        ]
                    );
                    return;
            }

            // Check if we can open the URL
            const canOpen = await Linking.canOpenURL(urlToOpen);
            if (canOpen) {
                await Linking.openURL(urlToOpen);
            } else {
                Alert.alert(
                    'Cannot Open',
                    `Unable to open: ${data}\n\nWould you like to copy it instead?`,
                    [
                        { text: 'Copy', onPress: () => handleCopyToClipboard(data) },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
            }
        } catch (error) {
            console.error('Error opening QR content:', error);
            Alert.alert(
                'Error',
                'Failed to open content. Would you like to copy it?',
                [
                    { text: 'Copy', onPress: () => handleCopyToClipboard(data) },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    // Share QR content as text (not image)
    const handleShareContent = async (data) => {
        try {
            await Sharing.shareAsync(data, {
                dialogTitle: 'Share QR Content',
                UTI: 'public.plain-text',
            });
        } catch (error) {
            // Fallback - use native share
            try {
                const result = await Share.share({
                    message: data,
                });
            } catch (shareError) {
                // Final fallback - copy to clipboard
                handleCopyToClipboard(data);
            }
        }
    };

    // Get action button label based on type
    const getActionLabel = (type) => {
        const labels = {
            url: 'Open Link',
            youtube: 'Open YouTube',
            instagram: 'Open Instagram',
            facebook: 'Open Facebook',
            twitter: 'Open Twitter',
            linkedin: 'Open LinkedIn',
            github: 'Open GitHub',
            playstore: 'Open Play Store',
            appstore: 'Open App Store',
            phone: 'Call',
            email: 'Send Email',
            sms: 'Send SMS',
            location: 'Open Maps',
            wifi: 'View WiFi',
            contact: 'View Contact',
            event: 'View Event',
            text: 'View',
        };
        return labels[type] || 'Open';
    };

    const renderTemplateFields = () => {
        if (!selectedTemplate) return null;

        const fieldConfigs = {
            url: [{ key: 'url', label: 'URL', placeholder: 'https://example.com' }],
            text: [{ key: 'text', label: 'Text', placeholder: 'Enter your text', multiline: true }],
            wifi: [
                { key: 'ssid', label: 'Network Name (SSID)', placeholder: 'MyWiFi' },
                { key: 'password', label: 'Password', placeholder: 'Password', secure: true },
                { key: 'encryption', label: 'Security (WPA/WEP/nopass)', placeholder: 'WPA' },
            ],
            contact: [
                { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { key: 'phone', label: 'Phone', placeholder: '+1234567890' },
                { key: 'email', label: 'Email', placeholder: 'john@example.com' },
                { key: 'organization', label: 'Organization', placeholder: 'Company Inc.' },
            ],
            email: [
                { key: 'email', label: 'Email Address', placeholder: 'recipient@example.com' },
                { key: 'subject', label: 'Subject', placeholder: 'Email subject' },
                { key: 'body', label: 'Message', placeholder: 'Email body', multiline: true },
            ],
            sms: [
                { key: 'phone', label: 'Phone Number', placeholder: '+1234567890' },
                { key: 'message', label: 'Message', placeholder: 'Your message', multiline: true },
            ],
            phone: [{ key: 'phone', label: 'Phone Number', placeholder: '+1234567890' }],
            location: [
                { key: 'latitude', label: 'Latitude', placeholder: '37.7749' },
                { key: 'longitude', label: 'Longitude', placeholder: '-122.4194' },
                { key: 'label', label: 'Label (optional)', placeholder: 'San Francisco' },
            ],
            event: [
                { key: 'title', label: 'Event Title', placeholder: 'Meeting' },
                { key: 'location', label: 'Location', placeholder: 'Conference Room' },
                { key: 'startDate', label: 'Start (YYYY-MM-DD HH:MM)', placeholder: '2024-01-15 10:00' },
                { key: 'endDate', label: 'End (YYYY-MM-DD HH:MM)', placeholder: '2024-01-15 11:00' },
            ],
        };

        const fields = fieldConfigs[selectedTemplate.id] || [];

        return fields.map((field) => (
            <View key={field.key} style={styles.templateField}>
                <Text style={[styles.templateLabel, { color: theme.text }]}>{field.label}</Text>
                <TextInput
                    style={[
                        styles.templateInput,
                        { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundSecondary },
                        field.multiline && { height: 80, textAlignVertical: 'top' },
                    ]}
                    value={templateData[field.key] || ''}
                    onChangeText={(text) => setTemplateData({ ...templateData, [field.key]: text })}
                    placeholder={field.placeholder}
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={field.secure}
                    multiline={field.multiline}
                    autoCapitalize="none"
                />
            </View>
        ));
    };

    const renderHistoryItem = ({ item }) => {
        const icon = getQRTypeIcon(item.type);
        const color = getQRTypeColor(item.type);

        // Determine action icon based on type
        const getActionIcon = (type) => {
            const icons = {
                url: 'open-outline',
                youtube: 'play-circle-outline',
                instagram: 'open-outline',
                facebook: 'open-outline',
                twitter: 'open-outline',
                linkedin: 'open-outline',
                github: 'open-outline',
                playstore: 'open-outline',
                appstore: 'open-outline',
                phone: 'call-outline',
                email: 'mail-outline',
                sms: 'chatbubble-outline',
                location: 'navigate-outline',
                wifi: 'wifi-outline',
                contact: 'person-add-outline',
                event: 'calendar-outline',
                text: 'document-text-outline',
            };
            return icons[type] || 'open-outline';
        };

        return (
            <View style={[styles.historyItem, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                <TouchableOpacity
                    style={styles.historyItemMain}
                    onPress={() => handleSelectFromHistory(item)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.historyIcon, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.historyInfo}>
                        <Text style={[styles.historyData, { color: theme.text }]} numberOfLines={1}>
                            {item.data}
                        </Text>
                        <Text style={[styles.historyTime, { color: theme.textSecondary }]}>
                            {formatHistoryTime(item.timestamp)} • {item.type.toUpperCase()}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.historyActions}>
                    {/* Open/Action Button - Primary action */}
                    <TouchableOpacity
                        style={[styles.historyActionBtn, styles.openActionBtn, { backgroundColor: color + '20' }]}
                        onPress={() => handleOpenQRContent(item.data, item.type)}
                    >
                        <Ionicons name={getActionIcon(item.type)} size={18} color={color} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.historyActionBtn}
                        onPress={() => handleToggleFavorite(item.id)}
                    >
                        <Ionicons
                            name={item.isFavorite ? 'star' : 'star-outline'}
                            size={18}
                            color={item.isFavorite ? '#FFD700' : theme.textSecondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.historyActionBtn}
                        onPress={() => handleCopyToClipboard(item.data)}
                    >
                        <Ionicons name="copy-outline" size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.historyActionBtn}
                        onPress={() => handleDeleteHistoryItem(item.id)}
                    >
                        <Ionicons name="trash-outline" size={18} color={theme.error || '#FF6B6B'} />
                    </TouchableOpacity>
                </View>
            </View>
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
                        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>QR CODE</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textInverse }]}>
                            Generate & manage QR codes
                        </Text>
                    </View>
                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: theme.textInverse }]}>{stats.total}</Text>
                            <Text style={[styles.statLabel, { color: theme.textInverse }]}>Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: theme.textInverse }]}>{stats.favorites}</Text>
                            <Text style={[styles.statLabel, { color: theme.textInverse }]}>Starred</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'generate' && { backgroundColor: theme.accent1 }]}
                    onPress={() => setActiveTab('generate')}
                >
                    <Ionicons
                        name="add-circle"
                        size={20}
                        color={activeTab === 'generate' ? theme.primary : theme.textSecondary}
                    />
                    <Text style={[styles.tabText, { color: activeTab === 'generate' ? theme.primary : theme.textSecondary }]}>
                        Generate
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && { backgroundColor: theme.accent1 }]}
                    onPress={() => setActiveTab('history')}
                >
                    <Ionicons
                        name="time"
                        size={20}
                        color={activeTab === 'history' ? theme.primary : theme.textSecondary}
                    />
                    <Text style={[styles.tabText, { color: activeTab === 'history' ? theme.primary : theme.textSecondary }]}>
                        History ({history.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Generate Tab */}
            {activeTab === 'generate' && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    {/* Template Selector */}
                    <TouchableOpacity
                        style={[styles.templateSelector, { backgroundColor: theme.backgroundCard }, shadows.small]}
                        onPress={() => setShowTemplateModal(true)}
                    >
                        <Ionicons name="apps-outline" size={24} color={theme.primary} />
                        <Text style={[styles.templateSelectorText, { color: theme.text }]}>
                            Use QR Template (WiFi, Contact, Email...)
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <View style={[styles.inputCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                        <Text style={[styles.label, { color: theme.text }]}>Enter URL or Text</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
                            value={url}
                            onChangeText={setUrl}
                            placeholder="https://example.com or any text"
                            placeholderTextColor={theme.textSecondary}
                            autoCapitalize="none"
                            multiline
                        />

                        {/* Color Selector */}
                        <Text style={[styles.label, { color: theme.text, marginTop: spacing.md }]}>QR Color</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                            {QR_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color.name}
                                    style={[
                                        styles.colorOption,
                                        { borderColor: selectedColor.name === color.name ? theme.primary : theme.border },
                                        selectedColor.name === color.name && { borderWidth: 2 },
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                >
                                    <View style={[styles.colorPreview, { backgroundColor: color.fg }]} />
                                    <Text style={[styles.colorName, { color: theme.textSecondary }]}>{color.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: theme.primary }, shadows.medium]}
                            onPress={handleGenerate}
                        >
                            <Text style={[styles.generateButtonText, { color: theme.textInverse }]}>Generate QR Code</Text>
                            <Ionicons name="flash" size={20} color={theme.textInverse} />
                        </TouchableOpacity>
                    </View>

                    {/* QR Code Display */}
                    {generatedUrl ? (
                        <View style={[styles.qrCard, { backgroundColor: theme.backgroundCard }, shadows.large]}>
                            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                                <View style={styles.qrContainer}>
                                    <QRCode
                                        value={generatedUrl}
                                        size={200}
                                        color={selectedColor.fg}
                                        backgroundColor={selectedColor.bg}
                                    />
                                </View>
                            </ViewShot>
                            <Text style={[styles.qrUrl, { color: theme.textSecondary }]} numberOfLines={2}>
                                {generatedUrl}
                            </Text>

                            {/* Primary Action Button - Open/Execute */}
                            <TouchableOpacity
                                style={[styles.primaryActionButton, { backgroundColor: theme.primary }]}
                                onPress={() => handleOpenQRContent(generatedUrl, detectQRType(generatedUrl))}
                            >
                                <Ionicons name="open-outline" size={22} color={theme.textInverse} />
                                <Text style={[styles.primaryActionText, { color: theme.textInverse }]}>
                                    {getActionLabel(detectQRType(generatedUrl))}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                                    onPress={() => handleCopyToClipboard(generatedUrl)}
                                >
                                    <Ionicons name="copy" size={20} color={theme.primary} />
                                    <Text style={[styles.actionButtonText, { color: theme.primary }]}>Copy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                                    onPress={handleSaveQR}
                                >
                                    <Ionicons name="download" size={20} color={theme.primary} />
                                    <Text style={[styles.actionButtonText, { color: theme.primary }]}>Save</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.accent3 }]}
                                    onPress={handleShareQR}
                                >
                                    <Ionicons name="share-social" size={20} color={theme.primary} />
                                    <Text style={[styles.actionButtonText, { color: theme.primary }]}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.placeholderCard, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                            <Ionicons name="qr-code-outline" size={80} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                                Your QR code will appear here
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <View style={styles.historyContainer}>
                    {/* Search Bar */}
                    <View style={[styles.searchBar, { backgroundColor: theme.backgroundCard }, shadows.small]}>
                        <Ionicons name="search" size={20} color={theme.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search history..."
                            placeholderTextColor={theme.textSecondary}
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Type Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {FILTER_TYPES.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: activeFilter === filter.id ? theme.primary : theme.backgroundCard },
                                ]}
                                onPress={() => setActiveFilter(filter.id)}
                            >
                                <Ionicons
                                    name={filter.icon}
                                    size={16}
                                    color={activeFilter === filter.id ? theme.textInverse : theme.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.filterText,
                                        { color: activeFilter === filter.id ? theme.textInverse : theme.textSecondary },
                                    ]}
                                >
                                    {filter.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Action Buttons */}
                    {history.length > 0 && (
                        <View style={styles.historyActions2}>
                            <TouchableOpacity
                                style={[styles.historyActionButton, { backgroundColor: theme.accent3 }]}
                                onPress={handleExportHistory}
                            >
                                <Ionicons name="download-outline" size={18} color={theme.primary} />
                                <Text style={[styles.historyActionText, { color: theme.primary }]}>Export</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.historyActionButton, { backgroundColor: theme.error + '20' }]}
                                onPress={handleClearHistory}
                            >
                                <Ionicons name="trash" size={18} color={theme.error || '#FF6B6B'} />
                                <Text style={[styles.historyActionText, { color: theme.error || '#FF6B6B' }]}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <FlatList
                        data={filteredHistory}
                        renderItem={renderHistoryItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.historyList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={60} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                    {searchQuery || activeFilter !== 'all'
                                        ? 'No matching QR codes found'
                                        : 'No QR codes generated yet'}
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                                    {searchQuery || activeFilter !== 'all'
                                        ? 'Try a different search or filter'
                                        : 'Generate a QR code to see it here'}
                                </Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* Template Modal */}
            <Modal
                visible={showTemplateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTemplateModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>QR Code Templates</Text>
                            <TouchableOpacity onPress={() => {
                                setShowTemplateModal(false);
                                setSelectedTemplate(null);
                                setTemplateData({});
                            }}>
                                <Ionicons name="close" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {!selectedTemplate ? (
                            <ScrollView style={styles.templateList}>
                                {getQRTemplates().map((template) => (
                                    <TouchableOpacity
                                        key={template.id}
                                        style={[styles.templateItem, { borderColor: theme.border }]}
                                        onPress={() => setSelectedTemplate(template)}
                                    >
                                        <View style={[styles.templateIcon, { backgroundColor: theme.accent3 }]}>
                                            <Ionicons name={template.icon} size={24} color={theme.primary} />
                                        </View>
                                        <Text style={[styles.templateName, { color: theme.text }]}>{template.name}</Text>
                                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <ScrollView style={styles.templateForm}>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => {
                                        setSelectedTemplate(null);
                                        setTemplateData({});
                                    }}
                                >
                                    <Ionicons name="arrow-back" size={20} color={theme.primary} />
                                    <Text style={[styles.backButtonText, { color: theme.primary }]}>Back to Templates</Text>
                                </TouchableOpacity>

                                <View style={[styles.selectedTemplateHeader, { backgroundColor: theme.accent3 }]}>
                                    <Ionicons name={selectedTemplate.icon} size={28} color={theme.primary} />
                                    <Text style={[styles.selectedTemplateName, { color: theme.text }]}>
                                        {selectedTemplate.name}
                                    </Text>
                                </View>

                                {renderTemplateFields()}

                                <TouchableOpacity
                                    style={[styles.generateTemplateButton, { backgroundColor: theme.primary }]}
                                    onPress={handleGenerateFromTemplate}
                                >
                                    <Text style={[styles.generateTemplateText, { color: theme.textInverse }]}>
                                        Generate QR Code
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: fontSize.md,
        opacity: 0.9,
        marginTop: spacing.xs,
    },
    headerStats: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    statLabel: {
        fontSize: fontSize.xs,
        opacity: 0.8,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginTop: -spacing.lg,
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
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    tabText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
        paddingBottom: 120,
    },
    templateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.md,
    },
    templateSelectorText: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    inputCard: {
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },
    input: {
        fontSize: fontSize.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        minHeight: 48,
    },
    colorScroll: {
        marginBottom: spacing.md,
    },
    colorOption: {
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        marginRight: spacing.sm,
        minWidth: 60,
    },
    colorPreview: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginBottom: 4,
    },
    colorName: {
        fontSize: fontSize.xs,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    generateButtonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    qrCard: {
        padding: spacing.xl,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    qrContainer: {
        padding: spacing.lg,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    qrUrl: {
        fontSize: fontSize.sm,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    primaryActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        marginBottom: spacing.md,
        width: '100%',
    },
    primaryActionText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    actionButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    placeholderCard: {
        padding: spacing.xxl,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        minHeight: 300,
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: fontSize.md,
        marginTop: spacing.md,
    },
    // History styles
    historyContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSize.md,
        paddingVertical: spacing.xs,
    },
    filterScroll: {
        maxHeight: 44,
        marginBottom: spacing.sm,
    },
    filterContainer: {
        gap: spacing.sm,
        paddingRight: spacing.md,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.round,
        gap: spacing.xs,
    },
    filterText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    historyActions2: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    historyActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    historyActionText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
    },
    historyList: {
        paddingBottom: 120,
    },
    historyItem: {
        flexDirection: 'column',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    historyItemMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    historyIcon: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyInfo: {
        flex: 1,
    },
    historyData: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        marginBottom: 2,
    },
    historyTime: {
        fontSize: fontSize.xs,
    },
    historyActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.xs,
    },
    historyActionBtn: {
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    openActionBtn: {
        borderRadius: borderRadius.md,
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: borderRadius.xxl,
        borderTopRightRadius: borderRadius.xxl,
        maxHeight: '85%',
        paddingBottom: spacing.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    templateList: {
        padding: spacing.lg,
    },
    templateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    templateIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    templateName: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
    templateForm: {
        padding: spacing.lg,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    backButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    selectedTemplateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    selectedTemplateName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    templateField: {
        marginBottom: spacing.md,
    },
    templateLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.xs,
    },
    templateInput: {
        fontSize: fontSize.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    generateTemplateButton: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    generateTemplateText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
});
