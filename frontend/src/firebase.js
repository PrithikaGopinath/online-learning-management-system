// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TEMP: Check if .env is loading
console.log("Loaded key:", import.meta.env.VITE_FIREBASE_API_KEY);

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "olms-auth.firebaseapp.com",
  projectId: "olms-auth",
  storageBucket: "olms-auth.firebasestorage.app",
  messagingSenderId: "941708956957",
  appId: "1:941708956957:web:e76b1a8ced7696d6bc3df4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and export it
export const auth = getAuth(app);
