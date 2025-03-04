
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, calculateTimeToSave, calculateUpgradeProgress } from '@/utils/gameLogic';
import { MousePointerClick, Timer, Zap, Percent, Star, Award, Bolt, Heart, Target, 
  TrendingUp, Rocket, Cpu, Server, BarChart, DollarSign, Infinity, Gift, Layers, 
  Database, Briefcase, Globe, Key, Shield, Gem, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UPGRADE_CATEGORIES } from '@/utils/upgradesData';

const Upgrades: React.FC = () => {
  const { state, buyUpgrade } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Map of upgrade IDs to their icon components
  const iconMap: Record<string, React.ReactNode> = {
    'mouse-pointer-click': <MousePointerClick size={20} />,
    'timer': <Timer size={20} />,
    'zap': <Zap size={20} />,
    'percent': <Percent size={20} />,
    'gem': <Gem size={20} />,
    'star': <Star size={20} />,
    'award': <Award size={20} />,
    'bolt': <Bolt size={20} />,
    'heart': <Heart size={20} />,
    'target': <Target size={20} />,
    'trending-up': <TrendingUp size={20} />,
    'rocket': <Rocket size={20} />,
    'cpu': <Cpu size={20} />,
    'server': <Server size={20} />,
    'bar-chart': <BarChart size={20} />,
    'dollar-sign': <DollarSign size={20} />,
    'infinity': <Infinity size={20} />,
    'gift': <Gift size={20} />,
    'layers': <Layers size={20} />,
    'database': <Database size={20} />,
    'briefcase': <Briefcase size={20} />,
    'globe': <Globe size={20} />,
    'key': <Key size={20} />,
    'shield': <Shield size={20} />,
    'sparkles': <Sparkles size={20} />
  };
  
  // Filter for unlocked upgrades
  const unlockedUpgrades = state.upgrades.filter(upgrade => upgrade.unlocked);
  
  // Filter by category if not 'all'
  const filteredUpgrades = selectedCategory === 'all' 
    ? unlockedUpgrades 
    : unlockedUpgrades.filter(upgrade => upgrade.category === selectedCategory);

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center">Upgrades</h2>
      
      <Tabs defaultValue="all" className="w-full mb-4">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
          <TabsTrigger value={UPGRADE_CATEGORIES.CLICK} onClick={() => setSelectedCategory(UPGRADE_CATEGORIES.CLICK)}>Tap</TabsTrigger>
          <TabsTrigger value={UPGRADE_CATEGORIES.PASSIVE} onClick={() => setSelectedCategory(UPGRADE_CATEGORIES.PASSIVE)}>Auto</TabsTrigger>
          <TabsTrigger value={UPGRADE_CATEGORIES.MULTIPLIER} onClick={() => setSelectedCategory(UPGRADE_CATEGORIES.MULTIPLIER)}>Multi</TabsTrigger>
          <TabsTrigger value={UPGRADE_CATEGORIES.SPECIAL} onClick={() => setSelectedCategory(UPGRADE_CATEGORIES.SPECIAL)}>Special</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedCategory} className="mt-0">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredUpgrades.map((upgrade, index) => {
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
                          {iconMap[upgrade.icon]}
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
                            {upgrade.coinsPerClickBonus > 0 && `+${formatNumber(upgrade.coinsPerClickBonus)} per tap`}
                            {upgrade.coinsPerSecondBonus > 0 && (upgrade.coinsPerClickBonus > 0 ? `, ` : '')}
                            {upgrade.coinsPerSecondBonus > 0 && `+${formatNumber(upgrade.coinsPerSecondBonus)} per sec`}
                            {upgrade.multiplierBonus > 0 && ((upgrade.coinsPerClickBonus > 0 || upgrade.coinsPerSecondBonus > 0) ? `, ` : '')}
                            {upgrade.multiplierBonus > 0 && `+${upgrade.multiplierBonus * 100}% boost`}
                          </span>
                          {!canAfford && <span>{timeToSave}</span>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {filteredUpgrades.length === 0 && (
                <div className="text-center py-6 text-game-text-secondary animate-fade-in">
                  <p>No upgrades available in this category yet!</p>
                  <p className="mt-2 text-sm">Keep tapping to unlock more.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {unlockedUpgrades.length === 0 && (
        <div className="text-center py-6 text-game-text-secondary animate-fade-in">
          <p>Tap to earn coins and unlock upgrades!</p>
        </div>
      )}
    </div>
  );
};

export default Upgrades;
