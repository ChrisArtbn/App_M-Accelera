import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// CONFIG DARI FIREBASE LU
const firebaseConfig = {
  apiKey: "AIzaSyD1PLr...",
  authDomain: "app-m-accelera.firebaseapp.com",
  projectId: "app-m-accelera",
  storageBucket: "app-m-accelera.appspot.com",
  messagingSenderId: "199011077210",
  appId: "1:199011077210:web:dc...",
};

// INIT
const app = initializeApp(firebaseConfig);

// EXPORT
export const db = getFirestore(app);
export const storage = getStorage(app);