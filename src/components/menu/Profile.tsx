
import React, { useState } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';

const Profile: React.FC = () => {
  const { state } = useGame();
  
  // Mock player data - in a real implementation, this would come from the game state
  const playerData = {
    name: "Cosmic Explorer",
    rank: "Space Adventurer",
    level: state.prestigeCount + 1,
    exp: state.totalEarned % 1000,
    maxExp: 1000,
    coins: state.coins,
    gems: 500, // Mock value, would come from state in real implementation
    essence: state.essence
  };
  
  const handleNameChange = (newName: string) => {
    console.log("Player name changed to:", newName);
    // In a real implementation, update this in the game state
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
