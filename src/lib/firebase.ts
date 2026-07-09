import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "essential-trail-s07pf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "essential-trail-s07pf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "essential-trail-s07pf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "44904655973",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:44904655973:web:4b1bbc3aefb1d943196a8c"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Customize Google provider (optional, e.g. prompt for account selection)
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export { signInWithPopup, firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword };
