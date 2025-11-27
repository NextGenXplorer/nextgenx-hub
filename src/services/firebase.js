import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Authentication
export const registerUser = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(userCredential.user, { displayName });

    await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        createdAt: serverTimestamp(),
    });

    return userCredential.user;
};

export const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logoutUser = async () => {
    await signOut(auth);
};

export const updateProfile = async (userId, data) => {
    await updateDoc(doc(db, 'users', userId), data);
};

// Firestore CRUD
export const createDocument = async (collectionName, data) => {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, { ...data, createdAt: serverTimestamp() });
    return docRef.id;
};

export const getDocument = async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getAllDocuments = async (collectionName) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateDocument = async (collectionName, docId, data) => {
    await updateDoc(doc(db, collectionName, docId), data);
};

export const deleteDocument = async (collectionName, docId) => {
    await deleteDoc(doc(db, collectionName, docId));
};

// Bookmarks
export const getUserBookmarks = async (userId) => {
    const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addBookmark = async (userId, itemId, itemType) => {
    await setDoc(doc(db, 'bookmarks', `${userId}_${itemId}`), {
        userId,
        itemId,
        itemType,
        createdAt: serverTimestamp(),
    });
};

export const removeBookmark = async (userId, itemId) => {
    await deleteDoc(doc(db, 'bookmarks', `${userId}_${itemId}`));
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
