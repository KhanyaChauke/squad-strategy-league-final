
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/integrations/firebase/client';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { mockDb } from '@/services/mockDatabase';
import { GameweekResult, simulateGameweek } from '@/services/gameweekService';

// Toggle this to switch between Firebase and Local Mock DB
const USE_MOCK_DB = false;

export interface User {
  id: string;
  fullName: string;
  email: string;
  budget: number;
  squad: Player[];
  bench: Player[];
  teamName?: string;
  emailVerified: boolean;
  isAdmin?: boolean;
  selectedFormation?: {
    id: string;
    name: string;
    positions: {
      GK: number;
      DEF: number;
      MID: number;
      ATT: number;
    };
  };
  totalPoints: number;
  history: GameweekResult[];
  transfersMade: number;
  freeTransfersAvailable: number;
  transferCost: number;
}

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  team: string;
  nationality: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  dribbling: number;
  physical: number;
  price: number;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addPlayerToSquad: (player: Player) => Promise<boolean>;
  removePlayerFromSquad: (playerId: string) => Promise<void>;
  addPlayerToBench: (player: Player) => Promise<boolean>;
  removePlayerFromBench: (playerId: string) => Promise<void>;
  substitutePlayer: (squadPlayerId: string, benchPlayerId: string) => Promise<boolean>;
  setFormation: (formation: { id: string; name: string; positions: { GK: number; DEF: number; MID: number; ATT: number } }) => Promise<void>;
  updateTeamName: (name: string) => Promise<boolean>;
  saveSquad: () => Promise<boolean>;
  simulateGameweekForUser: () => Promise<GameweekResult | null>;
  simulateGameweekForAllUsers: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin email constant
const ADMIN_EMAIL = 'khc.chauke@gmail.com';

