import firebase from 'firebase/compat/app';
import { auth, db } from '../firebaseConfig';

// Authentication
export const registerUser = async (email, password, displayName) => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName });

    await db.collection('users').doc(userCredential.user.uid).set({
        displayName,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return userCredential.user;
};

export const loginUser = async (email, password) => {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
};

export const logoutUser = async () => {
    await auth.signOut();
};

export const updateProfile = async (userId, data) => {
    await db.collection('users').doc(userId).update(data);
};

// Firestore CRUD
export const createDocument = async (collectionName, data) => {
    const docRef = await db.collection(collectionName).add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
};

export const getDocument = async (collectionName, docId) => {
    const docSnap = await db.collection(collectionName).doc(docId).get();
    return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getAllDocuments = async (collectionName) => {
    const querySnapshot = await db.collection(collectionName).get();
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateDocument = async (collectionName, docId, data) => {
    await db.collection(collectionName).doc(docId).update(data);
};

export const deleteDocument = async (collectionName, docId) => {
    await db.collection(collectionName).doc(docId).delete();
};

// Bookmarks
export const getUserBookmarks = async (userId) => {
    const querySnapshot = await db.collection('bookmarks')
        .where('userId', '==', userId)
        .get();
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addBookmark = async (userId, itemId, itemType) => {
    await db.collection('bookmarks').doc(`${userId}_${itemId}`).set({
        userId,
        itemId,
        itemType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

export const removeBookmark = async (userId, itemId) => {
    await db.collection('bookmarks').doc(`${userId}_${itemId}`).delete();
};

// Analytics
export const trackPageView = (pageName) => {
    console.log('Page view:', pageName);
};

export const trackEvent = (eventName, params = {}) => {
    console.log('Event:', eventName, params);
};

// Feedback
export const submitFeedback = async (feedbackData) => {
    await createDocument('feedback', feedbackData);
};
