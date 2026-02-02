
import { db } from '@/integrations/firebase/client';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    query,
    where,
    getDocs,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';

export interface League {
    id: string;
    name: string;
    code: string;
    creatorId: string;
    createdAt: any;
    members: string[]; // Array of user IDs
}

export interface LeagueSummary {
    id: string;
    name: string;
    memberCount: number;
    rank: number; // User's rank in this league
}

const LEAGUES_COLLECTION = 'leagues';

// Generate a random 6-character code
const generateLeagueCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const createLeague = async (name: string, creatorId: string): Promise<string> => {
    try {
        let code = generateLeagueCode();
        // Ensure uniqueness (simple check, could loop in production if high collision risk)
        const leaguesRef = collection(db, LEAGUES_COLLECTION);
        const codeQuery = query(leaguesRef, where('code', '==', code));
        const codeSnapshot = await getDocs(codeQuery);

        if (!codeSnapshot.empty) {
            code = generateLeagueCode(); // Try one more time
        }

        const newLeagueRef = doc(collection(db, LEAGUES_COLLECTION));
        const leagueData = {
            id: newLeagueRef.id,
            name,
            code,
            creatorId,
            createdAt: serverTimestamp(),
            members: [creatorId]
        };

        await setDoc(newLeagueRef, leagueData);
        return code;
    } catch (error) {
        console.error("Error creating league:", error);
        throw error;
    }
};

export const joinLeague = async (code: string, userId: string): Promise<string> => {
    try {
        const leaguesRef = collection(db, LEAGUES_COLLECTION);
        const q = query(leaguesRef, where('code', '==', code.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("League not found. Please check the code.");
        }

        const leagueDoc = querySnapshot.docs[0];
        const leagueData = leagueDoc.data() as League;

        if (leagueData.members.includes(userId)) {
            throw new Error("You are already a member of this league.");
        }

        await updateDoc(leagueDoc.ref, {
            members: arrayUnion(userId)
        });

        return leagueData.name;
    } catch (error) {
        console.error("Error joining league:", error);
        throw error;
    }
};

export const getUserLeagues = async (userId: string): Promise<League[]> => {
    try {
        const leaguesRef = collection(db, LEAGUES_COLLECTION);
        // Firestore array-contains query is efficiently indexed
        const q = query(leaguesRef, where('members', 'array-contains', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as League));
    } catch (error) {
        console.error("Error fetching user leagues:", error);
        return [];
    }
};

export const getLeagueDetails = async (leagueId: string): Promise<League | null> => {
    try {
        const leagueRef = doc(db, LEAGUES_COLLECTION, leagueId);
        const leagueSnap = await getDoc(leagueRef);

        if (leagueSnap.exists()) {
            return { id: leagueSnap.id, ...leagueSnap.data() } as League;
        }
        return null;
    } catch (error) {
        console.error("Error fetching league details:", error);
        return null;
    }
};

export const leaveLeague = async (leagueId: string, userId: string): Promise<void> => {
    try {
        const leagueRef = doc(db, LEAGUES_COLLECTION, leagueId);
        await updateDoc(leagueRef, {
            members: arrayRemove(userId)
        });
    } catch (error) {
        console.error("Error leaving league:", error);
        throw error;
    }
};
