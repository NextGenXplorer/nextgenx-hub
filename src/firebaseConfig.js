// Firebase Configuration - NextGenX
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration with your project credentials
const firebaseConfig = {
    apiKey: "AIzaSyCcI5pp7C7acZMNZOBOHyV9izKkE8ueV9w",
    authDomain: "nextgenx-7a8a8.firebaseapp.com",
    projectId: "nextgenx-7a8a8",
    storageBucket: "nextgenx-7a8a8.firebasestorage.app",
    messagingSenderId: "785697064172",
    appId: "1:785697064172:android:acadbc3edaf712f42911c9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Analytics and Messaging are not supported in React Native web/Expo Go
// They will be initialized only when running on actual devices
export const analytics = null;
export const messaging = null;

export default app;
