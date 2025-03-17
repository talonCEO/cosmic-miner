import React from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import PlayerCard from './PlayerCard';
import PlayerFriends from './PlayerFriends';
import { Trophy, BarChart3 } from 'lucide-react';
import { getLevelFromExp } from '@/data/playerProgressionData';
import { MenuType } from './types';

interface ProfileProps {
  setMenuType?: (menuType: MenuType) => void;
}

const Profile: React.FC<ProfileProps> = ({ setMenuType }) => {
  const { state, updateUsername } = useGame(); // Only need updateUsername for name changes

  const handleNameChange = (newName: string) => {
    if (newName.trim() && newName !== state.username) {
      updateUsername(newName); // Use GameContext's updateUsername
    }
  };

  const exp = state.totalEarned || 0; // Use totalEarned as exp source
  const { currentLevel, nextLevel } = getLevelFromExp(exp);

  const playerData = {
    playerName: state.username || "Cosmic Explorer",
    playerTitle: state.title || "space_pilot",
    playerLevel: currentLevel.level,
    playerExp: exp,
    playerMaxExp: nextLevel ? nextLevel.expRequired : currentLevel.expRequired + 1000,
    coins: state.coins,
    gems: state.gems,
    essence: state.essence,
    userId: state.userId || Math.floor(10000000 + Math.random() * 90000000).toString(),
  };

  const handleAchievementsClick = () => {
    if (setMenuType) {
      setMenuType('achievements');
    }
  };

  const handleLeaderboardClick = () => {
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
        <PlayerCard
          playerName={playerData.playerName}
          playerTitle={playerData.playerTitle}
          playerLevel={playerData.playerLevel}
          playerExp={playerData.playerExp}
          playerMaxExp={playerData.playerMaxExp}
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
