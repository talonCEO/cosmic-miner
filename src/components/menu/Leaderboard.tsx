
import React, { useState, useEffect } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Medal, Trophy, Users, Filter } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// List of player titles in ascending order of prestige
const playerTitles = [
  "Space Pilot", // Default starting title
  "Asteroid Miner",
  "Orbital Explorer",
  "Star Navigator",
  "Nebula Ranger",
  "Void Wanderer",
  "Galaxy Voyager",
  "Cosmic Pathfinder",
  "Celestial Commander",
  "Galactic Overlord" // Most prestigious title
];

// Generate realistic player data for leaderboard
const generateLeaderboardData = () => {
  // Names for random players
  const names = [
    "CosmicChampion", "StarGazer", "MoonWalker", "SolarFlare", 
    "NebulaNinja", "GalaxyGlider", "AsteroidAvenger", "CometCrusher",
    "PlanetPioneer", "VoidVoyager", "OrbitalHunter", "NeutronNavigator"
  ];
  
  // Randomly select 10 unique names
  const shuffledNames = [...names].sort(() => 0.5 - Math.random());
  const selectedNames = shuffledNames.slice(0, 10);
  
  // Create leaderboard data
  return selectedNames.map((username, index) => {
    // Make first player highest score, then descending
    const score = 10000000000 - (index * 1000000000 / 10);
    const level = 100 - (index * 5);
    
    // Higher ranked players get better titles
    const titleIndex = Math.min(9, Math.max(0, 9 - Math.floor(index / 2)));
    const title = playerTitles[titleIndex];
    
    // Generate a random elo/mmr between 2000-3000 for top player, then descending
    const elo = 3000 - (index * 100);
    
    // Generate initials for the avatar
    const initials = username.substring(0, 2).toUpperCase();
    
    return {
      id: index + 1,
      username,
      score,
      level,
      title,
      galacticRank: elo,
      initials
    };
  });
};

const Leaderboard: React.FC = () => {
  const { state } = useGame();
  const [filterType, setFilterType] = useState<'all' | 'friends' | 'global'>('global');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  
  // Generate leaderboard data on component mount
  useEffect(() => {
    setLeaderboardData(generateLeaderboardData());
  }, []);
  
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
          {leaderboardData.map((player, index) => (
            <div 
              key={player.id} 
              className={`flex items-center p-3 rounded-lg border ${
                index === 0 ? "border-yellow-500/50 bg-yellow-900/20" :
                index === 1 ? "border-slate-400/50 bg-slate-700/30" :
                index === 2 ? "border-amber-800/50 bg-amber-900/20" :
                "border-slate-700 bg-slate-800/30"
              } hover:bg-slate-800/60 transition-colors`}
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
              
              {/* Player Avatar */}
              <Avatar className="h-10 w-10 mx-2">
                <AvatarImage src={`/placeholder.svg`} alt={player.username} />
                <AvatarFallback className="bg-indigo-700/50">
                  {player.initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-2 flex-grow">
                <div className="font-medium">{player.username}</div>
                <div className="text-xs text-slate-400">
                  <span>Level {player.level}</span>
                  <span className="mx-1">•</span>
                  <span>{player.title}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">{formatNumber(player.score)}</div>
                <div className="text-xs text-slate-400">
                  ELO: {player.galacticRank}
                </div>
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
