import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, calculateTimeToSave, calculateUpgradeProgress } from '@/utils/gameLogic';
import { 
  Atom, Battery, Bolt, Cpu, Database, Eye, FlaskConical, Flame, 
  Gem, Globe, Hammer, Lightbulb, Layers, Magnet, Monitor, Pickaxe, 
  Plane, Radiation, Shield, Sparkles, Sun, TestTube, Truck, Banknote
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Upgrades: React.FC = () => {
  const { state, buyUpgrade, toggleAutoBuy, calculateMaxPurchaseAmount } = useGame();
  const { toast } = useToast();
  
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
  
  const unlockedUpgrades = state.upgrades.filter(upgrade => upgrade.unlocked);
  const sortedUpgrades = [...unlockedUpgrades].sort((a, b) => a.baseCost - b.baseCost);

  const handleBulkPurchase = (upgradeId: string, quantity: number) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const beforeLevel = upgrade.level;
    
    buyUpgrade(upgradeId, quantity);
    
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
  
  const handleMaxPurchase = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const maxAmount = calculateMaxPurchaseAmount(upgradeId);
    if (maxAmount > 0) {
      handleBulkPurchase(upgradeId, maxAmount);
    }
  };

  const handleUpgradeClick = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel || state.coins < upgrade.cost) return;
    
    handleBulkPurchase(upgradeId, 1);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-slate-100">Element Mining</h2>
        <button
          onClick={toggleAutoBuy}
          className={`text-sm px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all
            ${state.autoBuy 
              ? 'bg-indigo-600/60 text-white font-medium' 
              : 'bg-slate-800/40 text-slate-400 opacity-70'}`}
        >
          Auto Buy
        </button>
      </div>
      
      <div className="space-y-4">
        {sortedUpgrades.map((upgrade, index) => {
          const canAfford = state.coins >= upgrade.cost;
          const progress = calculateUpgradeProgress(upgrade.cost, state.coins);
          const timeToSave = calculateTimeToSave(upgrade.cost, state.coins, state.coinsPerSecond);
          const isMaxLevel = upgrade.level >= upgrade.maxLevel;
          
          const profitPerSecond = upgrade.coinsPerSecondBonus;
          const ROI = profitPerSecond > 0 ? upgrade.cost / profitPerSecond : Infinity;
          const isGoodValue = ROI < 100;
          
          return (
            <div 
              key={upgrade.id}
              onClick={() => handleUpgradeClick(upgrade.id)}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border 
                ${isMaxLevel ? 'border-slate-600' : canAfford 
                  ? (isGoodValue ? 'border-green-500/40' : 'border-indigo-500/40') 
                  : 'border-slate-700/40'} 
                p-4 flex items-start gap-4 transition-all
                ${!isMaxLevel ? (canAfford ? 'hover:shadow-md hover:shadow-indigo-500/20 cursor-pointer' : '') : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className="h-16 w-16 rounded-xl border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <div className={`flex items-center justify-center w-full h-full rounded-xl bg-indigo-900/50 text-indigo-300`}>
                  {iconMap[upgrade.icon]}
                </div>
                <AvatarFallback className="bg-indigo-900/50 text-indigo-300 rounded-xl">
                  {upgrade.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100">{upgrade.name}</h3>
                  <div className="text-right">
                    <p className={`font-medium ${canAfford 
                      ? (isGoodValue ? 'text-green-500' : 'text-indigo-500') 
                      : 'text-slate-400'}`}>
                      {isMaxLevel ? 'MAX' : formatNumber(upgrade.cost)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Level {upgrade.level}/{upgrade.maxLevel}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-1">{upgrade.description}</p>
                
                {!isMaxLevel && (
                  <>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 my-2">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isGoodValue ? 'bg-green-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className={isGoodValue ? 'text-green-400' : 'text-indigo-400'}>
                        {upgrade.coinsPerSecondBonus > 0 && `+${formatNumber(upgrade.coinsPerSecondBonus)} per sec`}
                      </span>
                      {!canAfford && <span className="text-slate-400">{timeToSave}</span>}
                    </div>
                    
                    <div className="flex gap-1 justify-end mt-2">
                      {[1, 10, 50, 100].map(quantity => (
                        <button
                          key={`${upgrade.id}-${quantity}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBulkPurchase(upgrade.id, quantity);
                          }}
                          className="px-2 py-0.5 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs font-medium transition-colors"
                          title={`Buy ${quantity}`}
                        >
                          {quantity}
                        </button>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMaxPurchase(upgrade.id);
                        }}
                        className="px-2 py-0.5 bg-indigo-700/50 hover:bg-indigo-600/50 rounded text-xs font-medium transition-colors"
                        title="Buy maximum affordable amount"
                      >
                        MAX
                      </button>
                    </div>
                  </>
                )}
              </div>
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
    </div>
  );
};

export default Upgrades;
