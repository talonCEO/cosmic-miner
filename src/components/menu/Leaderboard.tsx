import React from 'react';
import { DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Medal, Trophy } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';

// Import top 3 portraits
import PortraitIcon6 from '@/assets/images/portraits/specialMax.png'; // galactic_guardian
import PortraitIcon7 from '@/assets/images/portraits/uniqueNormal.png'; // singularity_lord
import PortraitIcon8 from '@/assets/images/portraits/love.png'; // cosmic_overlord

// Hardcoded leaderboard data
const leaderboardData = [
  {
    id: 1,
    username: "Dax",
    title: "Cosmic Sugar Daddy",
    portrait: PortraitIcon8,
    score: 5.25e24, // 5.25 septillion
    level: 100,
    elo: 3050,
    initials: "DA",
  },
  {
    id: 2,
    username: "Ralson99",
    title: "Supreme Leader'",
    portrait: PortraitIcon7,
    score: 5.15e24, // 5.15 septillion
    level: 100,
    elo: 3020,
    initials: "RA",
  },
  {
    id: 3,
    username: "Zachy",
    title: "Essence Paragon",
    portrait: PortraitIcon6,
    score: 5.1e24, // 5.1 septillion
    level: 100,
    elo: 3000,
    initials: "ZA",
  },
  {
    id: 4,
    username: "Írony",
    title: "Cosmic Sugar Daddy",
    portrait: PortraitIcon8,
    score: 5.05e24, // 5.05 septillion
    level: 100,
    elo: 2980,
    initials: "ÍR",
  },
  {
    id: 5,
    username: "Àkròlolz",
    title: "Supreme Leader'",
    portrait: PortraitIcon7,
    score: 5e24, // 5 septillion
    level: 100,
    elo: 2970,
    initials: "ÀK",
  },
  {
    id: 6,
    username: "Se7en",
    title: "Essence Paragon",
    portrait: PortraitIcon6,
    score: 4.95e24, // 4.95 septillion
    level: 100,
    elo: 2965,
    initials: "SE",
  },
  {
    id: 7,
    username: "K0ALA",
    title: "Cosmic Sugar Daddy",
    portrait: PortraitIcon8,
    score: 4.9e24, // 4.9 septillion
    level: 100,
    elo: 2960,
    initials: "K0",
  },
  {
    id: 8,
    username: "Jaimë",
    title: "Supreme Leader'",
    portrait: PortraitIcon7,
    score: 4.85e24, // 4.85 septillion
    level: 100,
    elo: 2955,
    initials: "JA",
  },
  {
    id: 9,
    username: "Glassl20",
    title: "Essence Paragon",
    portrait: PortraitIcon6,
    score: 4.8e24, // 4.8 septillion
    level: 100,
    elo: 2952,
    initials: "GL",
  },
  {
    id: 10,
    username: "Veximity",
    title: "Cosmic Sugar Daddy",
    portrait: PortraitIcon8,
    score: 4.75e24, // 4.75 septillion
    level: 100,
    elo: 2950,
    initials: "VE",
  },
];

const Leaderboard: React.FC = () => {
  const { state } = useGame();

  // Simulated player position (fixed for consistency)
  const playerPosition = 999;

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
                <div className="absolute h-10 w-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001] bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">?</span>
                </div>
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
                  ELO: {player.elo}
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