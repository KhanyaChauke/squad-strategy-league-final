
import { auth, db } from '@/integrations/firebase/client';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function testAuthFlow() {
    const timestamp = Date.now();
    const email = `test_auth_${timestamp}@example.com`;
    const password = 'password123';

    console.log("=== STARTING AUTH FLOW TEST ===");
    console.log(`Target Email: ${email}`);

    try {
        // 1. REGISTER
        console.log("\n1. Testing Registration...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("   ✅ Auth User Created. UID:", user.uid);

        // 2. CREATE PROFILE (Simulating what AuthContext does)
        console.log("\n2. Testing Profile Creation...");
        try {
            await setDoc(doc(db, 'users', user.uid), {
                fullName: "Test User",
                email: email,
                budget: 1000000000,
                squad: [],
                bench: [],
                createdAt: new Date().toISOString()
            });
            console.log("   ✅ Firestore Profile Created.");
        } catch (e: any) {
            console.error("   ❌ Firestore Profile Creation FAILED:", e.code, e.message);
            throw e;
        }

        // 3. VERIFY PROFILE READ
        console.log("\n3. Testing Profile Read...");
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
            console.log("   ✅ Profile Read Successful.");
        } else {
            console.error("   ❌ Profile NOT FOUND.");
            throw new Error("Profile not found");
        }

        // 4. LOGOUT
        console.log("\n4. Testing Logout...");
        await signOut(auth);
        console.log("   ✅ Signed Out.");

        // 5. LOGIN
        console.log("\n5. Testing Login...");
        const loginCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("   ✅ Login Successful. UID:", loginCredential.user.uid);

        // CLEANUP (Optional - keep user for manual verification if needed, or delete)
        // await deleteUser(loginCredential.user);
        // console.log("\n6. Cleanup: User deleted.");

        console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");

    } catch (error: any) {
        console.error("\n❌ TEST FAILED:", error.code || error.message);
    }
}

testAuthFlow();
