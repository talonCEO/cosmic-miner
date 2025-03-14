
import React, { useState } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';
import { useFirebase } from '@/context/FirebaseContext';
import { Loader2, Trophy, BarChart3 } from 'lucide-react';
import { calculatePlayerLevel, calculateLevelProgress, calculateXPForNextLevel, getHighestUnlockedTitle, getUnlockedTitles } from '@/utils/playerData';

const Profile: React.FC = () => {
  const { state, dispatch } = useGame();
  const { profile, loading, updateUsername } = useFirebase();
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  // Calculate player level and progress
  const playerLevel = profile?.level || calculatePlayerLevel(state.totalEarned);
  const expProgress = calculateLevelProgress(state.totalEarned);
  const currentExp = state.totalEarned;
  const expForNextLevel = calculateXPForNextLevel(playerLevel);
  
  // Handle player name change (updates Firebase profile)
  const handleNameChange = (newName: string) => {
    if (profile && newName.trim() !== profile.username) {
      updateUsername(newName);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="mt-2 text-slate-300">Loading your profile...</p>
      </div>
    );
  }
  
  // Get available titles for this player level
  const availableTitles = getUnlockedTitles(playerLevel);
  const defaultTitle = getHighestUnlockedTitle(playerLevel).name;
  
  // Fallback player data (used if Firebase profile not loaded)
  const playerData = {
    name: profile?.username || "Cosmic Explorer",
    title: profile?.title || defaultTitle, // Use player's selected title or default
    level: playerLevel,
    exp: currentExp,
    maxExp: expForNextLevel,
    coins: state.coins,
    gems: 500, // Mock value, would come from state in real implementation
    essence: state.essence,
    userId: profile?.userId || Math.floor(10000000 + Math.random() * 90000000).toString()
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
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
                onClick={() => dispatch({ type: 'SET_MENU_TYPE', menuType: 'achievements' })}
                className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trophy size={20} />
                <span>Achievements</span>
              </button>
              
              <button 
                onClick={() => dispatch({ type: 'SET_MENU_TYPE', menuType: 'leaderboard' })}
                className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 size={20} />
                <span>Leaderboard</span>
              </button>
            </div>
            
            {/* Friends list component */}
            <PlayerFriends />
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Player Profile</DialogTitle>
      </DialogHeader>
      
      <div className="p-4 space-y-4">
        {renderContent()}
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
