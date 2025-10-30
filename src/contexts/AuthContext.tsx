
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
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

interface Player {
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
  isLoading: boolean;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from profiles table
  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) throw error;

      const userData: User = {
        id: authUser.id,
        fullName: profile?.full_name || '',
        email: authUser.email || '',
        budget: profile?.budget || 1000000000,
        squad: [],
        bench: [],
        teamName: profile?.team_name,
        emailVerified: authUser.email_confirmed_at !== null
      };

      setUser(userData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user);
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return false;
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Email not verified
        await supabase.auth.signOut();
        setIsLoading(false);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        setIsLoading(false);
        throw error;
      }

      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const addPlayerToSquad = (player: Player): boolean => {
    if (!user) return false;
    
    // Check formation constraints if formation is selected
    if (user.selectedFormation) {
      const currentPositionCount = user.squad.filter(p => p.position === player.position).length;
      const maxForPosition = user.selectedFormation.positions[player.position as keyof typeof user.selectedFormation.positions];
      
      if (currentPositionCount >= maxForPosition) {
        return false; // Position full for this formation
      }
    } else {
      if (user.squad.length >= 15) {
        return false; // Squad full
      }
    }
    
    if (user.budget < player.price) {
      return false; // Insufficient budget
    }
    
    if (user.squad.some(p => p.id === player.id)) {
      return false; // Player already in squad
    }
    
    const updatedUser = {
      ...user,
      budget: user.budget - player.price,
      squad: [...user.squad, player]
    };
    
    setUser(updatedUser);
    // TODO: Sync with database
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
    
    setUser(updatedUser);
    // TODO: Sync with database
  };

  const addPlayerToBench = (player: Player): boolean => {
    if (!user) return false;
    
    if (user.bench.length >= 4) {
      return false; // Bench full
    }
    
    if (user.budget < player.price) {
      return false; // Insufficient budget
    }
    
    if (user.squad.some(p => p.id === player.id) || user.bench.some(p => p.id === player.id)) {
      return false; // Player already in squad or bench
    }
    
    const updatedUser = {
      ...user,
      budget: user.budget - player.price,
      bench: [...user.bench, player]
    };
    
    setUser(updatedUser);
    // TODO: Sync with database
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
    
    setUser(updatedUser);
    // TODO: Sync with database
  };

  const substitutePlayer = (squadPlayerId: string, benchPlayerId: string): boolean => {
    if (!user) return false;
    
    const squadPlayer = user.squad.find(p => p.id === squadPlayerId);
    const benchPlayer = user.bench.find(p => p.id === benchPlayerId);
    
    if (!squadPlayer || !benchPlayer) return false;
    
    // Check if positions match (optional rule)
    if (squadPlayer.position !== benchPlayer.position) {
      return false; // Can only substitute players in same position
    }
    
    const updatedUser = {
      ...user,
      squad: user.squad.map(p => p.id === squadPlayerId ? benchPlayer : p),
      bench: user.bench.map(p => p.id === benchPlayerId ? squadPlayer : p)
    };
    
    setUser(updatedUser);
    // TODO: Sync with database
    return true;
  };

  const setFormation = (formation: { id: string; name: string; positions: { GK: number; DEF: number; MID: number; ATT: number } }) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      selectedFormation: formation
    };
    
    setUser(updatedUser);
    // TODO: Sync with database
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
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
