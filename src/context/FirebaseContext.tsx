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

// ... (initialization unchanged)

export interface UserProfile {
  uid: string;
  username: string;
  userId: string;
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
  createdAt: any;
  lastLogin: any;
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

// ... (generateUserId unchanged)

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
          await updateDoc(userDocRef, { lastLogin: serverTimestamp() }); // Fixed
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
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserProfile);
          setProfile(newUserProfile);
        }
      } else {
        await signInAnonymously(auth).catch((err) => {
          setError("Failed to create anonymous account");
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, { ...data, lastLogin: serverTimestamp() }); // Fixed
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  // ... (other methods unchanged)

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
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error("useFirebase must be used within a FirebaseProvider");
  return context;
};
