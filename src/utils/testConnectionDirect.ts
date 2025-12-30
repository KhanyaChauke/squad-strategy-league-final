
import { auth, db } from '../integrations/firebase/client';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

async function testPlayerWrite() {
    const email = `test_direct_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`1. Creating test user: ${email}`);

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("   User created and signed in.");

        console.log("2. Attempting to write to 'players' collection...");
        try {
            const docRef = await addDoc(collection(db, "players"), {
                name: "Direct Connection Test Player",
                position: "MID",
                rating: 75,
                test: true,
                timestamp: new Date().toISOString()
            });
            console.log("   SUCCESS! Document written with ID: ", docRef.id);
            process.exit(0);
        } catch (e: any) {
            console.error("   FAILURE: Write to 'players' failed.");
            console.error("   Error Code:", e.code);
            console.error("   Error Message:", e.message);
            process.exit(1);
        }

    } catch (e: any) {
        console.error("   Auth failed:", e.message);
        process.exit(1);
    }
}

testPlayerWrite();
