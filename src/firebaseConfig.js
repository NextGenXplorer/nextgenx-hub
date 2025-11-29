// Firebase Configuration - NextGenX
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (check if already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export auth and db
export const auth = firebase.auth();
export const db = firebase.firestore();

// Analytics and Messaging are not supported in React Native web/Expo Go
export const analytics = null;
export const messaging = null;

export default firebase;
