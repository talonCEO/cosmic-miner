
import React, { useState } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';
import PlayerRankings from './PlayerRankings';
import { useFirebase } from '@/context/FirebaseContext';
import { Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { state } = useGame();
  const { profile, loading, updateUsername } = useFirebase();
  
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
  
  // Fallback player data (used if Firebase profile not loaded)
  const playerData = {
    name: profile?.username || "Cosmic Explorer",
    rank: profile?.rank || "Space Adventurer",
    level: profile?.level || state.prestigeCount + 1,
    exp: state.totalEarned % 1000,
    maxExp: 1000,
    coins: state.coins,
    gems: 500, // Mock value, would come from state in real implementation
    essence: state.essence,
    userId: profile?.userId || Math.floor(10000000 + Math.random() * 90000000).toString(),
    totalCoins: state.totalEarned,
    totalGems: 1500, // Mock value for total gems
    totalEssence: state.essence * (state.prestigeCount + 1),
    totalAbilityPoints: state.skillPoints + state.abilities.filter(a => a.unlocked).length,
    mmr: profile?.mmr || 1000,
    leaderboardRank: profile?.leaderboardRank || 0
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
          playerRank={playerData.rank}
          playerLevel={playerData.level}
          playerExp={playerData.exp}
          playerMaxExp={playerData.maxExp}
          coins={playerData.coins}
          gems={playerData.gems}
          essence={playerData.essence}
          onNameChange={handleNameChange}
          userId={playerData.userId}
        />
        
        {/* Player Rankings component */}
        <PlayerRankings 
          rank={playerData.rank}
          level={playerData.level}
          leaderboardRank={playerData.leaderboardRank}
          totalCoins={playerData.totalCoins}
          totalGems={playerData.totalGems}
          totalEssence={playerData.totalEssence}
          totalAbilityPoints={playerData.totalAbilityPoints}
          mmr={playerData.mmr}
        />
        
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
