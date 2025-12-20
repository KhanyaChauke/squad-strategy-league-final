
import { auth, db } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

async function debugRegistration() {
    const timestamp = Date.now();
    const email = `debug_reg_${timestamp}@example.com`;
    const password = 'password123';
    const fullName = "Debug User";

    console.log(`\n=== STARTING REGISTRATION DEBUG ===`);
    console.log(`Email: ${email}`);

    try {
        // Simulate AuthContext.register
        console.log("\n[Step 1] Creating Auth User...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;
        console.log(`✅ Auth User Created: ${authUser.uid}`);

        // Simulate onAuthStateChanged firing immediately (it happens async in app)
        console.log("\n[Step 2] Simulating onAuthStateChanged / Snapshot Listener...");
        const userDocRef = doc(db, 'users', authUser.uid);

        // Check if doc exists immediately (race condition check)
        const immediateSnap = await getDoc(userDocRef);
        console.log(`   Immediate Doc Check: Exists = ${immediateSnap.exists()}`);

        console.log("\n[Step 3] Creating Firestore Profile (as per register function)...");
        const newUser = {
            id: authUser.uid,
            fullName: fullName,
            email: email,
            budget: 1000000000,
            squad: [],
            bench: [],
            emailVerified: authUser.emailVerified,
            teamName: ''
        };

        await setDoc(userDocRef, newUser);
        console.log("✅ Firestore Profile Created via setDoc");

        // Check again
        const finalSnap = await getDoc(userDocRef);
        console.log(`   Final Doc Check: Exists = ${finalSnap.exists()}`);

        if (finalSnap.exists()) {
            console.log("   Data:", finalSnap.data());
        }

        console.log("\n=== REGISTRATION DEBUG COMPLETE: SUCCESS ===");

    } catch (error: any) {
        console.error("\n❌ REGISTRATION DEBUG FAILED:", error);
        if (error.code) console.error("Error Code:", error.code);
        if (error.message) console.error("Error Message:", error.message);
    }
}

debugRegistration();
