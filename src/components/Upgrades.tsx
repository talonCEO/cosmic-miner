
import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, calculateTimeToSave, calculateUpgradeProgress } from '@/utils/gameLogic';
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Atom, Battery, Bolt, Cpu, Database, Eye, FlaskConical, Flame, 
  Gem, Globe, Hammer, Lightbulb, Layers, Magnet, Monitor, Pickaxe, 
  Plane, Radiation, Shield, Sparkles, Sun, TestTube, Truck, Banknote,
  Plus, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Upgrades: React.FC = () => {
  const { state, buyUpgrade, toggleAutoBuy } = useGame();
  const { toast } = useToast();
  
  // Map of upgrade IDs to their icon components
  const iconMap: Record<string, React.ReactNode> = {
    'atom': <Atom size={20} />,
    'flask-conical': <FlaskConical size={20} />,
    'cpu': <Cpu size={20} />,
    'layers': <Layers size={20} />,
    'hammer': <Hammer size={20} />,
    'bolt': <Bolt size={20} />,
    'shield': <Shield size={20} />,
    'sparkles': <Sparkles size={20} />,
    'magnet': <Magnet size={20} />,
    'battery': <Battery size={20} />,
    'flame': <Flame size={20} />,
    'radiation': <Radiation size={20} />,
    'eye': <Eye size={20} />,
    'sun': <Sun size={20} />,
    'monitor': <Monitor size={20} />,
    'gem': <Gem size={20} />,
    'truck': <Truck size={20} />,
    'globe': <Globe size={20} />,
    'pickaxe': <Pickaxe size={20} />,
    'plane': <Plane size={20} />,
    'lightbulb': <Lightbulb size={20} />,
    'banknote': <Banknote size={20} />,
    'database': <Database size={20} />,
    'test-tube': <TestTube size={20} />
  };
  
  // Filter for unlocked upgrades
  const unlockedUpgrades = state.upgrades.filter(upgrade => upgrade.unlocked);
  
  // Sort upgrades by cost (ascending)
  const sortedUpgrades = [...unlockedUpgrades].sort((a, b) => a.baseCost - b.baseCost);

  // Handle bulk purchase with notification
  const handleBulkPurchase = (upgradeId: string, quantity: number) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    // Current level before purchase
    const beforeLevel = upgrade.level;
    
    // Attempt to buy
    buyUpgrade(upgradeId, quantity);
    
    // Check if purchase was successful by comparing levels
    setTimeout(() => {
      const afterUpgrade = state.upgrades.find(u => u.id === upgradeId);
      if (afterUpgrade && afterUpgrade.level > beforeLevel) {
        toast({
          title: `Purchased ${afterUpgrade.level - beforeLevel}x ${upgrade.name}`,
          description: `Now at level ${afterUpgrade.level}/${afterUpgrade.maxLevel}`,
          duration: 3000,
        });
      }
    }, 100);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-center">Element Mining</h2>
        
        {/* Auto Buy Toggle */}
        <button 
          onClick={toggleAutoBuy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          aria-label={state.autoBuy ? "Turn off auto buy" : "Turn on auto buy"}
        >
          <span>Auto Buy</span>
          {state.autoBuy ? 
            <ToggleRight className="text-indigo-500" size={24} /> : 
            <ToggleLeft className="text-slate-400" size={24} />
          }
        </button>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {sortedUpgrades.map((upgrade, index) => {
            const canAfford = state.coins >= upgrade.cost;
            const progress = calculateUpgradeProgress(upgrade.cost, state.coins);
            const timeToSave = calculateTimeToSave(upgrade.cost, state.coins, state.coinsPerSecond);
            const isMaxLevel = upgrade.level >= upgrade.maxLevel;
            
            return (
              <div 
                key={upgrade.id}
                className={`rounded-xl border p-4 transition-all duration-300 animate-scale-in
                  ${isMaxLevel ? 'bg-slate-700 border-slate-600 text-white' : 
                    canAfford ? 'bg-white border-indigo-500 shadow-md hover:shadow-lg hover:translate-y-[-2px]' : 
                    'bg-white border-slate-300 hover:shadow-sm'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() => !isMaxLevel && buyUpgrade(upgrade.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${canAfford ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {iconMap[upgrade.icon]}
                    </div>
                    <div>
                      <h3 className="font-medium">{upgrade.name}</h3>
                      <p className="text-xs text-slate-500">{upgrade.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${canAfford ? 'text-indigo-500' : ''}`}>
                      {isMaxLevel ? 'MAX' : formatNumber(upgrade.cost)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Level {upgrade.level}/{upgrade.maxLevel}
                    </p>
                  </div>
                </div>
                
                {!isMaxLevel && (
                  <>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Bonus and time to save */}
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>
                        {upgrade.coinsPerClickBonus > 0 && `+${formatNumber(upgrade.coinsPerClickBonus)} per tap`}
                        {upgrade.coinsPerSecondBonus > 0 && (upgrade.coinsPerClickBonus > 0 ? `, ` : '')}
                        {upgrade.coinsPerSecondBonus > 0 && `+${formatNumber(upgrade.coinsPerSecondBonus)} per sec`}
                      </span>
                      {!canAfford && <span>{timeToSave}</span>}
                    </div>
                    
                    {/* Bulk purchase buttons */}
                    <div className="flex gap-1 justify-end mt-1">
                      {[5, 10, 50, 100].map(quantity => (
                        <button
                          key={`${upgrade.id}-${quantity}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBulkPurchase(upgrade.id, quantity);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
                          title={`Buy ${quantity}`}
                        >
                          <Plus size={10} />
                          {quantity}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
          
          {sortedUpgrades.length === 0 && (
            <div className="text-center py-6 text-slate-500 animate-fade-in">
              <p>No elements discovered yet!</p>
              <p className="mt-2 text-sm">Start mining to discover elements</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {unlockedUpgrades.length === 0 && (
        <div className="text-center py-6 text-slate-500 animate-fade-in">
          <p>Tap to mine elements from the earth!</p>
        </div>
      )}
    </div>
  );
};

export default Upgrades;
