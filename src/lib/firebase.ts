import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let auth: any = null;
let db: any = null;
let isConfigured = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  // CRITICAL: Pass the firestoreDatabaseId from config
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  isConfigured = true;
  console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

// Test connection on boot
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
