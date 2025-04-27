// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD7DbzMEREJxvIDqMy9QbHI_4XF8BgyYhM",
  authDomain: "locatemyprof2.firebaseapp.com",
  projectId: "locatemyprof2",
  storageBucket: "locatemyprof2.firebasestorage.app",
  messagingSenderId: "574795947222",
  appId: "1:574795947222:web:1b5851daa42eb28993fd77",
  measurementId: "G-CX1DCHT16N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
