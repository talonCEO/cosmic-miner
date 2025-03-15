import React, { useState, useEffect } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';
import { useFirebase } from '@/context/FirebaseContext';
import { Trophy, BarChart3 } from 'lucide-react';
import { getLevelFromExp, getTitleById } from '@/data/playerProgressionData';
import { MenuType } from './types';

interface ProfileProps {
  setMenuType?: (menuType: MenuType) => void;
}

const Profile: React.FC<ProfileProps> = ({ setMenuType }) => {
  const { state } = useGame();
  const { profile, loading, updateUsername, updateTitle } = useFirebase();
  
  // Handle player name change (updates Firebase profile)
  const handleNameChange = (newName: string) => {
    if (profile && newName.trim() !== profile.username) {
      updateUsername(newName);
    }
  };
  
  // Handle title change
  const handleTitleChange = (titleId: string) => {
    if (profile && titleId.trim() !== profile.title) {
      updateTitle(titleId);
    }
  };
  
  // Get level info from total coins earned (used as XP)
  const exp = profile?.exp || state.totalEarned || 0;
  const { currentLevel, nextLevel } = getLevelFromExp(exp);
  
  // Fallback player data (used regardless of loading state)
  const playerData = {
    name: profile?.username || "Elon",
    title: profile?.title || "space_pilot", // Default title ID
    level: profile?.level || currentLevel.level,
    exp: exp,
    maxExp: nextLevel ? nextLevel.expRequired : currentLevel.expRequired + 1000,
    coins: state.coins,
    gems: state.gems || 1, // Use state.gems if available, fallback to 500
    essence: state.essence,
    userId: profile?.userId || Math.floor(10000000 + Math.random() * 90000000).toString()
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
        <PlayerFriends />
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
