
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

async function runTest() {
    const email = `test_standalone_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`1. [Standalone] Creating user: ${email}`);

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("   [Standalone] Auth Success!");

        console.log("2. [Standalone] Writing to Firestore 'players'...");
        try {
            const docRef = await addDoc(collection(db, "players"), {
                name: "Standalone Test",
                timestamp: new Date().toISOString()
            });
            console.log("   [Standalone] Firestore Write SUCCESS! ID:", docRef.id);
            process.exit(0);
        } catch (dbError: any) {
            console.error("   [Standalone] Firestore Write FAIL:", dbError.code, dbError.message);
            process.exit(1);
        }

    } catch (authError: any) {
        console.error("   [Standalone] Auth FAIL:", authError.code, authError.message);
        process.exit(1);
    }
}

runTest();
