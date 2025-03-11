
import React from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import PlayerCard from './PlayerCard';

const Profile: React.FC = () => {
  const { state } = useGame();
  
  // Calculate playtime (in a real app, this would come from actual tracked playtime)
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const playtime = `${hours}h ${minutes}m`;
  
  // Generate a unique player ID (in a real app, this would be a stored user ID)
  const uniqueId = `CSM-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Mock leaderboard place (in a real app, this would come from a leaderboard service)
  const leaderboardPlace = Math.floor(100 + Math.random() * 900);
  
  // Player data
  const playerData = {
    name: "Cosmic Explorer",
    rank: "Space Adventurer",
    level: state.prestigeCount + 1,
    exp: state.totalEarned % 1000,
    maxExp: 1000,
    uniqueId: uniqueId,
    playTime: playtime,
    coins: state.coins,
    gems: 500, // Mock gems value
    essence: state.essence,
    prestigeCount: state.prestigeCount,
    leaderboardPlace: leaderboardPlace
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
      <div className="p-4 flex flex-col h-[55vh]">
        <PlayerCard 
          playerName={playerData.name}
          playerRank={playerData.rank}
          playerLevel={playerData.level}
          playerExp={playerData.exp}
          playerMaxExp={playerData.maxExp}
          uniqueId={playerData.uniqueId}
          playTime={playerData.playTime}
          coins={playerData.coins}
          gems={playerData.gems}
          essence={playerData.essence}
          prestigeCount={playerData.prestigeCount}
          leaderboardPlace={playerData.leaderboardPlace}
          onNameChange={handleNameChange}
        />
      </div>
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Profile;
