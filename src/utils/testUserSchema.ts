
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDAQ7U_GQe-VhBkjbxmKyIDrNQerpZ1GjU",
    authDomain: "fpls-8740d.firebaseapp.com",
    projectId: "fpls-8740d",
    storageBucket: "fpls-8740d.firebasestorage.app",
    messagingSenderId: "624896398733",
    appId: "1:624896398733:web:29d9af5be7c1f61b4559c4",
    measurementId: "G-G0EYNNEL41"
};

async function testSchema() {
    console.log("Testing Firestore with NEW User Schema...");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const testUserId = "test-user-schema-" + Date.now();
    const testUserDoc = doc(db, 'users', testUserId);

    const mockUser = {
        id: testUserId,
        fullName: "Test Manager",
        email: "test@example.com",
        budget: 1000000000,
        squad: [],
        bench: [],
        totalPoints: 100,
        history: [{ gameweek: 1, totalPoints: 100, squadPoints: 100, benchPoints: 0, playerStats: {}, date: new Date().toISOString() }],
        transfersMade: 1,
        freeTransfersAvailable: 1,
        transferCost: 4,
        teamName: "Test FC"
    };

    try {
        console.log("1. Writing User with History & Points...");
        await setDoc(testUserDoc, mockUser);
        console.log("SUCCESS: User Write OK");

        console.log("2. Cleaning up...");
        await deleteDoc(testUserDoc);
        console.log("SUCCESS: Cleanup OK");

        console.log("\nDATABASE CONNECTION IS FULLY FUNCTIONAL WITH NEW SCHEMA.");
    } catch (error) {
        console.error("FAILURE:", error);
        process.exit(1);
    }
}

testSchema();
