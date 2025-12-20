
import { db } from '@/integrations/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

async function checkUserProfile() {
    console.log("Checking for user profiles in Firestore...");
    try {
        const querySnapshot = await getDocs(collection(db, "users"));

        if (querySnapshot.empty) {
            console.log("No user profiles found in Firestore.");
            return;
        }

        console.log(`Found ${querySnapshot.size} user profiles:`);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`- Email: ${data.email}, Name: ${data.fullName}, ID: ${doc.id}`);
        });
    } catch (error) {
        console.error("Error fetching user profiles:", error);
    }
}

checkUserProfile();
