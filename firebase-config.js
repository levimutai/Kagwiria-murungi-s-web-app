// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDawSbMQJHXnSvv6nuorAJ9uD9QJ9tn2Ps",
  authDomain: "kagwiria-website.firebaseapp.com",
  projectId: "kagwiria-website",
  storageBucket: "kagwiria-website.firebasestorage.app",
  messagingSenderId: "152073589515",
  appId: "1:152073589515:web:7c895798d9469a2927c80e",
  measurementId: "G-HTXQ59VEMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export { analytics };
export default app;