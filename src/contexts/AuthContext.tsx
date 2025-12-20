
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
  addPlayerToSquad: (player: Player) => boolean;
  removePlayerFromSquad: (playerId: string) => void;
  addPlayerToBench: (player: Player) => boolean;
  removePlayerFromBench: (playerId: string) => void;
  substitutePlayer: (squadPlayerId: string, benchPlayerId: string) => boolean;
  setFormation: (formation: { id: string; name: string; positions: { GK: number; DEF: number; MID: number; ATT: number } }) => void;
  updateTeamName: (name: string) => Promise<boolean>;
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
                  // Ensure ID matches auth ID
                  setUser({ ...userData, id: authUser.uid, email: authUser.email || '' });
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
                    teamName: ''
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
          teamName: ''
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
      if (!user) return;
      try {
        console.log(`[AuthContext] Syncing user ${user.id} to Firestore... squad size: ${updatedUser.squad.length}`);
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, { ...updatedUser });
        console.log("[AuthContext] Sync successful.");
      } catch (error) {
        console.error("Error syncing user to Firestore:", error);
      }
    }
  };

  const addPlayerToSquad = (player: Player): boolean => {
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

    if (user.budget < player.price) {
      return false;
    }

    if (user.squad.some(p => p.id === player.id)) {
      return false;
    }

    const updatedUser = {
      ...user,
      budget: user.budget - player.price,
      squad: [...user.squad, player]
    };

    syncUser(updatedUser);
    return true;
  };

  const removePlayerFromSquad = (playerId: string) => {
    if (!user) return;

    const playerToRemove = user.squad.find(p => p.id === playerId);
    if (!playerToRemove) return;

    const updatedUser = {
      ...user,
      budget: user.budget + playerToRemove.price,
      squad: user.squad.filter(p => p.id !== playerId)
    };

    syncUser(updatedUser);
  };

  const addPlayerToBench = (player: Player): boolean => {
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

    syncUser(updatedUser);
    return true;
  };

  const removePlayerFromBench = (playerId: string) => {
    if (!user) return;

    const playerToRemove = user.bench.find(p => p.id === playerId);
    if (!playerToRemove) return;

    const updatedUser = {
      ...user,
      budget: user.budget + playerToRemove.price,
      bench: user.bench.filter(p => p.id !== playerId)
    };

    syncUser(updatedUser);
  };

  const substitutePlayer = (squadPlayerId: string, benchPlayerId: string): boolean => {
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

    syncUser(updatedUser);
    return true;
  };

  const setFormation = (formation: { id: string; name: string; positions: { GK: number; DEF: number; MID: number; ATT: number } }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      selectedFormation: formation
    };

    syncUser(updatedUser);
  };

  const updateTeamName = async (name: string): Promise<boolean> => {
    if (!user) return false;

    if (user.teamName && user.teamName.trim() !== '') {
      console.warn('Team name already set. Cannot change until next season.');
      return false;
    }

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
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
