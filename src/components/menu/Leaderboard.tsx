import React, { useState, useEffect } from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Medal, Trophy } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import top 3 portraits
import PortraitIcon6 from '@/assets/images/portraits/normalMax.png'; // galactic_guardian
import PortraitIcon7 from '@/assets/images/portraits/specialMax.png'; // singularity_lord
import PortraitIcon8 from '@/assets/images/portraits/uniqueNormal.png'; // cosmic_overlord
// Import default avatar
import DefaultAvatar from '@/assets/images/icons/profile.png';

// List of player titles in ascending order of prestige
const playerTitles = [
  "Space Pilot", // Default starting title
  "Asteroid Miner",
  "Orbital Explorer",
  "Star Navigator",
  "Nebula Ranger",
  "Void Wanderer",
  "Galaxy Voyager",
  "Cosmic Pathfinder", // Top 3
  "Celestial Commander",
  "Galactic Overlord" // Most prestigious title
];

// Top 3 portraits for leaderboard
const topPortraits = [
  { value: 'galactic_guardian', image: PortraitIcon6 },
  { value: 'singularity_lord', image: PortraitIcon7 },
  { value: 'cosmic_overlord', image: PortraitIcon8 },
];

// Generate realistic player data for leaderboard
const generateLeaderboardData = () => {
  // Realistic gaming usernames
  const names = [
    "Dax", "Ralson99", "Zachy", "Írony",
    "Àkròlolz", "Se7en", "K0ALA", "Jaimë",
    "Glassl20", "Veximity"
  ];

  // Randomly shuffle names
  const shuffledNames = [...names].sort(() => 0.5 - Math.random());

  // Create leaderboard data
  const data = shuffledNames.map((username, index) => {
    // Random score between 100 trillion (1e14) and 1 quadrillion (1e15)
    const score = 1e14 + Math.random() * 9e14; // 100T to 1Q
    const level = 100; // All players at level 100

    // Randomly select one of the top 3 titles (indices 7, 8, 9)
    const topTitleIndex = Math.floor(Math.random() * 3) + 7; // 7, 8, or 9
    const title = playerTitles[topTitleIndex];

    // Randomly select one of the top 3 portraits
    const portrait = topPortraits[Math.floor(Math.random() * 3)];

    // All players have ELO 3000
    const elo = 3000;

    // Generate initials for the avatar (first two characters)
    const initials = username.substring(0, 2).toUpperCase();

    return {
      id: index + 1,
      username,
      score,
      level,
      title,
      galacticRank: elo,
      initials,
      portrait: portrait.image, // Add portrait image
    };
  });

  // Sort by score in descending order (highest score at top)
  return data.sort((a, b) => b.score - a.score);
};

const Leaderboard: React.FC = () => {
  const { state } = useGame();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  // Generate leaderboard data on component mount
  useEffect(() => {
    setLeaderboardData(generateLeaderboardData());
  }, []);

  // Simulated player position
  const playerPosition = 999; // In a real app, this would be calculated

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
              {/* Rank */}
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

              {/* Portrait and Avatar */}
              <div className="relative flex-shrink-0 mx-2 w-12 h-12">
                <Avatar className="absolute h-10 w-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001]">
                  <AvatarImage src={DefaultAvatar} alt={player.username} />
                  <AvatarFallback className="bg-indigo-700/50">
                    {player.initials}
                  </AvatarFallback>
                </Avatar>
                <img
                  src={player.portrait}
                  alt={`${player.username}'s portrait`}
                  className="absolute w-12 h-12 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10002] object-contain opacity-80 rounded-full"
                />
              </div>

              {/* Player Info */}
              <div className="ml-2 flex-grow">
                <div className="font-medium">{player.username}</div>
                <div className="text-xs text-slate-400">
                  <span>Level {player.level}</span>
                  <span className="mx-1">•</span>
                  <span>{player.title}</span>
                </div>
              </div>

              {/* Score and ELO */}
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
