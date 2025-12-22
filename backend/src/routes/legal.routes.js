const express = require('express');
const path = require('path');
const router = express.Router();
const legalController = require('../controllers/legal.controller');

// API endpoints (JSON)
router.get('/privacy-policy', legalController.getPrivacyPolicy);
router.get('/terms-of-service', legalController.getTermsOfService);

// Web pages (HTML)
router.get('/privacy-policy/web', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/privacy-policy.html'));
});

router.get('/terms-of-service/web', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/terms-of-service.html'));
});

module.exports = router;
