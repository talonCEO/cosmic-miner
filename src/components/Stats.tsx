
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { Sparkles, Timer, ChevronUp, BarChart, MousePointerClickIcon } from 'lucide-react';

const Stats: React.FC = () => {
  const { state, addCoins } = useGame();
  
  // Add test coins button handler
  const handleAddTestCoins = () => {
    addCoins(100000);
  };
  
  return (
    <div className="bg-slate-900/60 p-4 rounded-xl border border-indigo-500/20 backdrop-blur-sm">
      {/* Test button */}
      <div className="mb-4">
        <button 
          onClick={handleAddTestCoins}
          className="w-full py-2 px-4 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
        >
          Add 100,000 Test Coins
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart size={18} className="text-indigo-400" />
            <span className="text-white">Coins:</span>
          </div>
          <span className="text-amber-300 font-semibold">{formatNumber(state.coins)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronUp size={18} className="text-green-400" />
            <span className="text-white">Total Earned:</span>
          </div>
          <span className="text-green-300 font-semibold">{formatNumber(state.totalEarned)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointerClickIcon size={18} className="text-blue-400" />
            <span className="text-white">Coins per Click:</span>
          </div>
          <span className="text-blue-300 font-semibold">{formatNumber(state.coinsPerClick)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-yellow-400" />
            <span className="text-white">Coins per Second:</span>
          </div>
          <span className="text-yellow-300 font-semibold">{formatNumber(state.coinsPerSecond)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <span className="text-white">Essence:</span>
          </div>
          <span className="text-purple-300 font-semibold">{formatNumber(state.essence)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointerClickIcon size={18} className="text-indigo-400" />
            <span className="text-white">Total Clicks:</span>
          </div>
          <span className="text-indigo-300 font-semibold">{formatNumber(state.totalClicks)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-pink-400" />
            <span className="text-white">Prestige Count:</span>
          </div>
          <span className="text-pink-300 font-semibold">{state.prestigeCount}</span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
