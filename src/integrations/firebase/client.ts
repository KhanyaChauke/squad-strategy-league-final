
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyDAQ7U_GQe-VhBkjbxmKyIDrNQerpZ1GjU",
    authDomain: "fpls-8740d.firebaseapp.com",
    projectId: "fpls-8740d",
    storageBucket: "fpls-8740d.firebasestorage.app",
    messagingSenderId: "624896398733",
    appId: "1:624896398733:web:29d9af5be7c1f61b4559c4",
    measurementId: "G-G0EYNNEL41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
