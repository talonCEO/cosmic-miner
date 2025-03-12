
import React, { useState } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Medal, Trophy, Users, Filter } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';

// Dummy data for illustration - in a real app, this would come from a database
const dummyLeaderboardData = [
  { id: 1, username: "CosmicChampion", score: 9876543210, level: 120, rank: "Galactic Emperor" },
  { id: 2, username: "StarGazer", score: 8765432109, level: 115, rank: "Void Master" },
  { id: 3, username: "MoonWalker", score: 7654321098, level: 110, rank: "Celestial Guardian" },
  { id: 4, username: "SolarFlare", score: 6543210987, level: 105, rank: "Astral Voyager" },
  { id: 5, username: "NebulaNinja", score: 5432109876, level: 100, rank: "Cosmic Architect" },
  { id: 6, username: "GalaxyGlider", score: 4321098765, level: 95, rank: "Stellar Navigator" },
  { id: 7, username: "AsteroidAvenger", score: 3210987654, level: 90, rank: "Space Admiral" },
  { id: 8, username: "CometCrusher", score: 2109876543, level: 85, rank: "Interstellar Explorer" },
  { id: 9, username: "PlanetPioneer", score: 1098765432, level: 80, rank: "Nova Sentinel" },
  { id: 10, username: "VoidVoyager", score: 987654321, level: 75, rank: "Cosmic Pioneer" },
];

const Leaderboard: React.FC = () => {
  const { state } = useGame();
  const [filterType, setFilterType] = useState<'all' | 'friends' | 'global'>('global');
  
  // Simulated player position
  const playerPosition = 42; // In a real app, this would be calculated
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
          <BarChart3 size={20} />
          <span>Leaderboard</span>
        </DialogTitle>
      </DialogHeader>
      
      <div className="p-4 border-b border-indigo-500/20">
        <div className="flex justify-center gap-2">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterType === 'global' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
            onClick={() => setFilterType('global')}
          >
            Global
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterType === 'friends' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
            onClick={() => setFilterType('friends')}
          >
            Friends
          </button>
        </div>
      </div>
      
      <div className="bg-slate-800/50 mx-4 mt-4 p-3 rounded-lg border border-indigo-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-indigo-600/60 rounded-full">
              {playerPosition}
            </div>
            <div>
              <div className="font-medium">Your Rank</div>
              <div className="text-sm text-slate-400">Score: {formatNumber(state.totalEarned)}</div>
            </div>
          </div>
          <div>
            <Trophy className="text-yellow-500 h-6 w-6" />
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[40vh] px-4 mt-2">
        <div className="space-y-2">
          {dummyLeaderboardData.map((player, index) => (
            <div 
              key={player.id} 
              className="flex items-center p-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex-shrink-0 w-8 flex justify-center">
                {index + 1 <= 3 ? (
                  <Medal className={
                    index === 0 ? "text-yellow-400" : 
                    index === 1 ? "text-slate-300" : 
                    "text-amber-600"
                  } />
                ) : (
                  <span className="text-slate-400">{index + 1}</span>
                )}
              </div>
              
              <div className="ml-3 flex-grow">
                <div className="font-medium">{player.username}</div>
                <div className="text-xs text-slate-400">Level {player.level} • {player.rank}</div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">{formatNumber(player.score)}</div>
                <div className="text-xs text-slate-400">points</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-indigo-500/20 mt-auto">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default Leaderboard;