// Helper to check if email is admin
const isAdminEmail = (email: string): boolean => {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const initAuth = async () => {
      console.log("[AuthContext] Initializing auth...");
      if (USE_MOCK_DB) {
        console.log("[AuthContext] Using Mock DB");
        const currentUser = await mockDb.getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
      } else {
        // Firebase Auth Listener
        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
          console.log("[AuthContext] Auth state changed:", authUser ? `User ${authUser.uid}` : "No user");

          // Clean up previous snapshot listener if it exists
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
          }

          if (authUser) {
            // User is signed in, listen to their Firestore profile
            const userDocRef = doc(db, 'users', authUser.uid);
            console.log("[AuthContext] Listening to user profile:", authUser.uid);

            unsubscribeSnapshot = onSnapshot(userDocRef,
              async (docSnapshot) => {
                console.log("[AuthContext] Profile snapshot update. Exists:", docSnapshot.exists());
                if (docSnapshot.exists()) {
                  const userData = docSnapshot.data() as User;
                  // Handle potential string/number mismatch from Firestore
                  const rawBudget = userData.budget;
                  const safeBudget = typeof rawBudget === 'string' ? parseFloat(rawBudget) : (typeof rawBudget === 'number' ? rawBudget : 1000000000);

                  setUser({
                    totalPoints: 0,
                    history: [],
                    transfersMade: 0,
                    freeTransfersAvailable: 1,
                    transferCost: 0,
                    squad: [],
                    bench: [],
                    ...userData,
                    budget: isNaN(safeBudget) ? 1000000000 : safeBudget,
                    id: authUser.uid,
                    email: authUser.email || '',
                    isAdmin: isAdminEmail(authUser.email || '')
                  });
                  setIsLoading(false);
                } else {
                  console.log('[AuthContext] User document not found. Attempting self-healing...');

                  // Self-Healing: Create the missing profile
                  const newUser: User = {
                    id: authUser.uid,
                    fullName: authUser.displayName || 'New Manager',
                    email: authUser.email || '',
                    budget: 1000000000,
                    squad: [],
                    bench: [],
                    emailVerified: authUser.emailVerified,
                    teamName: '',
                    totalPoints: 0,
                    history: [],
                    transfersMade: 0,
                    freeTransfersAvailable: 1,
                    transferCost: 0,
                    isAdmin: isAdminEmail(authUser.email || '')
                  };

                  try {
                    await setDoc(userDocRef, newUser);
                    console.log('[AuthContext] Self-healing successful: User profile created.');
                    // The snapshot listener will fire again automatically with the new data
                  } catch (error: any) {
                    console.error('[AuthContext] Self-healing failed:', error);
                    setError(error.message || 'Self-healing failed');
                    // If self-healing fails, then we sign out
                    await signOut(auth);
                    setUser(null);
                    setIsLoading(false);
                  }
                }
              },
              (err) => {
                console.error('[AuthContext] Error listening to user profile:', err);
                setError(err.message || 'Error listening to user profile');
                setIsLoading(false);
              }
            );
          } else {
            // User is signed out
            console.log("[AuthContext] User signed out, clearing state");
            setUser(null);
            setIsLoading(false);
          }
        });

        return () => {
          unsubscribeAuth();
          if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
          }
        };
      }
    };

    // The return value of initAuth is the cleanup function for the effect
    const cleanupPromise = initAuth();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("[AuthContext] Attempting login for:", email);

    try {
      if (USE_MOCK_DB) {
        const { user, error } = await mockDb.signIn(email, password);
        if (error || !user) {
          setIsLoading(false);
          return false;
        }
        setUser(user);
        setIsLoading(false);
        return true;
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("[AuthContext] Login successful");
        // onAuthStateChanged will handle the rest
        return true;
      }
    } catch (error: any) {
      console.error("[AuthContext] Login error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (USE_MOCK_DB) {
        const { user, error } = await mockDb.signUp(fullName, email, password);
        if (error || !user) {
          setIsLoading(false);
          throw new Error(error || 'Registration failed');
        }
        setUser(user);
        setIsLoading(false);
        return true;
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;

        // Create user document in Firestore
        const newUser: User = {
          id: authUser.uid,
          fullName: fullName,
          email: email,
          budget: 1000000000,
          squad: [],
          bench: [],
          emailVerified: authUser.emailVerified,
          teamName: '',
          totalPoints: 0,
          history: [],
          transfersMade: 0,
          freeTransfersAvailable: 1,
          transferCost: 0,
          isAdmin: isAdminEmail(email)
        };

        await setDoc(doc(db, 'users', authUser.uid), newUser);

        // No need to setUser here, onAuthStateChanged will pick it up
        return true;
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    if (USE_MOCK_DB) {
      await mockDb.signOut();
    } else {
      await signOut(auth);
    }
    setUser(null);
  };

  // Helper to sync state with DB
  const syncUser = async (updatedUser: User) => {
    setUser(updatedUser);
    if (USE_MOCK_DB) {
      mockDb.updateUser(updatedUser);
    } else {
      if (!user) {
        console.warn("[AuthContext] syncUser called but no user is currently logged in.");
        return;
      }
      try {
        console.log(`[AuthContext] PERSISTENCE START: User ${user.id}`);
        console.log(`[AuthContext] SAVING: Squad(${updatedUser.squad.length}), Bench(${updatedUser.bench.length}), Points(${updatedUser.totalPoints})`);

        const userDocRef = doc(db, 'users', user.id);

        // Clean up any potential undefined values just in case
        const dataToSave = JSON.parse(JSON.stringify(updatedUser));

        await setDoc(userDocRef, dataToSave);
        console.log("[AuthContext] PERSISTENCE SUCCESS: Data written to Firestore.");
      } catch (error) {
        console.error("Error syncing user to Firestore:", error);
        throw error; // Re-throw to allow callers to handle it
      }
    }
  };

  const addPlayerToSquad = async (player: Player): Promise<boolean> => {
    if (!user) return false;

    if (user.selectedFormation) {
      const currentPositionCount = user.squad.filter(p => p.position === player.position).length;
      const maxForPosition = user.selectedFormation.positions[player.position as keyof typeof user.selectedFormation.positions];

      if (currentPositionCount >= maxForPosition) {
        return false;
      }
    } else {
      if (user.squad.length >= 15) {
        return false;
      }
    }

    const budgetNum = Number(user.budget);
    const priceNum = Number(player.price);

    if (budgetNum < priceNum) {
      console.warn(`[AuthContext] Insufficient Funds. Budget: ${budgetNum} (Original: ${user.budget}), Price: ${priceNum} (Original: ${player.price})`);
      return false;
    }

    if (user.squad.some(p => p.id === player.id)) {
      console.warn(`[AuthContext] Player already in squad: ${player.id}`);
      return false;
    }

    const updatedUser = {
      ...user,
      budget: user.budget - player.price,
      squad: [...user.squad, player]
    };

    await syncUser(updatedUser);
    return true;
  };

  const removePlayerFromSquad = async (playerId: string) => {
    if (!user) return;

    const playerToRemove = user.squad.find(p => p.id === playerId);
    if (!playerToRemove) return;

    // Track transfer if squad was full (already playing)
    const isTransferred = user.squad.length + user.bench.length === 15;

    const updatedUser = {
      ...user,
      budget: user.budget + playerToRemove.price,
      squad: user.squad.filter(p => p.id !== playerId),
      transfersMade: isTransferred ? (user.transfersMade || 0) + 1 : (user.transfersMade || 0)
    };

    // Calculate hit if transfers exceed free ones
    if (isTransferred && updatedUser.transfersMade > updatedUser.freeTransfersAvailable) {
      updatedUser.transferCost = (updatedUser.transferCost || 0) + 4;
    }

    await syncUser(updatedUser);
  };

  const addPlayerToBench = async (player: Player): Promise<boolean> => {
    if (!user) return false;

    if (user.bench.length >= 4) {
      return false;
    }

    if (user.budget < player.price) {
      return false;
    }

    if (user.squad.some(p => p.id === player.id) || user.bench.some(p => p.id === player.id)) {
      return false;
    }

    const updatedUser = {
      ...user,
      budget: user.budget - player.price,
      bench: [...user.bench, player]
    };

    await syncUser(updatedUser);
    return true;
  };

  const removePlayerFromBench = async (playerId: string) => {
    if (!user) return;

    const playerToRemove = user.bench.find(p => p.id === playerId);
    if (!playerToRemove) return;

    const updatedUser = {
      ...user,
      budget: user.budget + playerToRemove.price,
      bench: user.bench.filter(p => p.id !== playerId)
    };

    await syncUser(updatedUser);
  };

  const substitutePlayer = async (squadPlayerId: string, benchPlayerId: string): Promise<boolean> => {
    if (!user) return false;

    const squadPlayer = user.squad.find(p => p.id === squadPlayerId);
    const benchPlayer = user.bench.find(p => p.id === benchPlayerId);

    if (!squadPlayer || !benchPlayer) return false;

    if (squadPlayer.position !== benchPlayer.position) {
      return false;
    }

    const updatedUser = {
      ...user,
      squad: user.squad.map(p => p.id === squadPlayerId ? benchPlayer : p),
      bench: user.bench.map(p => p.id === benchPlayerId ? squadPlayer : p)
    };

    await syncUser(updatedUser);
    return true;
  };

  const setFormation = async (formation: { id: string; name: string; positions: { GK: number; DEF: number; MID: number; ATT: number } }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      selectedFormation: formation
    };

    await syncUser(updatedUser);
  };

  const updateTeamName = async (name: string): Promise<boolean> => {
    if (!user) return false;

    // Constraint removed to allow team name updates
    /* if (user.teamName && user.teamName.trim() !== '') {
      console.warn('Team name already set. Cannot change until next season.');
      return false;
    } */

    try {
      const updatedUser = {
        ...user,
        teamName: name
      };

      await syncUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Error updating team name:', error);
      return false;
    }
  };

  const saveSquad = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      console.log(`[AuthContext] Manual save requested for user ${user.id}`);
      console.log(`[AuthContext] Data being saved - Squad: ${user.squad.length}, Bench: ${user.bench.length}, Budget: ${user.budget}`);
      await syncUser(user);
      return true;
    } catch (error) {
      console.error('Error manually saving squad:', error);
      return false;
    }
  };

  const simulateGameweekForUser = async (): Promise<GameweekResult | null> => {
    if (!user) return null;

    try {
      // Determine next GW number (current history length + 1)
      const nextGw = (user.history?.length || 0) + 1;

      // Run simulation
      const result = simulateGameweek(user.squad, user.bench, nextGw);

      // Update User
      const updatedUser: User = {
        ...user,
        totalPoints: (user.totalPoints || 0) + result.totalPoints - (user.transferCost || 0),
        history: [...(user.history || []), result],
        transfersMade: 0, // Reset transfers for next week
        transferCost: 0, // Reset hits
        freeTransfersAvailable: Math.min(2, (user.freeTransfersAvailable || 1) + 1) // Roll over free transfer (max 2)
      };

      await syncUser(updatedUser);
      return result;

    } catch (e) {
      console.error("Simulation failed:", e);
      return null;
    }
  };

  // Admin-only function to simulate gameweek for ALL users
  const simulateGameweekForAllUsers = async (): Promise<boolean> => {
    if (!user?.isAdmin) {
      console.error('Unauthorized: Only admins can simulate gameweek for all users');
      return false;
    }

    try {
      console.log('[Admin] Starting gameweek simulation for all users...');

      // Import collection and getDocs from firebase
      const { collection, getDocs } = await import('firebase/firestore');

      // Get all users from Firestore
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      let successCount = 0;
      let failCount = 0;

      // Process each user
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userData = userDoc.data() as User;

          // Skip if user doesn't have a squad
          if (!userData.squad || userData.squad.length === 0) {
            console.log(`[Admin] Skipping user ${userData.fullName} - no squad`);
            continue;
          }

          // Determine next GW number
          const nextGw = (userData.history?.length || 0) + 1;

          // Run simulation
          const result = simulateGameweek(userData.squad, userData.bench || [], nextGw);

          // Update user data
          const updatedUserData: User = {
            ...userData,
            totalPoints: (userData.totalPoints || 0) + result.totalPoints - (userData.transferCost || 0),
            history: [...(userData.history || []), result],
            transfersMade: 0,
            transferCost: 0,
            freeTransfersAvailable: Math.min(2, (userData.freeTransfersAvailable || 1) + 1)
          };

          // Save to Firestore
          const userDocRef = doc(db, 'users', userDoc.id);
          await setDoc(userDocRef, updatedUserData);

          successCount++;
          console.log(`[Admin] Simulated GW${nextGw} for ${userData.fullName}: ${result.totalPoints} points`);

        } catch (error) {
          failCount++;
          console.error(`[Admin] Failed to simulate for user ${userDoc.id}:`, error);
        }
      }

      console.log(`[Admin] Simulation complete: ${successCount} successful, ${failCount} failed`);
      return true;

    } catch (error) {
      console.error('[Admin] Failed to simulate gameweek for all users:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        addPlayerToSquad,
        removePlayerFromSquad,
        addPlayerToBench,
        removePlayerFromBench,
        substitutePlayer,
        setFormation,
        updateTeamName,
        saveSquad,
        simulateGameweekForUser,
        simulateGameweekForAllUsers,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
