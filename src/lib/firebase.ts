import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbAnFEGLprOfckoMUf6r2DkvwhxoTDClQ",
  authDomain: "essential-trail-s07pf.firebaseapp.com",
  projectId: "essential-trail-s07pf",
  storageBucket: "essential-trail-s07pf.firebasestorage.app",
  messagingSenderId: "44904655973",
  appId: "1:44904655973:web:4b1bbc3aefb1d943196a8c"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-swasthyasarathi-533c1be2-46b4-47ce-9acb-c99f92d58488");
export const googleProvider = new GoogleAuthProvider();

// Customize Google provider (optional, e.g. prompt for account selection)
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export { signInWithPopup, firebaseSignOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword };
