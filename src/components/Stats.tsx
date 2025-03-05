
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';

const Stats: React.FC = () => {
  const { state, addCoins } = useGame();
  
  const handleAddTestCoins = () => {
    addCoins(100000);
  };
  
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Test Coins Button */}
      <div className="mb-6">
        <button
          onClick={handleAddTestCoins}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Add 100,000 Test Coins
        </button>
      </div>
      
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/40 p-4 flex flex-col gap-3">
        <h2 className="text-lg font-medium text-slate-100 mb-2">Statistics</h2>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Clicks</span>
          <span className="text-slate-100 font-medium">{formatNumber(state.totalClicks)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Earned</span>
          <span className="text-slate-100 font-medium">{formatNumber(state.totalEarned)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Coins Per Click</span>
          <span className="text-slate-100 font-medium">{formatNumber(state.coinsPerClick + 1)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Coins Per Second</span>
          <span className="text-slate-100 font-medium">{formatNumber(state.coinsPerSecond)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Prestige Count</span>
          <span className="text-slate-100 font-medium">{state.prestigeCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Skill Points</span>
          <span className="text-slate-100 font-medium">{state.skillPoints}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Income Multiplier</span>
          <span className="text-slate-100 font-medium">{state.incomeMultiplier.toFixed(2)}x</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Achievements</span>
          <span className="text-slate-100 font-medium">
            {state.achievements.filter(a => a.unlocked).length}/{state.achievements.length}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Managers Owned</span>
          <span className="text-slate-100 font-medium">
            {state.ownedManagers.length - 1}/{state.managers.length - 1}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Artifacts Owned</span>
          <span className="text-slate-100 font-medium">
            {state.ownedArtifacts.length - 1}/{state.artifacts.length - 1}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
