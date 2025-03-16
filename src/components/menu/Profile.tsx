import React, { useState, useEffect } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard'; // Assuming this exists
import PlayerFriends from './PlayerFriends';
import { useFirebase } from '@/context/FirebaseContext';
import { Loader2, Trophy, BarChart3 } from 'lucide-react';
import { getLevelFromExp, getTitleById } from '@/data/playerProgressionData';
import { MenuType } from './types';

// Define PlayerCardProps (assumed)
interface PlayerCardProps {
  playerName: string;
  playerTitle: string;
  playerLevel: number;
  playerExp: number;
  playerMaxExp: number;
  coins: number;
  gems: number; // Added
  essence: number;
  onNameChange: (newName: string) => void;
  userId: string;
}

interface ProfileProps {
  setMenuType?: (menuType: MenuType) => void;
}

const Profile: React.FC<ProfileProps> = ({ setMenuType }) => {
  const { state } = useGame();
  const { profile, loading, updateUsername, updateTitle } = useFirebase();

  const handleNameChange = (newName: string) => {
    if (profile && newName.trim() !== profile.username) {
      updateUsername(newName);
    }
  };

  const handleTitleChange = (titleId: string) => {
    if (profile && titleId.trim() !== profile.title) {
      updateTitle(titleId);
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

  const exp = profile?.exp || state.totalEarned || 0;
  const { currentLevel, nextLevel } = getLevelFromExp(exp);

  const playerData = {
    name: profile?.username || "Cosmic Explorer",
    title: profile?.title || "space_pilot",
    level: profile?.level || currentLevel.level,
    exp: exp,
    maxExp: nextLevel ? nextLevel.expRequired : currentLevel.expRequired + 1000,
    coins: state.coins,
    gems: state.gems, // Use state.gems instead of mock value
    essence: state.essence,
    userId: profile?.userId || Math.floor(10000000 + Math.random() * 90000000).toString(),
  };

  const handleAchievementsClick = () => {
    if (setMenuType) setMenuType('achievements');
  };

  const handleLeaderboardClick = () => {
    if (setMenuType) setMenuType('leaderboard');
  };

  return (
    // ... (JSX unchanged)
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Player Profile</DialogTitle>
      </DialogHeader>
      <div className="p-4 space-y-4">
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
