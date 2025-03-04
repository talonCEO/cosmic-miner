
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, calculateTimeToSave, calculateUpgradeProgress } from '@/utils/gameLogic';
import { Zap, MousePointerClick, Timer, Percent } from 'lucide-react';

const Upgrades: React.FC = () => {
  const { state, buyUpgrade } = useGame();
  
  // Map of upgrade IDs to their icon components
  const iconMap: Record<string, React.ReactNode> = {
    'click-power': <MousePointerClick size={20} />,
    'auto-clicker': <Timer size={20} />,
    'efficiency': <Zap size={20} />,
    'multiplier': <Percent size={20} />
  };
  
  // Filter for unlocked upgrades
  const unlockedUpgrades = state.upgrades.filter(upgrade => upgrade.unlocked);

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center">Upgrades</h2>
      
      <div className="space-y-3">
        {unlockedUpgrades.map((upgrade, index) => {
          const canAfford = state.coins >= upgrade.cost;
          const progress = calculateUpgradeProgress(upgrade.cost, state.coins);
          const timeToSave = calculateTimeToSave(upgrade.cost, state.coins, state.coinsPerSecond);
          const isMaxLevel = upgrade.level >= upgrade.maxLevel;
          
          return (
            <div 
              key={upgrade.id}
              className={`rounded-xl border p-4 transition-all duration-300 animate-scale-in
                ${isMaxLevel ? 'bg-game-secondary border-game-upgrade-border' : 
                  canAfford ? 'bg-white border-game-accent shadow-md cursor-pointer hover:shadow-lg hover:translate-y-[-2px]' : 
                  'bg-white border-game-upgrade-border cursor-pointer hover:shadow-sm'}`}
              onClick={() => !isMaxLevel && buyUpgrade(upgrade.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${canAfford ? 'bg-game-accent text-white' : 'bg-game-secondary text-game-text-secondary'}`}>
                    {iconMap[upgrade.id]}
                  </div>
                  <div>
                    <h3 className="font-medium">{upgrade.name}</h3>
                    <p className="text-xs text-game-text-secondary">{upgrade.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${canAfford ? 'text-game-accent' : ''}`}>
                    {isMaxLevel ? 'MAX' : formatNumber(upgrade.cost)}
                  </p>
                  <p className="text-xs text-game-text-secondary">
                    Level {upgrade.level}/{upgrade.maxLevel}
                  </p>
                </div>
              </div>
              
              {!isMaxLevel && (
                <>
                  {/* Progress bar */}
                  <div className="w-full bg-game-secondary rounded-full h-1.5 mb-1">
                    <div 
                      className="bg-game-accent h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  {/* Bonus and time to save */}
                  <div className="flex justify-between text-xs text-game-text-secondary">
                    <span>
                      {upgrade.coinsPerClickBonus > 0 && `+${upgrade.coinsPerClickBonus} per tap`}
                      {upgrade.coinsPerSecondBonus > 0 && (upgrade.coinsPerClickBonus > 0 ? `, ` : '')}
                      {upgrade.coinsPerSecondBonus > 0 && `+${upgrade.coinsPerSecondBonus} per sec`}
                    </span>
                    {!canAfford && <span>{timeToSave}</span>}
                  </div>
                </>
              )}
            </div>
          );
        })}
        
        {unlockedUpgrades.length === 0 && (
          <div className="text-center py-6 text-game-text-secondary animate-fade-in">
            <p>Tap to earn coins and unlock upgrades!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upgrades;
