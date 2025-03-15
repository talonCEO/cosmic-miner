
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { firebaseConfig } from '@/config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User profile interface
export interface UserProfile {
  uid: string;
  username: string;
  userId: string; // 8-digit unique ID
  coins: number;
  gems: number;
  essence: number;
  skillPoints: number;
  friends: string[];
  level: number;
  exp: number;
  totalCoins: number;
  title: string;      // Current selected title
  portrait: string;   // Current selected portrait/border
  unlockedTitles: string[];     // Array of unlocked title IDs
  unlockedPortraits: string[];  // Array of unlocked portrait IDs
  achievements: string[];       // Array of completed achievement IDs
  createdAt: Date;
  lastLogin: Date;
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateTitle: (titleId: string) => Promise<void>;
  updatePortrait: (portraitId: string) => Promise<void>;
  unlockTitle: (titleId: string) => Promise<void>;
  unlockPortrait: (portraitId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Generate a random 8-digit user ID
const generateUserId = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When the app initializes, sign in anonymously and listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        setUser(user);
        try {
          // Check if user profile exists
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // User exists, update the profile
            const userData = userDoc.data() as UserProfile;
            setProfile(userData);
            
            // Update last login timestamp
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp()
            });
          } else {
            // New user, create profile
            const newUserId = generateUserId();
            const defaultUsername = `Player${newUserId.substring(0, 4)}`;
            
            const newUserProfile: UserProfile = {
              uid: user.uid,
              username: defaultUsername,
              userId: newUserId,
              coins: 0,
              gems: 0,
              essence: 0,
              skillPoints: 0,
              friends: [],
              level: 1,
              exp: 0,
              totalCoins: 0,
              title: 'space_pilot', // Default title
              portrait: 'default',  // Default portrait
              unlockedTitles: ['space_pilot'], // Start with default title
              unlockedPortraits: ['default'],  // Start with default portrait
              achievements: [],
              createdAt: new Date(),
              lastLogin: new Date()
            };
            
            await setDoc(userDocRef, newUserProfile);
            setProfile(newUserProfile);
            
            console.log("New anonymous user created:", user.uid);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user profile");
        }
      } else {
        // No user signed in, sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Error signing in anonymously:", err);
          setError("Failed to create anonymous account");
        }
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Function to update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...data,
        lastLogin: serverTimestamp()
      });
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    }
  };

  // Function to update username
  const updateUsername = async (username: string) => {
    if (!username.trim()) return;
    await updateProfile({ username });
    console.log("Username updated successfully");
  };

  // Function to update title
  const updateTitle = async (titleId: string) => {
    if (!titleId.trim()) return;
    
    // Check if the title is unlocked
    if (profile && profile.unlockedTitles.includes(titleId)) {
      await updateProfile({ title: titleId });
      console.log("Title updated successfully");
    } else {
      console.error("Cannot select title that isn't unlocked");
      setError("This title is not unlocked yet");
    }
  };

  // Function to update portrait
  const updatePortrait = async (portraitId: string) => {
    if (!portraitId.trim()) return;
    
    // Check if the portrait is unlocked
    if (profile && profile.unlockedPortraits.includes(portraitId)) {
      await updateProfile({ portrait: portraitId });
      console.log("Portrait updated successfully");
    } else {
      console.error("Cannot select portrait that isn't unlocked");
      setError("This portrait is not unlocked yet");
    }
  };

  // Function to unlock a new title
  const unlockTitle = async (titleId: string) => {
    if (!titleId.trim() || !profile) return;
    
    // Don't add duplicates
    if (profile.unlockedTitles.includes(titleId)) return;
    
    const updatedTitles = [...profile.unlockedTitles, titleId];
    await updateProfile({ unlockedTitles: updatedTitles });
    console.log(`New title unlocked: ${titleId}`);
  };

  // Function to unlock a new portrait
  const unlockPortrait = async (portraitId: string) => {
    if (!portraitId.trim() || !profile) return;
    
    // Don't add duplicates
    if (profile.unlockedPortraits.includes(portraitId)) return;
    
    const updatedPortraits = [...profile.unlockedPortraits, portraitId];
    await updateProfile({ unlockedPortraits: updatedPortraits });
    console.log(`New portrait unlocked: ${portraitId}`);
  };

  const value = {
    user,
    profile,
    loading,
    error,
    updateProfile,
    updateUsername,
    updateTitle,
    updatePortrait,
    unlockTitle,
    unlockPortrait
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
