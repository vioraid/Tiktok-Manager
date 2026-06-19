import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCmPsA93gEG65B5kaWJUJzgAxjpixXPOVU",
  authDomain: "tiktokmanagerv1.firebaseapp.com",
  projectId: "tiktokmanagerv1",
  storageBucket: "tiktokmanagerv1.firebasestorage.app",
  messagingSenderId: "213366375303",
  appId: "1:213366375303:web:c42e3af29cf3fe04624922",
  measurementId: "G-8LQ63T5BEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
