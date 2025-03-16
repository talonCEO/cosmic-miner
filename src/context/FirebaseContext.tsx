
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { StorageService } from "../services/StorageService";

// Define the types for our context
interface FirebaseContextType {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  syncPlayerData: (playerData: any) => Promise<void>;
  getPlayerData: () => Promise<any>;
}

// Create the context with default values
const FirebaseContext = createContext<FirebaseContextType>({
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  syncPlayerData: async () => {},
  getPlayerData: async () => ({}),
});

// Custom hook to use the Firebase context
export const useFirebase = () => useContext(FirebaseContext);

// Provider component that wraps the app and provides the Firebase context value
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthenticated(true);
      } else {
        // Use anonymous auth as fallback
        signInAnonymously(auth)
          .then((result) => {
            setUserId(result.user.uid);
            setIsAuthenticated(true);
          })
          .catch((error) => {
            console.error("Anonymous auth failed:", error);
            // Continue anyway with local data
            setIsAuthenticated(false);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to sync player data with Firestore
  const syncPlayerData = async (playerData: any) => {
    try {
      if (userId && isAuthenticated) {
        const userDocRef = doc(db, "players", userId);
        await setDoc(userDocRef, playerData, { merge: true });
        console.log("Player data synced with Firebase");
      }
      
      // Always save locally regardless of Firebase status
      await StorageService.saveData("playerData", playerData);
      console.log("Player data saved locally");
    } catch (error) {
      console.error("Error syncing player data:", error);
      // Ensure data is saved locally even if Firebase fails
      await StorageService.saveData("playerData", playerData);
      console.log("Player data saved locally (Firebase sync failed)");
    }
  };

  // Function to get player data from Firestore or local storage
  const getPlayerData = async () => {
    try {
      // First try to get local data
      const localData = await StorageService.getData("playerData");
      
      // If we have local data and Firebase is having issues, just use local data
      if (localData && (!userId || !isAuthenticated)) {
        console.log("Using local player data (Firebase unavailable)");
        return localData;
      }
      
      // If authenticated, try to get data from Firebase
      if (userId && isAuthenticated) {
        const userDocRef = doc(db, "players", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const firebaseData = docSnap.data();
          console.log("Got player data from Firebase");
          // Update local storage with the latest from Firebase
          await StorageService.saveData("playerData", firebaseData);
          return firebaseData;
        }
      }
      
      // If we have local data but nothing on Firebase, use local
      if (localData) {
        console.log("Using local player data");
        return localData;
      }
      
      // If all else fails, return empty object
      console.log("No player data found");
      return {};
    } catch (error) {
      console.error("Error getting player data:", error);
      // Fallback to local storage if Firebase fails
      const localData = await StorageService.getData("playerData");
      if (localData) {
        console.log("Using local player data (Firebase error)");
        return localData;
      }
      return {};
    }
  };

  // The context value that will be supplied to any descendants of this provider
  const value = {
    userId,
    isAuthenticated,
    isLoading,
    syncPlayerData,
    getPlayerData,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
