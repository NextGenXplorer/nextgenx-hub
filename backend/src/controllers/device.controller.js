const deviceService = require('../services/device.service');

/**
 * Register device token
 */
exports.registerToken = async (req, res, next) => {
    try {
        const { token, userId, deviceInfo, tokenType } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: token'
            });
        }

        const result = await deviceService.registerToken(token, userId, deviceInfo, tokenType);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Unregister device token
 */
exports.unregisterToken = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: token'
            });
        }

        const result = await deviceService.unregisterToken(token);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all registered devices
 */
exports.getAllDevices = async (req, res, next) => {
    try {
        const devices = await deviceService.getAllTokens();
        res.json({
            success: true,
            count: devices.length,
            devices
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get device count
 */
exports.getDeviceCount = async (req, res, next) => {
    try {
        const count = await deviceService.getTokenCount();
        res.json({
            success: true,
            count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Deactivate user's devices (logout)
 */
exports.deactivateUserDevices = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userId'
            });
        }

        const result = await deviceService.deactivateUserTokens(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
