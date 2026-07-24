import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

let app: any = null;
let auth: any = null;
let db: any = null;
let isConfigured = false;

// Safely load firebase config if present using Vite's eager glob import
const configModules: Record<string, any> = (import.meta as any).glob('../../firebase-applet-config.json', { eager: true });
const configKey = Object.keys(configModules)[0];
const firebaseConfig = configKey ? (configModules[configKey]?.default || configModules[configKey]) : null;

if (firebaseConfig && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Pass the firestoreDatabaseId from config if provided
    db = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    isConfigured = true;
    console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
} else {
  console.warn("Firebase config not found. Operating in local storage mode.");
}

// Test connection on boot if configured
if (db) {
  getDocFromServer(doc(db, 'test', 'connection'))
    .catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    });
}

export { auth, db, isConfigured };
export default app;

