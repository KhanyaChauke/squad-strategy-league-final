import { MockDatabase } from './mockDatabase';

// Mock LocalStorage
const store: Record<string, string> = {};
const localStorageMock = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key in store) delete store[key]; }
};

// Assign to global
global.localStorage = localStorageMock as any;

async function testMockDatabase() {
    console.log("Testing MockDatabase...");
    const db = new MockDatabase();

    // Test SignUp
    console.log("Testing SignUp...");
    const { user: newUser, error: signUpError } = await db.signUp("Test User", "test@example.com", "password123");
    if (signUpError) {
        console.error("SignUp Failed:", signUpError);
    } else {
        console.log("SignUp Success:", newUser?.email);
    }

    // Test SignIn
    console.log("Testing SignIn...");
    const { user: signedInUser, error: signInError } = await db.signIn("test@example.com", "password123");
    if (signInError) {
        console.error("SignIn Failed:", signInError);
    } else {
        console.log("SignIn Success:", signedInUser?.email);
    }

    // Test SignIn with wrong password
    console.log("Testing SignIn (Wrong Password)...");
    const { error: wrongPwError } = await db.signIn("test@example.com", "wrongpassword");
    if (wrongPwError) {
        console.log("SignIn (Wrong Password) Correctly Failed:", wrongPwError);
    } else {
        console.error("SignIn (Wrong Password) Unexpectedly Succeeded");
    }

    // Test Update User (Persistence)
    console.log("Testing Data Persistence...");
    if (signedInUser) {
        signedInUser.budget = 500;
        await db.updateUser(signedInUser);

        const currentUser = await db.getCurrentUser();
        if (currentUser?.budget === 500) {
            console.log("Persistence Success: Budget updated.");
        } else {
            console.error("Persistence Failed: Budget not updated.");
        }
    }
}

testMockDatabase();
