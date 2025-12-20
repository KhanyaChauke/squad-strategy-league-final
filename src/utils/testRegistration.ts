
import { auth, db } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

async function testRegistration() {
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Attempting to register user: ${email}`);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Auth successful. User ID:", userCredential.user.uid);

        try {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                fullName: "Test User",
                email: email,
                test: true
            });
            console.log("Firestore write successful.");
        } catch (firestoreError: any) {
            console.error("Firestore write failed:", firestoreError.code, firestoreError.message);
        }

    } catch (authError: any) {
        console.error("Auth failed:", authError.code, authError.message);
    }
}

testRegistration();
