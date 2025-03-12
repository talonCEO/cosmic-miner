
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
import { useToast } from '@/components/ui/use-toast';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User profile interface
export interface UserProfile {
  uid: string;
  username: string;
  userId: string; // 8-digit unique ID
  level: number;
  rank: string;
  joinDate: Date;
  lastActive: Date;
  coins: number;
  essence: number;
  achievements: string[];
  friends: string[];
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
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
  const { toast } = useToast();

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
            
            // Update last active timestamp
            await updateDoc(userDocRef, {
              lastActive: serverTimestamp()
            });
          } else {
            // New user, create profile
            const newUserId = generateUserId();
            const defaultUsername = `Player${newUserId.substring(0, 4)}`;
            
            const newUserProfile: UserProfile = {
              uid: user.uid,
              username: defaultUsername,
              userId: newUserId,
              level: 1,
              rank: "Space Adventurer",
              joinDate: new Date(),
              lastActive: new Date(),
              coins: 0,
              essence: 0,
              achievements: [],
              friends: []
            };
            
            await setDoc(userDocRef, newUserProfile);
            setProfile(newUserProfile);
            
            toast({
              title: "Welcome to Cosmic Explorer!",
              description: "Your account has been created successfully.",
              duration: 5000,
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user profile");
          toast({
            title: "Error",
            description: "Failed to load your profile. Please try again later.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        // No user signed in, sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Error signing in anonymously:", err);
          setError("Failed to create anonymous account");
          toast({
            title: "Error",
            description: "Failed to connect to the game servers. Please check your connection.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [toast]);

  // Function to update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...data,
        lastActive: serverTimestamp()
      });
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Function to update username
  const updateUsername = async (username: string) => {
    if (!username.trim()) return;
    await updateProfile({ username });
    toast({
      title: "Username Updated",
      description: "Your username has been updated successfully.",
      duration: 3000,
    });
  };

  const value = {
    user,
    profile,
    loading,
    error,
    updateProfile,
    updateUsername
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
