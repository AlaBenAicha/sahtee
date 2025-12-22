/**
 * Firebase Configuration
 * 
 * This file initializes Firebase services for the SAHTEE application.
 * Configuration values are loaded from environment variables.
 * 
 * Required environment variables (in .env.local):
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, FirebaseStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration in development
if (import.meta.env.DEV) {
    const requiredVars = [
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
    ];

    const missingVars = requiredVars.filter(
        (varName) => !import.meta.env[varName]
    );

    if (missingVars.length > 0) {
        console.warn(
            `⚠️ Missing Firebase environment variables: ${missingVars.join(", ")}\n` +
            "Please create a .env.local file with your Firebase configuration.\n" +
            "See .env.example for reference."
        );
    }
}

// Initialize Firebase App (singleton pattern)
let app: FirebaseApp;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Connect to emulators in development if enabled
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";

if (useEmulator && import.meta.env.DEV) {
    console.log("🔧 Connecting to Firebase Emulators...");

    try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        connectFirestoreEmulator(db, "localhost", 8080);
        connectStorageEmulator(storage, "localhost", 9199);
        console.log("✅ Firebase Emulators connected successfully");
    } catch (error) {
        console.error("❌ Failed to connect to Firebase Emulators:", error);
    }
}

export { app };
export default app;

