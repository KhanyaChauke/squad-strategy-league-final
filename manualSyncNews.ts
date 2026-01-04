
import { syncNewsWithAPI, NewsArticle } from './src/services/newsService';
import { db } from './src/integrations/firebase/client';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const API_KEY = process.env.VITE_RAPID_API_KEY || "1a5d324f62mshf82070b791b2f3ap10994fjsnd9dc8ed92749";

const runManualSync = async () => {
    console.log("=== STARTING MANUAL NEWS SYNC ===");
    console.log("Use this script to populate the Firebase DB from external APIs.");
    console.log("Clients will READ from this DB, but will NOT trigger updates themselves.");
    console.log("----------------------------------------------------------------");

    try {
        console.log("Persisting to Firestore...");
        await syncNewsWithAPI(API_KEY);
        console.log("Sync function completed.");

        // Verification step
        console.log("Verifying data in Firestore...");
        const newsRef = collection(db, 'news');
        const q = query(newsRef, orderBy('publishedAt', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("❌ Warning: Database appears empty after sync!");
        } else {
            console.log(`✅ Success! Found ${querySnapshot.size} recent articles in DB:`);
            querySnapshot.forEach(doc => {
                const data = doc.data() as NewsArticle;
                console.log(` - [${data.tag}] ${data.title} (${data.source})`);
            });
        }

    } catch (error) {
        console.error("❌ Fatal Error during manual sync:", error);
    }
    console.log("=== MANUAL SYNC FINISHED ===");
};

runManualSync();
