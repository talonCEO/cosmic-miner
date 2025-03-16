
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
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean; // Add this for compatibility with old code
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateTitle: (titleId: string) => Promise<void>;
  updatePortrait: (portraitId: string) => Promise<void>;
  unlockTitle: (titleId: string) => Promise<void>;
  unlockPortrait: (portraitId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Generate a mock user ID
    const mockUserId = localStorage.getItem('mockUserId') || 
                       Math.floor(10000000 + Math.random() * 90000000).toString();
    localStorage.setItem('mockUserId', mockUserId);
    
    // Create a mock user
    const mockUser = {
      uid: mockUserId,
      isAnonymous: true
    };
    setUser(mockUser);
    
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('player_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // Create default profile
      const newUserId = localStorage.getItem('mockUserId') || 
                       Math.floor(10000000 + Math.random() * 90000000).toString();
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

      localStorage.setItem('player_profile', JSON.stringify(newUserProfile));
      setProfile(newUserProfile);
    }
    
    setLoading(false);
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      console.log("No user, skipping update");
      return;
    }
    
    try {
      const currentProfile = profile || JSON.parse(localStorage.getItem('player_profile') || '{}');
      const updatedProfile = { 
        ...currentProfile, 
        ...data, 
        lastLogin: new Date().toISOString() 
      };
      
      localStorage.setItem('player_profile', JSON.stringify(updatedProfile));
      console.log("Profile updated in localStorage:", data);
      setProfile(updatedProfile);
    } catch (err: any) {
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
    isLoading: loading, // Add for compatibility
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
