const { getMessaging, getFirestore } = require('../config/firebase');

class FCMService {
    /**
     * Send notification to a single device
     */
    async sendToDevice(token, title, body, data = {}) {
        const messaging = getMessaging();

        const message = {
            token,
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'nextgenx_channel',
                    priority: 'high',
                    defaultSound: true,
                    defaultVibrateTimings: true,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        };

        try {
            const response = await messaging.send(message);
            console.log('✅ Notification sent:', response);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('❌ Error sending notification:', error.message);

            // Handle invalid token
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                await this.removeInvalidToken(token);
            }

            throw error;
        }
    }

    /**
     * Send notification to multiple devices
     */
    async sendToMultipleDevices(tokens, title, body, data = {}) {
        const messaging = getMessaging();

        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'nextgenx_channel',
                    priority: 'high',
                    defaultSound: true,
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
            tokens,
        };

        try {
            const response = await messaging.sendEachForMulticast(message);
            console.log(`✅ Sent to ${response.successCount}/${tokens.length} devices`);

            // Handle failed tokens
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                        console.log(`Failed token: ${tokens[idx]}, Error: ${resp.error?.message}`);
                    }
                });

                // Remove invalid tokens
                await this.removeInvalidTokens(failedTokens);
            }

            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        } catch (error) {
            console.error('❌ Error sending multicast:', error.message);
            throw error;
        }
    }

    /**
     * Send notification to a topic
     */
    async sendToTopic(topic, title, body, data = {}) {
        const messaging = getMessaging();

        const message = {
            topic,
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'nextgenx_channel',
                    priority: 'high',
                    defaultSound: true,
                },
            },
        };

        try {
            const response = await messaging.send(message);
            console.log(`✅ Notification sent to topic "${topic}":`, response);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('❌ Error sending to topic:', error.message);
            throw error;
        }
    }

    /**
     * Send notification to all registered devices
     */
    async sendToAll(title, body, data = {}) {
        const db = getFirestore();

        try {
            const snapshot = await db.collection('device_tokens').get();
            const tokens = snapshot.docs.map(doc => doc.data().token);

            if (tokens.length === 0) {
                return { success: true, message: 'No devices registered' };
            }

            // FCM allows max 500 tokens per multicast
            const batchSize = 500;
            const results = [];

            for (let i = 0; i < tokens.length; i += batchSize) {
                const batch = tokens.slice(i, i + batchSize);
                const result = await this.sendToMultipleDevices(batch, title, body, data);
                results.push(result);
            }

            const totalSuccess = results.reduce((sum, r) => sum + r.successCount, 0);
            const totalFailure = results.reduce((sum, r) => sum + r.failureCount, 0);

            return {
                success: true,
                totalDevices: tokens.length,
                successCount: totalSuccess,
                failureCount: totalFailure,
            };
        } catch (error) {
            console.error('❌ Error sending to all devices:', error.message);
            throw error;
        }
    }

    /**
     * Subscribe device to a topic
     */
    async subscribeToTopic(token, topic) {
        const messaging = getMessaging();

        try {
            await messaging.subscribeToTopic(token, topic);
            console.log(`✅ Subscribed to topic: ${topic}`);
            return { success: true, topic };
        } catch (error) {
            console.error('❌ Error subscribing to topic:', error.message);
            throw error;
        }
    }

    /**
     * Unsubscribe device from a topic
     */
    async unsubscribeFromTopic(token, topic) {
        const messaging = getMessaging();

        try {
            await messaging.unsubscribeFromTopic(token, topic);
            console.log(`✅ Unsubscribed from topic: ${topic}`);
            return { success: true, topic };
        } catch (error) {
            console.error('❌ Error unsubscribing from topic:', error.message);
            throw error;
        }
    }

    /**
     * Remove invalid token from database
     */
    async removeInvalidToken(token) {
        const db = getFirestore();

        try {
            const snapshot = await db.collection('device_tokens')
                .where('token', '==', token)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log(`🗑️ Removed invalid token: ${token.substring(0, 20)}...`);
        } catch (error) {
            console.error('Error removing invalid token:', error.message);
        }
    }

    /**
     * Remove multiple invalid tokens
     */
    async removeInvalidTokens(tokens) {
        for (const token of tokens) {
            await this.removeInvalidToken(token);
        }
    }
}

module.exports = new FCMService();
