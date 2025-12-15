const fcmService = require('../services/fcm.service');
const deviceService = require('../services/device.service');

/**
 * Send notification to a single device
 */
exports.sendToDevice = async (req, res, next) => {
    try {
        const { token, title, body, data } = req.body;

        if (!token || !title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: token, title, body'
            });
        }

        const result = await fcmService.sendToDevice(token, title, body, data);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification to multiple devices
 */
exports.sendToMultiple = async (req, res, next) => {
    try {
        const { tokens, title, body, data } = req.body;

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid tokens array'
            });
        }

        if (!title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, body'
            });
        }

        const result = await fcmService.sendToMultipleDevices(tokens, title, body, data);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification to a topic
 */
exports.sendToTopic = async (req, res, next) => {
    try {
        const { topic, title, body, data } = req.body;

        if (!topic || !title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: topic, title, body'
            });
        }

        const result = await fcmService.sendToTopic(topic, title, body, data);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification to all registered devices
 */
exports.sendToAll = async (req, res, next) => {
    try {
        const { title, body, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, body'
            });
        }

        const result = await fcmService.sendToAll(title, body, data);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification to a specific user (all their devices)
 */
exports.sendToUser = async (req, res, next) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, title, body'
            });
        }

        const tokens = await deviceService.getTokensByUser(userId);

        if (tokens.length === 0) {
            return res.json({
                success: true,
                message: 'No devices registered for this user'
            });
        }

        // Filter only FCM tokens (Firebase Admin SDK doesn't support Expo tokens)
        const fcmTokens = tokens.filter(t => !t.startsWith('ExponentPushToken'));
        const expoTokens = tokens.filter(t => t.startsWith('ExponentPushToken'));

        if (fcmTokens.length === 0) {
            return res.json({
                success: true,
                message: 'No FCM devices registered for this user',
                totalTokens: tokens.length,
                expoTokens: expoTokens.length,
                note: 'Expo tokens require Expo Push Service'
            });
        }

        const result = await fcmService.sendToMultipleDevices(fcmTokens, title, body, data);
        res.json({
            ...result,
            expoTokensSkipped: expoTokens.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Subscribe device to topic
 */
exports.subscribeToTopic = async (req, res, next) => {
    try {
        const { token, topic } = req.body;

        if (!token || !topic) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: token, topic'
            });
        }

        const result = await fcmService.subscribeToTopic(token, topic);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Unsubscribe device from topic
 */
exports.unsubscribeFromTopic = async (req, res, next) => {
    try {
        const { token, topic } = req.body;

        if (!token || !topic) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: token, topic'
            });
        }

        const result = await fcmService.unsubscribeFromTopic(token, topic);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
