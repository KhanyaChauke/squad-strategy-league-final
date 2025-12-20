
import { auth, db } from '@/integrations/firebase/client';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

async function testPlayerWrite() {
    const email = `test_player_write_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`1. Creating test user: ${email}`);

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("   User created and signed in.");

        console.log("2. Attempting to write to 'players' collection...");
        try {
            const docRef = await addDoc(collection(db, "players"), {
                name: "Test Player",
                position: "MID",
                rating: 75,
                test: true
            });
            console.log("   SUCCESS! Document written with ID: ", docRef.id);
        } catch (e: any) {
            console.error("   FAILURE: Write to 'players' failed.");
            console.error("   Error Code:", e.code);
            console.error("   Error Message:", e.message);
        }

    } catch (e: any) {
        console.error("   Auth failed:", e.message);
    }
}

testPlayerWrite();
