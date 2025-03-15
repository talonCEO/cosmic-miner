
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
  serverTimestamp,
  query,
  where,
  getDocs,
  collection
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
  title: string;
  portrait: string;
  unlockedTitles: string[];
  unlockedPortraits: string[];
  achievements: string[];
  createdAt: any; // Use serverTimestamp in Firestore
  lastLogin: any; // Use serverTimestamp in Firestore
  hasChangedUsername: boolean; // Track if the user has used their free username change
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUsername: (username: string) => Promise<{ success: boolean; message?: string }>;
  updateTitle: (titleId: string) => Promise<void>;
  updatePortrait: (portraitId: string) => Promise<void>;
  unlockTitle: (titleId: string) => Promise<void>;
  unlockPortrait: (portraitId: string) => Promise<void>;
  addGems: (amount: number) => Promise<void>;
  spendGems: (amount: number) => Promise<boolean>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Generate a unique 8-digit user ID
const generateUserId = async (): Promise<string> => {
  let newId = Math.floor(10000000 + Math.random() * 90000000).toString();
  const q = query(collection(db, "users"), where("userId", "==", newId));
  let querySnapshot = await getDocs(q);
  
  while (!querySnapshot.empty) {
    newId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const newQuery = query(collection(db, "users"), where("userId", "==", newId));
    querySnapshot = await getDocs(newQuery);
  }
  return newId;
};

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
          await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
        } else {
          const newUserId = await generateUserId();
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
            title: "space_pilot",
            portrait: "default",
            unlockedTitles: ["space_pilot"],
            unlockedPortraits: ["default"],
            achievements: [],
            createdAt: serverTimestamp(), // Server-side timestamp
            lastLogin: serverTimestamp(), // Server-side timestamp
            hasChangedUsername: false,
          };

          await setDoc(userDocRef, newUserProfile);
          setProfile(newUserProfile);
          console.log("New anonymous user created:", user.uid);
        }
      } else {
        await signInAnonymously(auth).catch((err) => {
          console.error("Error signing in anonymously:", err);
          setError("Failed to create anonymous account");
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync profile to Firebase every 60 minutes
  useEffect(() => {
    if (!user || !profile) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Check if it's been at least 60 minutes since the last sync
      if (now - lastSyncTime >= 60 * 60 * 1000) {
        updateProfile({});
        setLastSyncTime(now);
        console.log("Periodic profile sync to Firebase completed");
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [user, profile, lastSyncTime]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { ...data, lastLogin: serverTimestamp() });
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    setLastSyncTime(Date.now()); // Update last sync time
  };

  const updateUsername = async (username: string): Promise<{ success: boolean; message?: string }> => {
    if (!username.trim() || !profile) return { success: false, message: "Invalid username" };
    
    // Check if this is a free change or if the user has enough gems
    if (!profile.hasChangedUsername) {
      // First change is free
      await updateProfile({ username, hasChangedUsername: true });
      return { success: true, message: "Username updated for free" };
    } else {
      // Subsequent changes cost 200 gems
      if (profile.gems >= 200) {
        await updateProfile({ username, gems: profile.gems - 200 });
        return { success: true, message: "Username updated for 200 gems" };
      } else {
        return { 
          success: false, 
          message: "Not enough gems. Username changes after the first one cost 200 gems." 
        };
      }
    }
  };

  const updateTitle = async (titleId: string) => {
    if (!titleId.trim() || !profile || !profile.unlockedTitles.includes(titleId)) return;
    await updateProfile({ title: titleId });
  };

  const updatePortrait = async (portraitId: string) => {
    if (!portraitId.trim() || !profile || !profile.unlockedPortraits.includes(portraitId)) return;
    await updateProfile({ portrait: portraitId });
  };

  const unlockTitle = async (titleId: string) => {
    if (!titleId.trim() || !profile || profile.unlockedTitles.includes(titleId)) return;
    const updatedTitles = [...profile.unlockedTitles, titleId];
    await updateProfile({ unlockedTitles: updatedTitles });
  };

  const unlockPortrait = async (portraitId: string) => {
    if (!portraitId.trim() || !profile || profile.unlockedPortraits.includes(portraitId)) return;
    const updatedPortraits = [...profile.unlockedPortraits, portraitId];
    await updateProfile({ unlockedPortraits: updatedPortraits });
  };

  const addGems = async (amount: number) => {
    if (!profile || amount <= 0) return;
    const newGemCount = profile.gems + amount;
    await updateProfile({ gems: newGemCount });
  };

  const spendGems = async (amount: number): Promise<boolean> => {
    if (!profile || amount <= 0) return false;
    if (profile.gems < amount) return false;
    
    const newGemCount = profile.gems - amount;
    await updateProfile({ gems: newGemCount });
    return true;
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
    unlockPortrait,
    addGems,
    spendGems
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error("useFirebase must be used within a FirebaseProvider");
  return context;
};
