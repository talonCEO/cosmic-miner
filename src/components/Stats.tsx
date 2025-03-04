
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';

const Stats: React.FC = () => {
  const { state } = useGame();
  
  const stats = [
    { label: 'Total Taps', value: formatNumber(state.totalClicks) },
    { label: 'Total Earned', value: formatNumber(state.totalEarned) },
    { label: 'Coins per Tap', value: formatNumber(state.coinsPerClick) },
    { label: 'Coins per Second', value: formatNumber(state.coinsPerSecond) }
  ];
  
  return (
    <div className="w-full mb-8 max-w-md mx-auto">
      <h2 className="text-lg font-medium mb-4 text-center text-white">Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-game-upgrade-bg rounded-xl p-4 shadow-sm border border-game-upgrade-border card-hover animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <p className="text-sm text-slate-300 mb-1">{stat.label}</p>
            <p className="text-lg font-medium text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
