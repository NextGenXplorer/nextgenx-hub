const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Send to single device
router.post('/send', notificationController.sendToDevice);

// Send to multiple devices
router.post('/send-multiple', notificationController.sendToMultiple);

// Send to topic
router.post('/send-topic', notificationController.sendToTopic);

// Send to all registered devices
router.post('/send-all', notificationController.sendToAll);

// Send to specific user
router.post('/send-user', notificationController.sendToUser);

// Subscribe to topic
router.post('/subscribe', notificationController.subscribeToTopic);

// Unsubscribe from topic
router.post('/unsubscribe', notificationController.unsubscribeFromTopic);

module.exports = router;
