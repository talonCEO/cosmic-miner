
import React, { useState, useEffect } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';
import { useFirebase } from '@/context/FirebaseContext';
import { Loader2, Trophy, BarChart3 } from 'lucide-react';
import { getLevelFromExp, getTitleById } from '@/data/playerProgressionData';
import { MenuType } from './types';
import { syncGameProgress } from '@/utils/firebaseSync';

interface ProfileProps {
  setMenuType?: (menuType: MenuType) => void;
}

const Profile: React.FC<ProfileProps> = ({ setMenuType }) => {
  const { state } = useGame();
  const { profile, loading } = useFirebase();
  const [localProfile, setLocalProfile] = useState<any>(null);
  
  // Initialize local profile from localStorage or create new one
  useEffect(() => {
    const savedProfile = localStorage.getItem('player_profile');
    
    if (savedProfile) {
      setLocalProfile(JSON.parse(savedProfile));
    } else {
      // Create a default profile if none exists
      const exp = state.totalEarned || 0;
      const { currentLevel, nextLevel } = getLevelFromExp(exp);
      
      const defaultProfile = {
        userId: Math.floor(10000000 + Math.random() * 90000000).toString(),
        username: "Cosmic Explorer",
        level: currentLevel.level,
        exp: exp,
        coins: state.coins,
        essence: state.essence || 0,
        skillPoints: state.skillPoints || 0,
        totalCoins: state.totalEarned || 0,
        title: "space_pilot",
        lastLogin: new Date().toISOString(),
        unlockedTitles: ["space_pilot"],
        unlockedPortraits: ["default"],
        achievements: []
      };
      
      localStorage.setItem('player_profile', JSON.stringify(defaultProfile));
      setLocalProfile(defaultProfile);
    }
  }, []);
  
  // Sync game state to local profile periodically
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (localProfile?.userId) {
        syncGameProgress(localProfile.userId, state);
        // Update local profile after sync
        const savedProfile = localStorage.getItem('player_profile');
        if (savedProfile) {
          setLocalProfile(JSON.parse(savedProfile));
        }
      }
    }, 10000); // Sync every 10 seconds
    
    return () => clearInterval(syncInterval);
  }, [localProfile, state]);
  
  // Handle player name change (updates local storage)
  const handleNameChange = (newName: string) => {
    if (localProfile && newName.trim() !== localProfile.username) {
      const updatedProfile = { ...localProfile, username: newName };
      localStorage.setItem('player_profile', JSON.stringify(updatedProfile));
      setLocalProfile(updatedProfile);
      
      // Also update Firebase if available
      if (profile) {
        // Firebase update code would go here if we were using it
      }
    }
  };
  
  // Handle title change
  const handleTitleChange = (titleId: string) => {
    if (localProfile && titleId.trim() !== localProfile.title) {
      const updatedProfile = { ...localProfile, title: titleId };
      localStorage.setItem('player_profile', JSON.stringify(updatedProfile));
      setLocalProfile(updatedProfile);
      
      // Also update Firebase if available
      if (profile) {
        // Firebase update code would go here if we were using it
      }
    }
  };
  
  // If no local profile yet, show loading
  if (!localProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="mt-2 text-slate-300">Loading your profile...</p>
      </div>
    );
  }
  
  // Get level info from total coins earned (used as XP)
  const exp = localProfile.exp || state.totalEarned || 0;
  const { currentLevel, nextLevel } = getLevelFromExp(exp);
  
  // Player data from local storage
  const playerData = {
    name: localProfile.username || "Cosmic Explorer",
    title: localProfile.title || "space_pilot", // Default title ID
    level: localProfile.level || currentLevel.level,
    exp: exp,
    maxExp: nextLevel ? nextLevel.expRequired : currentLevel.expRequired + 1000,
    coins: state.coins,
    gems: state.gems || 0, // Use game state for gems
    essence: state.essence || 0,
    userId: localProfile.userId
  };
  
  const handleAchievementsClick = () => {
    // Navigate to achievements menu if setMenuType prop is available
    if (setMenuType) {
      setMenuType('achievements');
    }
  };
  
  const handleLeaderboardClick = () => {
    // Navigate to leaderboard menu if setMenuType prop is available
    if (setMenuType) {
      setMenuType('leaderboard');
    }
  };
  
  // Mock friends data
  const friendsData = [
    { id: '1', name: 'CosmicMiner42', level: 27, online: true },
    { id: '2', name: 'StardustCollector', level: 19, online: false },
    { id: '3', name: 'GalacticDriller', level: 31, online: true }
  ];
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Player Profile</DialogTitle>
      </DialogHeader>
      
      <div className="p-4 space-y-4">
        {/* Enhanced player card with currency info and UID */}
        <PlayerCard 
          playerName={playerData.name}
          playerTitle={playerData.title}
          playerLevel={playerData.level}
          playerExp={playerData.exp}
          playerMaxExp={playerData.maxExp}
          coins={playerData.coins}
          gems={playerData.gems}
          essence={playerData.essence}
          onNameChange={handleNameChange}
          userId={playerData.userId}
        />
        
        {/* Navigation buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            onClick={handleAchievementsClick}
            className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trophy size={20} />
            <span>Achievements</span>
          </button>
          
          <button 
            onClick={handleLeaderboardClick}
            className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 size={20} />
            <span>Leaderboard</span>
          </button>
        </div>
        
        {/* Friends list component */}
        <PlayerFriends friends={friendsData} />
      </div>
      
      <div className="p-4 mt-auto border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Profile;
