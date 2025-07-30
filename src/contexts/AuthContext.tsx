
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  fullName: string;
  email: string;
  budget: number;
  squad: Player[];
}

interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  club: string;
  nationality: string;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  dribbling: number;
  physical: number;
  cost: number;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addPlayerToSquad: (player: Player) => boolean;
  removePlayerFromSquad: (playerId: string) => void;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('fpsl_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Ensure budget is adequate for new pricing structure
      if (userData.budget < 1000000000) {
        userData.budget = 1000000000; // Reset to 1B if less
        localStorage.setItem('fpsl_user', JSON.stringify(userData));
      }
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check stored users or use demo credentials
    const storedUsers = JSON.parse(localStorage.getItem('fpsl_users') || '[]');
    const existingUser = storedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (existingUser || (email === 'demo@fpsl.com' && password === 'demo123')) {
      const userData: User = existingUser || {
        id: 'demo-user',
        fullName: 'Demo User',
        email: 'demo@fpsl.com',
        budget: 1000000000, // Increased budget for new pricing
        squad: []
      };
      
      // Ensure adequate budget
      if (userData.budget < 1000000000) {
        userData.budget = 1000000000;
      }
      
      setUser(userData);
      localStorage.setItem('fpsl_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const storedUsers = JSON.parse(localStorage.getItem('fpsl_users') || '[]');
    const existingUser = storedUsers.find((u: any) => u.email === email);
    
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password,
      budget: 1000000000, // Increased starting budget
      squad: []
    };
    
    storedUsers.push(newUser);
    localStorage.setItem('fpsl_users', JSON.stringify(storedUsers));
    
    const userData: User = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      budget: newUser.budget,
      squad: newUser.squad
    };
    
    setUser(userData);
    localStorage.setItem('fpsl_user', JSON.stringify(userData));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fpsl_user');
  };

  const addPlayerToSquad = (player: Player): boolean => {
    if (!user) return false;
    
    if (user.squad.length >= 11) {
      return false; // Squad full
    }
    
    if (user.budget < player.cost) {
      return false; // Insufficient budget
    }
    
    if (user.squad.some(p => p.id === player.id)) {
      return false; // Player already in squad
    }
    
    const updatedUser = {
      ...user,
      budget: user.budget - player.cost,
      squad: [...user.squad, player]
    };
    
    setUser(updatedUser);
    localStorage.setItem('fpsl_user', JSON.stringify(updatedUser));
    return true;
  };

  const removePlayerFromSquad = (playerId: string) => {
    if (!user) return;
    
    const playerToRemove = user.squad.find(p => p.id === playerId);
    if (!playerToRemove) return;
    
    const updatedUser = {
      ...user,
      budget: user.budget + playerToRemove.cost,
      squad: user.squad.filter(p => p.id !== playerId)
    };
    
    setUser(updatedUser);
    localStorage.setItem('fpsl_user', JSON.stringify(updatedUser));
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
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
