// Admin Service with Push Notification Integration
import firebase from 'firebase/compat/app';
import { db } from '../firebaseConfig';

// Backend URL for sending notifications
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

/**
 * Send notification to all users via backend
 */
const sendNotificationToAll = async (title, body, data = {}) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/notifications/send-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, body, data }),
        });

        const result = await response.json();
        console.log('Notification sent:', result);
        return result;
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification to a specific topic
 */
const sendNotificationToTopic = async (topic, title, body, data = {}) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/notifications/send-topic`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic, title, body, data }),
        });

        const result = await response.json();
        console.log(`Notification sent to topic ${topic}:`, result);
        return result;
    } catch (error) {
        console.error('Error sending topic notification:', error);
        return { success: false, error: error.message };
    }
};

// ==================== TOOLS ====================

/**
 * Add new tool and notify all users
 */
export const addTool = async (toolData, sendNotification = true) => {
    const docRef = await db.collection('tools').add({
        ...toolData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (sendNotification) {
        await sendNotificationToAll(
            'New Tool Available!',
            `Check out "${toolData.name}" - ${toolData.description?.substring(0, 50)}...`,
            { screen: 'Tools', itemId: docRef.id, type: 'tool' }
        );
    }

    return docRef.id;
};

/**
 * Update tool and optionally notify users
 */
export const updateTool = async (toolId, toolData, sendNotification = false) => {
    await db.collection('tools').doc(toolId).update({
        ...toolData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (sendNotification) {
        await sendNotificationToAll(
            'Tool Updated!',
            `"${toolData.name}" has been updated with new features`,
            { screen: 'Tools', itemId: toolId, type: 'tool' }
        );
    }
};

/**
 * Delete tool
 */
export const deleteTool = async (toolId) => {
    await db.collection('tools').doc(toolId).delete();
};

/**
 * Get all tools
 */
export const getAllTools = async () => {
    const snapshot = await db.collection('tools')
        .orderBy('createdAt', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== APPS ====================

/**
 * Add new app and notify all users
 */
export const addApp = async (appData, sendNotification = true) => {
    const docRef = await db.collection('apps').add({
        ...appData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (sendNotification) {
        await sendNotificationToAll(
            'New App Added!',
            `Discover "${appData.name}" - ${appData.description?.substring(0, 50)}...`,
            { screen: 'Apps', itemId: docRef.id, type: 'app' }
        );
    }

    return docRef.id;
};

/**
 * Update app and optionally notify users
 */
export const updateApp = async (appId, appData, sendNotification = false) => {
    await db.collection('apps').doc(appId).update({
        ...appData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (sendNotification) {
        await sendNotificationToAll(
            'App Updated!',
            `"${appData.name}" has new updates available`,
            { screen: 'Apps', itemId: appId, type: 'app' }
        );
    }
};

/**
 * Delete app
 */
export const deleteApp = async (appId) => {
    await db.collection('apps').doc(appId).delete();
};

/**
 * Get all apps
 */
export const getAllApps = async () => {
    const snapshot = await db.collection('apps')
        .orderBy('createdAt', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== VIDEOS (youtubeLinks collection) ====================

/**
 * Add new video and notify all users
 */
export const addVideo = async (videoData, sendNotification = true) => {
    const docRef = await db.collection('youtubeLinks').add({
        ...videoData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (sendNotification) {
        await sendNotificationToAll(
            'New Video Posted!',
            `Watch "${videoData.title}" now`,
            { screen: 'Media', itemId: docRef.id, type: 'video' }
        );
    }

    return docRef.id;
};

/**
 * Update video
 */
export const updateVideo = async (videoId, videoData, sendNotification = false) => {
    await db.collection('youtubeLinks').doc(videoId).update({
        ...videoData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (sendNotification) {
        await sendNotificationToAll(
            'Video Updated!',
            `"${videoData.title}" has been updated`,
            { screen: 'Media', itemId: videoId, type: 'video' }
        );
    }
};

/**
 * Delete video
 */
export const deleteVideo = async (videoId) => {
    await db.collection('youtubeLinks').doc(videoId).delete();
};

/**
 * Get all videos
 */
export const getAllVideos = async () => {
    const snapshot = await db.collection('youtubeLinks')
        .orderBy('createdAt', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== ANNOUNCEMENTS ====================

/**
 * Send announcement to all users
 */
export const sendAnnouncement = async (title, message, data = {}) => {
    // Save announcement to Firestore
    const docRef = await db.collection('announcements').add({
        title,
        message,
        data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Send push notification to all users
    await sendNotificationToAll(title, message, {
        ...data,
        type: 'announcement',
        announcementId: docRef.id,
    });

    return docRef.id;
};

/**
 * Get all announcements
 */
export const getAllAnnouncements = async () => {
    const snapshot = await db.collection('announcements')
        .orderBy('createdAt', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== CATEGORIES ====================

/**
 * Add new category
 */
export const addCategory = async (categoryData) => {
    const docRef = await db.collection('categories').add({
        ...categoryData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
};

/**
 * Get all categories
 */
export const getAllCategories = async () => {
    const snapshot = await db.collection('categories').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== ADMIN UTILITIES ====================

/**
 * Send custom notification
 */
export const sendCustomNotification = async (title, body, options = {}) => {
    const { topic, data = {} } = options;

    if (topic) {
        return await sendNotificationToTopic(topic, title, body, data);
    } else {
        return await sendNotificationToAll(title, body, data);
    }
};

/**
 * Get dashboard stats
 */
export const getDashboardStats = async () => {
    const [tools, apps, videos, users, devices] = await Promise.all([
        db.collection('tools').get(),
        db.collection('apps').get(),
        db.collection('videos').get(),
        db.collection('users').get(),
        fetch(`${BACKEND_URL}/api/devices/count`).then(r => r.json()).catch(() => ({ count: 0 })),
    ]);

    return {
        toolsCount: tools.size,
        appsCount: apps.size,
        videosCount: videos.size,
        usersCount: users.size,
        devicesCount: devices.count || 0,
    };
};

export default {
    // Tools
    addTool,
    updateTool,
    deleteTool,
    getAllTools,
    // Apps
    addApp,
    updateApp,
    deleteApp,
    getAllApps,
    // Videos
    addVideo,
    updateVideo,
    deleteVideo,
    getAllVideos,
    // Announcements
    sendAnnouncement,
    getAllAnnouncements,
    // Categories
    addCategory,
    getAllCategories,
    // Utilities
    sendCustomNotification,
    getDashboardStats,
};
