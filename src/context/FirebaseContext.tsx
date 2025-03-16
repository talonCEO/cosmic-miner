
import React, { createContext, useContext, useState, useEffect } from "react";
import { StorageService } from "../services/StorageService";
import { GameState } from "./GameContext";

// Define the user profile interface
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLogin: string;
  gameData?: any;
}

// Define the authentication context
interface FirebaseContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  syncPlayerData: (playerData: any) => Promise<void>;
  userLoaded: boolean;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  error: null,
  syncPlayerData: async () => {},
  userLoaded: false
});

// Custom hook to use the Firebase context
export const useFirebase = () => useContext(FirebaseContext);

// Provider component
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Load user data from local storage when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Use local storage for user data instead of Firebase
        const userData = await StorageService.getData("userData");
        
        if (userData) {
          setUser(userData);
        } else {
          // Create a default user profile if none exists
          const defaultUser: UserProfile = {
            uid: "local-user",
            displayName: "Cosmic Miner",
            email: "player@example.com",
            photoURL: null,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          
          await StorageService.saveData("userData", defaultUser);
          setUser(defaultUser);
        }
        
        setUserLoaded(true);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user data");
      } finally {
        // Always set loading to false so UI doesn't get stuck
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Sync player data with local storage
  const syncPlayerData = async (playerData: any) => {
    try {
      if (user) {
        const updatedUser = {
          ...user,
          gameData: playerData,
          lastLogin: new Date().toISOString(),
        };
        
        await StorageService.saveData("userData", updatedUser);
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Error syncing player data:", err);
      setError("Failed to sync player data");
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        error,
        syncPlayerData,
        userLoaded
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
