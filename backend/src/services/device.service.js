const { getFirestore } = require('../config/firebase');

class DeviceService {
    /**
     * Register a device token
     */
    async registerToken(token, userId = null, deviceInfo = {}) {
        const db = getFirestore();

        const tokenData = {
            token,
            userId,
            platform: deviceInfo.platform || 'unknown',
            deviceName: deviceInfo.deviceName || 'unknown',
            appVersion: deviceInfo.appVersion || '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
        };

        try {
            // Check if token already exists
            const existingToken = await db.collection('device_tokens')
                .where('token', '==', token)
                .get();

            if (!existingToken.empty) {
                // Update existing token
                const docId = existingToken.docs[0].id;
                await db.collection('device_tokens').doc(docId).update({
                    userId,
                    ...deviceInfo,
                    updatedAt: new Date().toISOString(),
                    isActive: true,
                });
                console.log(`📱 Token updated: ${token.substring(0, 20)}...`);
                return { success: true, action: 'updated', id: docId };
            }

            // Create new token
            const docRef = await db.collection('device_tokens').add(tokenData);
            console.log(`📱 Token registered: ${token.substring(0, 20)}...`);
            return { success: true, action: 'created', id: docRef.id };
        } catch (error) {
            console.error('❌ Error registering token:', error.message);
            throw error;
        }
    }

    /**
     * Unregister a device token
     */
    async unregisterToken(token) {
        const db = getFirestore();

        try {
            const snapshot = await db.collection('device_tokens')
                .where('token', '==', token)
                .get();

            if (snapshot.empty) {
                return { success: true, message: 'Token not found' };
            }

            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log(`🗑️ Token unregistered: ${token.substring(0, 20)}...`);
            return { success: true, message: 'Token unregistered' };
        } catch (error) {
            console.error('❌ Error unregistering token:', error.message);
            throw error;
        }
    }

    /**
     * Get all registered tokens
     */
    async getAllTokens() {
        const db = getFirestore();

        try {
            const snapshot = await db.collection('device_tokens')
                .where('isActive', '==', true)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ Error getting tokens:', error.message);
            throw error;
        }
    }

    /**
     * Get tokens by user ID
     */
    async getTokensByUser(userId) {
        const db = getFirestore();

        try {
            const snapshot = await db.collection('device_tokens')
                .where('userId', '==', userId)
                .where('isActive', '==', true)
                .get();

            return snapshot.docs.map(doc => doc.data().token);
        } catch (error) {
            console.error('❌ Error getting user tokens:', error.message);
            throw error;
        }
    }

    /**
     * Get token count
     */
    async getTokenCount() {
        const db = getFirestore();

        try {
            const snapshot = await db.collection('device_tokens')
                .where('isActive', '==', true)
                .count()
                .get();

            return snapshot.data().count;
        } catch (error) {
            console.error('❌ Error getting token count:', error.message);
            throw error;
        }
    }

    /**
     * Deactivate tokens for a user (e.g., on logout)
     */
    async deactivateUserTokens(userId) {
        const db = getFirestore();

        try {
            const snapshot = await db.collection('device_tokens')
                .where('userId', '==', userId)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    isActive: false,
                    updatedAt: new Date().toISOString()
                });
            });
            await batch.commit();

            return { success: true, count: snapshot.size };
        } catch (error) {
            console.error('❌ Error deactivating tokens:', error.message);
            throw error;
        }
    }
}

module.exports = new DeviceService();
