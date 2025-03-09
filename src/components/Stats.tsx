
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { CircleDollarSign, MousePointer, Sparkles, Gauge, Recycle } from 'lucide-react';
import { useBoostManager } from '@/hooks/useBoostManager';

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const { calculateTotalCPS } = useBoostManager();
  
  const totalCPS = calculateTotalCPS();
  
  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <div className="p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40">
        <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Game Statistics</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <CircleDollarSign size={18} className="text-yellow-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Coins</span>
            </div>
            <span className="text-lg font-bold text-yellow-300">{formatNumber(state.coins)}</span>
            <span className="text-xs text-slate-500 mt-1">Total Earned: {formatNumber(state.totalEarned)}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Gauge size={18} className="text-blue-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Mining Rate</span>
            </div>
            <span className="text-lg font-bold text-blue-300">{formatNumber(totalCPS)}/s</span>
            <span className="text-xs text-slate-500 mt-1">Passive Income</span>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <MousePointer size={18} className="text-green-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Tap Power</span>
            </div>
            <span className="text-lg font-bold text-green-300">{formatNumber(state.coinsPerClick)}</span>
            <span className="text-xs text-slate-500 mt-1">Clicks: {formatNumber(state.totalClicks)}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Sparkles size={18} className="text-purple-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Essence</span>
            </div>
            <span className="text-lg font-bold text-purple-300">{formatNumber(state.essence)}</span>
            <span className="text-xs text-slate-500 mt-1">Next: +{formatNumber(calculatePotentialEssenceReward())}</span>
          </div>
          
          <div className="col-span-2 flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Recycle size={18} className="text-indigo-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Prestige Level</span>
            </div>
            <span className="text-lg font-bold text-indigo-300">{state.prestigeCount}</span>
            <span className="text-xs text-slate-500 mt-1">Times Restarted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
