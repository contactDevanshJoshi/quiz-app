// shared/firebase/config.js
// Replace with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSce9nUlWlzIufXbobbeBUXZAMSUyl--g",
  authDomain: "ljiet-9faf0.firebaseapp.com",
  projectId: "ljiet-9faf0",
  storageBucket: "ljiet-9faf0.firebasestorage.app",
  messagingSenderId: "242389267352",
  appId: "1:242389267352:web:24c926d5da41bd752071ed",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
