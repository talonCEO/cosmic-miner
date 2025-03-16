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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

const generateUserId = async (): Promise<string> => {
  let newId = Math.floor(10000000 + Math.random() * 90000000).toString();
  let querySnapshot = await getDocs(query(collection(db, "users"), where("userId", "==", newId)));
  
  while (!querySnapshot.empty) {
    newId = Math.floor(10000000 + Math.random() * 90000000).toString();
    querySnapshot = await getDocs(query(collection(db, "users"), where("userId", "==", newId)));
  }
  return newId;
};

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("FirebaseProvider mounted");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid || "null");
      setLoading(true);

      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
          await updateDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
          console.log("Profile loaded:", userDoc.data());
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
          console.log("New user created:", newUserProfile);
        }
      } else {
        console.log("Signing in anonymously");
        await signInAnonymously(auth).catch((err) => {
          console.error("Sign-in error:", err.message);
          setError("Failed to create anonymous account");
        });
      }

      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      console.log("No user, skipping update");
      return;
    }
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, { ...data, lastLogin: serverTimestamp() }, { merge: true });
      console.log("Profile updated in Firestore:", data);
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err) {
      console.error("Update error:", err.message);
      setError("Failed to update profile");
    }
  };

  const updateUsername = async (username: string) => {
    if (!username.trim()) return;
    console.log("Updating username:", username);
    await updateProfile({ username });
  };

  const updateTitle = async (titleId: string) => {
    if (!titleId.trim() || !profile || !profile.unlockedTitles.includes(titleId)) return;
    console.log("Updating title:", titleId);
    await updateProfile({ title: titleId });
  };

  const updatePortrait = async (portraitId: string) => {
    if (!portraitId.trim() || !profile || !profile.unlockedPortraits.includes(portraitId)) return;
    console.log("Updating portrait:", portraitId);
    await updateProfile({ portrait: portraitId });
  };

  const unlockTitle = async (titleId: string) => {
    if (!titleId.trim() || !profile || profile.unlockedTitles.includes(titleId)) return;
    const updatedTitles = [...profile.unlockedTitles, titleId];
    console.log("Unlocking title:", titleId);
    await updateProfile({ unlockedTitles: updatedTitles });
  };

  const unlockPortrait = async (portraitId: string) => {
    if (!portraitId.trim() || !profile || profile.unlockedPortraits.includes(portraitId)) return;
    const updatedPortraits = [...profile.unlockedPortraits, portraitId];
    console.log("Unlocking portrait:", portraitId);
    await updateProfile({ unlockedPortraits: updatedPortraits });
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
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error("useFirebase must be used within a FirebaseProvider");
  return context;
};
