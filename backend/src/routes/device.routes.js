const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

// Register device token
router.post('/register', deviceController.registerToken);

// Unregister device token
router.post('/unregister', deviceController.unregisterToken);

// Get all registered devices (admin)
router.get('/', deviceController.getAllDevices);

// Get device count
router.get('/count', deviceController.getDeviceCount);

// Deactivate user devices (on logout)
router.post('/deactivate', deviceController.deactivateUserDevices);

module.exports = router;
