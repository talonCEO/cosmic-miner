
import React from 'react';
import { Trophy, Zap, Gem, Sparkles, Brain, Star } from 'lucide-react';
import { formatNumber } from '@/utils/gameLogic';

interface PlayerRankingsProps {
  rank: string;
  level: number;
  leaderboardRank: number;
  totalCoins: number;
  totalGems: number;
  totalEssence: number;
  totalAbilityPoints: number;
  mmr: number;
}

const PlayerRankings: React.FC<PlayerRankingsProps> = ({
  rank,
  level,
  leaderboardRank,
  totalCoins,
  totalGems,
  totalEssence,
  totalAbilityPoints,
  mmr
}) => {
  return (
    <div className="bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30">
      <h3 className="text-sm font-semibold text-center border-b border-indigo-500/30 pb-2 mb-3">Player Rankings</h3>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Rank */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium">Rank:</span>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
              {rank}
            </div>
          </div>
          
          {/* Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium">Level:</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {level}
            </span>
          </div>
          
          {/* Leaderboard Rank */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium">Leaderboard:</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {leaderboardRank > 0 ? `#${leaderboardRank}` : 'Unranked'}
            </span>
          </div>
          
          {/* MMR */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-medium">MMR:</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {formatNumber(mmr)}
            </span>
          </div>
        </div>
        
        {/* Right Column - Game Stats */}
        <div className="space-y-3">
          {/* Total Coins */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium">Total Coins:</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {formatNumber(totalCoins)}
            </span>
          </div>
          
          {/* Total Gems */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Gem className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-medium">Total Gems:</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {formatNumber(totalGems)}
            </span>
          </div>
          
          {/* Total Essence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium">Total Essence:</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {formatNumber(totalEssence)}
            </span>
          </div>
          
          {/* Total Ability Points */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-green-400" />
              <span className="text-xs font-medium">Ability Points:</span>
            </div>
            <span className="text-white text-xs font-semibold">
              {formatNumber(totalAbilityPoints)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerRankings;
