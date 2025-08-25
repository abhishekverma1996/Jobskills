import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtUxnCxRYbZ8br9knHt6VahggGN--AVJ0",
  authDomain: "jobmatch-9b0e2.firebaseapp.com",
  projectId: "jobmatch-9b0e2",
  storageBucket: "jobmatch-9b0e2.firebasestorage.app",
  messagingSenderId: "452595228264",
  appId: "1:452595228264:web:f502f066a591cd3c5965dd",
  measurementId: "G-6RH7QCTZMH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
