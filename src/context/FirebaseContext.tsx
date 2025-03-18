
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

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
  user: { uid: string } | null;
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
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("FirebaseProvider mounted");
    
    const initializeUser = async () => {
      setLoading(true);
      try {
        // Create anonymous user with a random UID
        const uid = `anon-${Math.random().toString(36).substring(2, 15)}`;
        const mockUser = { uid };
        setUser(mockUser);
        
        // Load from localStorage or create new profile
        const savedProfile = localStorage.getItem('userProfile');
        
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile) as UserProfile);
          console.log("Profile loaded from localStorage");
        } else {
          const newUserId = await generateUserId();
          const defaultUsername = `Player${newUserId.substring(0, 4)}`;

          const newUserProfile: UserProfile = {
            uid: mockUser.uid,
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
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          localStorage.setItem('userProfile', JSON.stringify(newUserProfile));
          setProfile(newUserProfile);
          console.log("New user created:", newUserProfile);
        }
      } catch (err) {
        console.error("Initialization error:", (err as Error).message);
        setError("Failed to initialize user data");
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      console.log("No user, skipping update");
      return;
    }
    
    try {
      const updatedProfile = { ...profile, ...data, lastLogin: new Date().toISOString() } as UserProfile;
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      console.log("Profile updated in localStorage:", data);
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Update error:", (err as Error).message);
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
