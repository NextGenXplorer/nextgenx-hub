require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const notificationRoutes = require('./routes/notification.routes');
const deviceRoutes = require('./routes/device.routes');
const legalRoutes = require('./routes/legal.routes');
const { initializeFirebase } = require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin
initializeFirebase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/legal', legalRoutes);

// Legal pages (direct URL access for web browsers)
app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/privacy-policy.html'));
});

app.get('/terms-of-service', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/terms-of-service.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 NextGenX Backend running on port ${PORT}`);
    console.log(`📱 FCM Push Notification Service ready`);
});
