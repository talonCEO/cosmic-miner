import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
// Replace these placeholder values with your actual Firebase project configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCCkSGmRG61sFiNaYaNy4Wcls7EYPfqZZY",
  authDomain: "cosmic-miner.firebaseapp.com",
  projectId: "cosmic-miner",
  storageBucket: "cosmic-miner.firebasestorage.app",
  messagingSenderId: "541782087850",
  appId: "1:541782087850:web:30107e6e600d31488058d3",
  measurementId: "G-4CGEFHDVKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// IMPORTANT: Replace the values above with your actual Firebase project details.
// These can be found in your Firebase project settings in the Firebase console.


