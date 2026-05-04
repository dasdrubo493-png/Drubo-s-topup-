import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBb9R3YoclnBgCO_aXlHwlm6AWPVcxwQc",
  authDomain: "drubo-s-topup.firebaseapp.com",
  projectId: "drubo-s-topup",
  storageBucket: "drubo-s-topup.firebasestorage.app",
  messagingSenderId: "22160396800",
  appId: "1:22160396800:web:066aaebe87dc9d596b7ee5",
  measurementId: "G-LX9FLME64P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
