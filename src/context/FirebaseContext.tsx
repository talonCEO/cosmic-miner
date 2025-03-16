
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '@/services/StorageService';

// Define types for the Firebase context
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  level?: number;
  experience?: number;
  lastLogin?: number;
}

export interface FirebaseContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  syncGameData: () => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
}

// Create context
const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Provider component
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from local storage on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = await StorageService.getData('userProfile');
        
        if (savedUser) {
          setUser(savedUser);
        } else {
          // If no user is found, create a mock user
          const mockUser: UserProfile = {
            uid: 'local-user',
            displayName: 'Cosmic Miner',
            email: 'player@example.com',
            photoURL: null,
            level: 1,
            experience: 0,
            lastLogin: Date.now()
          };
          
          setUser(mockUser);
          await StorageService.saveData('userProfile', mockUser);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Mock logout function
  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      await StorageService.removeData('userProfile');
      return Promise.resolve();
    } catch (error) {
      console.error('Error logging out:', error);
      return Promise.reject(error);
    }
  };

  // Mock function to sync game data
  const syncGameData = async (): Promise<void> => {
    try {
      const gameState = await StorageService.getData('gameState');
      
      if (gameState && user) {
        // In a real implementation, this would save to Firebase
        // For now, we just log and save to local storage
        console.log('Syncing game data for user:', user.uid);
        
        // Update user profile with latest level/experience
        const updatedUser = {
          ...user,
          level: gameState.level,
          experience: gameState.experience,
          lastLogin: Date.now()
        };
        
        setUser(updatedUser);
        await StorageService.saveData('userProfile', updatedUser);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error syncing game data:', error);
      return Promise.reject(error);
    }
  };

  // Mock function to get user profile
  const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const savedUser = await StorageService.getData('userProfile');
      return savedUser;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        syncGameData,
        getUserProfile
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase context
export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
