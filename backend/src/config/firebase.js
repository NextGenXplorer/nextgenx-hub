const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
    try {
        // Check if using service account file or environment variables
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Using service account JSON file
            firebaseApp = admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        } else {
            // Using environment variables
            const serviceAccount = {
                type: 'service_account',
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
            };

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        console.log('✅ Firebase Admin initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        throw error;
    }
};

const getFirebaseAdmin = () => {
    if (!firebaseApp) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return admin;
};

const getFirestore = () => {
    return getFirebaseAdmin().firestore();
};

const getMessaging = () => {
    return getFirebaseAdmin().messaging();
};

module.exports = {
    initializeFirebase,
    getFirebaseAdmin,
    getFirestore,
    getMessaging
};
