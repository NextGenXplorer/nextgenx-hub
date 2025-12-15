import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const QR_HISTORY_KEY = '@nextgenx_qr_generated_history';
const QR_FAVORITES_KEY = '@nextgenx_qr_favorites';
const MAX_HISTORY_ITEMS = 50;

/**
 * QR Code Generation History Service
 * Stores generated QR codes locally using AsyncStorage
 */

// Get all generation history
export const getQRHistory = async () => {
    try {
        const historyJson = await AsyncStorage.getItem(QR_HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error('Error getting QR history:', error);
        return [];
    }
};

// Add a scanned QR to history
export const addToQRHistory = async (data, type = 'unknown') => {
    try {
        const history = await getQRHistory();

        // Check if this exact data was recently scanned (avoid duplicates)
        const recentDuplicate = history.find(
            item => item.data === data &&
            (Date.now() - new Date(item.timestamp).getTime()) < 60000 // 1 minute
        );

        if (recentDuplicate) {
            return history; // Don't add duplicate
        }

        // Detect type of QR content
        const detectedType = detectQRType(data);

        // Create new history item
        const newItem = {
            id: Date.now().toString(),
            data: data,
            type: detectedType,
            timestamp: new Date().toISOString(),
        };

        // Add to beginning of array (most recent first)
        const updatedHistory = [newItem, ...history];

        // Limit history size
        if (updatedHistory.length > MAX_HISTORY_ITEMS) {
            updatedHistory.pop();
        }

        await AsyncStorage.setItem(QR_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    } catch (error) {
        console.error('Error adding to QR history:', error);
        throw error;
    }
};

// Remove a single item from history
export const removeFromQRHistory = async (itemId) => {
    try {
        const history = await getQRHistory();
        const updatedHistory = history.filter(item => item.id !== itemId);
        await AsyncStorage.setItem(QR_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    } catch (error) {
        console.error('Error removing from QR history:', error);
        throw error;
    }
};

// Clear all history
export const clearQRHistory = async () => {
    try {
        await AsyncStorage.removeItem(QR_HISTORY_KEY);
        return [];
    } catch (error) {
        console.error('Error clearing QR history:', error);
        throw error;
    }
};

// Detect the type of QR content
export const detectQRType = (data) => {
    if (!data) return 'text';

    const lowerData = data.toLowerCase();

    // URL patterns
    if (lowerData.startsWith('http://') || lowerData.startsWith('https://')) {
        if (lowerData.includes('youtube.com') || lowerData.includes('youtu.be')) {
            return 'youtube';
        }
        if (lowerData.includes('instagram.com')) {
            return 'instagram';
        }
        if (lowerData.includes('facebook.com') || lowerData.includes('fb.com')) {
            return 'facebook';
        }
        if (lowerData.includes('twitter.com') || lowerData.includes('x.com')) {
            return 'twitter';
        }
        if (lowerData.includes('linkedin.com')) {
            return 'linkedin';
        }
        if (lowerData.includes('github.com')) {
            return 'github';
        }
        if (lowerData.includes('play.google.com')) {
            return 'playstore';
        }
        if (lowerData.includes('apps.apple.com')) {
            return 'appstore';
        }
        return 'url';
    }

    // Phone number
    if (lowerData.startsWith('tel:') || /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(data)) {
        return 'phone';
    }

    // Email
    if (lowerData.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
        return 'email';
    }

    // SMS
    if (lowerData.startsWith('sms:') || lowerData.startsWith('smsto:')) {
        return 'sms';
    }

    // WiFi
    if (lowerData.startsWith('wifi:')) {
        return 'wifi';
    }

    // vCard/Contact
    if (lowerData.startsWith('begin:vcard')) {
        return 'contact';
    }

    // Calendar event
    if (lowerData.startsWith('begin:vevent')) {
        return 'event';
    }

    // Geo location
    if (lowerData.startsWith('geo:')) {
        return 'location';
    }

    return 'text';
};

// Get icon for QR type
export const getQRTypeIcon = (type) => {
    const icons = {
        url: 'globe-outline',
        youtube: 'logo-youtube',
        instagram: 'logo-instagram',
        facebook: 'logo-facebook',
        twitter: 'logo-twitter',
        linkedin: 'logo-linkedin',
        github: 'logo-github',
        playstore: 'logo-google-playstore',
        appstore: 'logo-apple-appstore',
        phone: 'call-outline',
        email: 'mail-outline',
        sms: 'chatbubble-outline',
        wifi: 'wifi-outline',
        contact: 'person-outline',
        event: 'calendar-outline',
        location: 'location-outline',
        text: 'document-text-outline',
    };
    return icons[type] || 'qr-code-outline';
};

// Get color for QR type
export const getQRTypeColor = (type) => {
    const colors = {
        url: '#4285F4',
        youtube: '#FF0000',
        instagram: '#E4405F',
        facebook: '#1877F2',
        twitter: '#1DA1F2',
        linkedin: '#0A66C2',
        github: '#333333',
        playstore: '#34A853',
        appstore: '#0D96F6',
        phone: '#34C759',
        email: '#FF9500',
        sms: '#5856D6',
        wifi: '#00C7BE',
        contact: '#FF2D55',
        event: '#AF52DE',
        location: '#FF3B30',
        text: '#8E8E93',
    };
    return colors[type] || '#8E8E93';
};

// Format timestamp for display
export const formatHistoryTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
};

// ==================== FAVORITES ====================

// Get all favorites
export const getFavorites = async () => {
    try {
        const favoritesJson = await AsyncStorage.getItem(QR_FAVORITES_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
};

// Toggle favorite status
export const toggleFavorite = async (itemId) => {
    try {
        const favorites = await getFavorites();
        const index = favorites.indexOf(itemId);

        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(itemId);
        }

        await AsyncStorage.setItem(QR_FAVORITES_KEY, JSON.stringify(favorites));
        return favorites;
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
};

// Check if item is favorite
export const isFavorite = async (itemId) => {
    const favorites = await getFavorites();
    return favorites.includes(itemId);
};

// ==================== SEARCH & FILTER ====================

// Search history by query
export const searchHistory = async (query) => {
    try {
        const history = await getQRHistory();
        if (!query || !query.trim()) return history;

        const lowerQuery = query.toLowerCase().trim();
        return history.filter(item =>
            item.data.toLowerCase().includes(lowerQuery) ||
            item.type.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
        console.error('Error searching history:', error);
        return [];
    }
};

// Filter history by type
export const filterHistoryByType = async (type) => {
    try {
        const history = await getQRHistory();
        if (!type || type === 'all') return history;
        return history.filter(item => item.type === type);
    } catch (error) {
        console.error('Error filtering history:', error);
        return [];
    }
};

// Get history with favorites marked
export const getHistoryWithFavorites = async () => {
    try {
        const [history, favorites] = await Promise.all([
            getQRHistory(),
            getFavorites()
        ]);

        return history.map(item => ({
            ...item,
            isFavorite: favorites.includes(item.id)
        }));
    } catch (error) {
        console.error('Error getting history with favorites:', error);
        return [];
    }
};

// ==================== CLIPBOARD ====================

// Copy data to clipboard
export const copyToClipboard = async (text) => {
    try {
        await Clipboard.setStringAsync(text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
};

// ==================== EXPORT ====================

// Export history to JSON file
export const exportHistory = async () => {
    try {
        const history = await getQRHistory();
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            itemCount: history.length,
            items: history
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        const filename = `qr_history_${Date.now()}.json`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, jsonContent);

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Export QR History',
            });
        }

        return { success: true, path: fileUri };
    } catch (error) {
        console.error('Error exporting history:', error);
        return { success: false, error: error.message };
    }
};

// ==================== QR TEMPLATES ====================

// Generate WiFi QR data
export const generateWiFiQR = (ssid, password, encryption = 'WPA') => {
    // Format: WIFI:T:WPA;S:mynetwork;P:mypass;;
    return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
};

// Generate Contact (vCard) QR data
export const generateContactQR = ({ name, phone, email, organization, title, url }) => {
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    if (name) vcard += `FN:${name}\n`;
    if (phone) vcard += `TEL:${phone}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (organization) vcard += `ORG:${organization}\n`;
    if (title) vcard += `TITLE:${title}\n`;
    if (url) vcard += `URL:${url}\n`;
    vcard += 'END:VCARD';
    return vcard;
};

// Generate Email QR data
export const generateEmailQR = (email, subject = '', body = '') => {
    let mailto = `mailto:${email}`;
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    if (params.length > 0) mailto += `?${params.join('&')}`;
    return mailto;
};

// Generate SMS QR data
export const generateSmsQR = (phone, message = '') => {
    return message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
};

// Generate Phone QR data
export const generatePhoneQR = (phone) => {
    return `tel:${phone}`;
};

// Generate Geo Location QR data
export const generateGeoQR = (latitude, longitude, label = '') => {
    return label
        ? `geo:${latitude},${longitude}?q=${encodeURIComponent(label)}`
        : `geo:${latitude},${longitude}`;
};

// Generate Calendar Event QR data
export const generateEventQR = ({ title, location, startDate, endDate, description }) => {
    const formatDate = (date) => {
        return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let vevent = 'BEGIN:VEVENT\n';
    if (title) vevent += `SUMMARY:${title}\n`;
    if (location) vevent += `LOCATION:${location}\n`;
    if (startDate) vevent += `DTSTART:${formatDate(startDate)}\n`;
    if (endDate) vevent += `DTEND:${formatDate(endDate)}\n`;
    if (description) vevent += `DESCRIPTION:${description}\n`;
    vevent += 'END:VEVENT';
    return vevent;
};

// Get all available QR templates
export const getQRTemplates = () => [
    { id: 'url', name: 'URL / Website', icon: 'globe-outline', fields: ['url'] },
    { id: 'text', name: 'Plain Text', icon: 'document-text-outline', fields: ['text'] },
    { id: 'wifi', name: 'WiFi Network', icon: 'wifi-outline', fields: ['ssid', 'password', 'encryption'] },
    { id: 'contact', name: 'Contact Card', icon: 'person-outline', fields: ['name', 'phone', 'email', 'organization'] },
    { id: 'email', name: 'Email', icon: 'mail-outline', fields: ['email', 'subject', 'body'] },
    { id: 'sms', name: 'SMS Message', icon: 'chatbubble-outline', fields: ['phone', 'message'] },
    { id: 'phone', name: 'Phone Number', icon: 'call-outline', fields: ['phone'] },
    { id: 'location', name: 'Location', icon: 'location-outline', fields: ['latitude', 'longitude', 'label'] },
    { id: 'event', name: 'Calendar Event', icon: 'calendar-outline', fields: ['title', 'location', 'startDate', 'endDate'] },
];

// ==================== STATISTICS ====================

// Get history statistics
export const getHistoryStats = async () => {
    try {
        const history = await getQRHistory();
        const favorites = await getFavorites();

        const typeCounts = {};
        history.forEach(item => {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });

        return {
            total: history.length,
            favorites: favorites.length,
            byType: typeCounts,
            lastGenerated: history[0]?.timestamp || null,
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return { total: 0, favorites: 0, byType: {}, lastGenerated: null };
    }
};
