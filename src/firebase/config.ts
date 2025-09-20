// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDPhq7LE3IiQTYVxlKBgxS4lJQLUSl-kM",
  authDomain: "sprout-2b8b6.firebaseapp.com",
  projectId: "sprout-2b8b6",
  storageBucket: "sprout-2b8b6.firebasestorage.app",
  messagingSenderId: "56991574661",
  appId: "1:56991574661:web:dc322e37fa7e2c9e6957ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;