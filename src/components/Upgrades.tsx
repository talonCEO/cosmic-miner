import React from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, calculateTimeToSave, calculateUpgradeProgress } from '@/utils/gameLogic';
import { isGoodValue } from '@/utils/GameMechanics';
import { 
  Atom, Battery, Bolt, Cpu, Database, Eye, FlaskConical, Flame, 
  Gem, Globe, Hammer, Lightbulb, Layers, Magnet, Monitor, Pickaxe, 
  Plane, Radiation, Shield, Sparkles, Sun, TestTube, Truck, Banknote, Hand, Lock
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as GameMechanics from '@/utils/GameMechanics';

const Upgrades: React.FC = () => {
  const { state, buyUpgrade, toggleAutoBuy, calculateMaxPurchaseAmount } = useGame();
  const { toast } = useToast();
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const iconMap: Record<string, React.ReactNode> = {
    'atom': <Atom size={20} />, 'flask-conical': <FlaskConical size={20} />, 'cpu': <Cpu size={20} />,
    'layers': <Layers size={20} />, 'hammer': <Hammer size={20} />, 'bolt': <Bolt size={20} />,
    'shield': <Shield size={20} />, 'sparkles': <Sparkles size={20} />, 'magnet': <Magnet size={20} />,
    'battery': <Battery size={20} />, 'flame': <Flame size={20} />, 'radiation': <Radiation size={20} />,
    'eye': <Eye size={20} />, 'sun': <Sun size={20} />, 'monitor': <Monitor size={20} />,
    'gem': <Gem size={20} />, 'truck': <Truck size={20} />, 'globe': <Globe size={20} />,
    'pickaxe': <Pickaxe size={20} />, 'plane': <Plane size={20} />, 'lightbulb': <Lightbulb size={20} />,
    'banknote': <Banknote size={20} />, 'database': <Database size={20} />, 'test-tube': <TestTube size={20} />,
    'hand': <Hand size={20} />, 'lock': <Lock size={20} />,
  };
  
  const isAutoBuyUnlocked = state.boosts["boost-auto-buy"]?.purchased > 0;
  const unlockedUpgrades = state.upgrades.filter(upgrade => upgrade.unlocked);
  const elementUpgrades = unlockedUpgrades.filter(u => u.category === UPGRADE_CATEGORIES.ELEMENT);
  const tapUpgrades = unlockedUpgrades.filter(u => u.category === UPGRADE_CATEGORIES.TAP);
  const sortedElementUpgrades = [...elementUpgrades].sort((a, b) => a.baseCost - b.baseCost);
  const sortedUpgrades = [...sortedElementUpgrades, ...tapUpgrades];

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
    if (maxAmount > 0) handleBulkPurchase(upgradeId, maxAmount);
  };

  const handleUpgradeClick = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel || state.coins < upgrade.cost) return;
    handleBulkPurchase(upgradeId, 1);
  };
  
  const handleAutoBuyClick = () => {
    if (isAutoBuyUnlocked) {
      toggleAutoBuy();
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 8000);
    }
  };

  const handleBuyMostExpensive = () => {
    const affordableUpgrades = sortedUpgrades
      .filter(u => u.level < u.maxLevel && state.coins >= u.cost)
      .sort((a, b) => b.cost - a.cost);
    if (affordableUpgrades.length > 0) {
      const mostExpensive = affordableUpgrades[0];
      handleBulkPurchase(mostExpensive.id, 1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-slate-100">Element Mining</h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip open={showTooltip}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleAutoBuyClick}
                  className={`text-sm px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all
                    ${isAutoBuyUnlocked 
                      ? (state.autoBuy ? 'bg-indigo-600/60 text-white font-medium' : 'bg-slate-800/40 text-slate-400 opacity-70')
                      : 'bg-slate-800/40 text-slate-500 opacity-50 cursor-not-allowed'}`}
                >
                  {isAutoBuyUnlocked ? "Auto Buy" : (
                    <div className="flex items-center gap-1">
                      <Lock size={14} />
                      <span>Auto Buy</span>
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" align="start" className="bg-slate-800 text-white border-slate-700 p-3 max-w-[200px] break-words">
                <p>Purchase Auto Buy from the Premium Store to unlock</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            onClick={handleBuyMostExpensive}
            className="text-sm px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-slate-800/40 text-slate-400 hover:bg-indigo-600/60 hover:text-white transition-all"
          >
            Buy
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedUpgrades.map((upgrade, index) => {
          const canAfford = state.coins >= upgrade.cost;
          const progress = calculateUpgradeProgress(upgrade.cost, state.coins);
          const timeToSave = calculateTimeToSave(upgrade.cost, state.coins, state.coinsPerSecond);
          const isMaxLevel = upgrade.level >= upgrade.maxLevel;
          const isTapUpgrade = upgrade.category === UPGRADE_CATEGORIES.TAP;
          let profitPerSecond = upgrade.coinsPerSecondBonus;
          let isUpgradeGoodValue = isGoodValue(upgrade.cost, profitPerSecond);
          let upgradeDescription = upgrade.description;
          let bonusText = isTapUpgrade 
            ? `+${(upgrade.level * upgrade.coinsPerClickBonus * 100).toFixed(0)}% tap power` 
            : `+${formatNumber(upgrade.coinsPerSecondBonus)} per sec`;
          if (isTapUpgrade) isUpgradeGoodValue = true;

          // Calculate total passive income and boost percentage for element upgrades
          const boostMultiplier = isTapUpgrade ? 0 : GameMechanics.getLevelBoostMultiplier(upgrade.level);
          const totalPassiveIncome = isTapUpgrade ? 0 : upgrade.coinsPerSecondBonus * upgrade.level * (1 + boostMultiplier);
          const boostPercentage = isTapUpgrade ? 0 : boostMultiplier * 100;

          // Progress meter logic
          const thresholds = [5, 10, 25, 50, 100, 200, 300, 500, 750, 1000];
          const currentThresholdIndex = thresholds.findIndex(t => upgrade.level < t) - 1;
          const nextThreshold = thresholds[currentThresholdIndex + 1] || 1000;
          const prevThreshold = thresholds[currentThresholdIndex] || 0;
          const progressToNext = ((upgrade.level - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
          const glowIntensity = Math.min(currentThresholdIndex + 1, 10) * 0.1;

          return (
            <div 
              key={upgrade.id}
              onClick={() => handleUpgradeClick(upgrade.id)}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border 
                ${isMaxLevel ? 'border-slate-600' : canAfford 
                  ? (isUpgradeGoodValue ? 'border-green-500/40' : 'border-indigo-500/40') 
                  : 'border-slate-700/40'} 
                p-4 flex items-start gap-4 transition-all relative
                ${isTapUpgrade ? 'bg-slate-800/60 border-amber-500/40' : ''}
                ${!isMaxLevel && canAfford ? 'hover:shadow-md hover:shadow-indigo-500/20 cursor-pointer' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center">
                <Avatar className={`h-16 w-16 rounded-xl border-2 ${isTapUpgrade ? 'border-amber-500/50' : 'border-indigo-500/30'} shadow-lg ${isTapUpgrade ? 'shadow-amber-500/20' : 'shadow-indigo-500/10'}`}>
                  <div className={`flex items-center justify-center w-full h-full rounded-xl ${isTapUpgrade ? 'bg-amber-900/50 text-amber-300' : 'bg-indigo-900/50 text-indigo-300'}`}>
                    {iconMap[upgrade.icon]}
                  </div>
                  <AvatarFallback className={`${isTapUpgrade ? 'bg-amber-900/50 text-amber-300' : 'bg-indigo-900/50 text-indigo-300'} rounded-xl`}>
                    {upgrade.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center text-xs mt-2">
                  <p className={isTapUpgrade ? 'text-amber-400' : 'text-indigo-400'}>+{bonusText}/s</p>
                  {!isTapUpgrade && (
                    <>
                      <p className="text-indigo-300">+{formatNumber(totalPassiveIncome)}/s</p>
                      <p className="text-indigo-200">+{boostPercentage.toFixed(0)}%</p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold ${isTapUpgrade ? 'text-amber-100' : 'text-slate-100'}`}>{upgrade.name}</h3>
                  <div className="text-right">
                    <p className={`font-medium ${canAfford ? (isTapUpgrade ? 'text-amber-500' : (isUpgradeGoodValue ? 'text-green-500' : 'text-indigo-500')) : 'text-slate-400'}`}>
                      {isMaxLevel ? 'MAX' : formatNumber(upgrade.cost)}
                    </p>
                    <p className="text-xs text-slate-500">Level {upgrade.level}/{upgrade.maxLevel}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-1">{upgradeDescription}</p>
                
                {!isMaxLevel && (
                  <>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 my-2">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${isTapUpgrade ? 'bg-amber-500' : (isUpgradeGoodValue ? 'bg-green-500' : 'bg-indigo-500')}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="text-slate-400">{timeToSave}</span>
                    </div>
                    <div className="flex gap-1 justify-end mt-2">
                      {[1, 10, 50, 100].map(quantity => (
                        <button
                          key={`${upgrade.id}-${quantity}`}
                          onClick={(e) => { e.stopPropagation(); handleBulkPurchase(upgrade.id, quantity); }}
                          className="px-2 py-0.5 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs font-medium transition-colors"
                          title={`Buy ${quantity}`}
                        >
                          {quantity}
                        </button>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMaxPurchase(upgrade.id); }}
                        className={`px-2 py-0.5 ${isTapUpgrade ? 'bg-amber-700/50 hover:bg-amber-600/50' : 'bg-indigo-700/50 hover:bg-indigo-600/50'} rounded text-xs font-medium transition-colors`}
                        title="Buy maximum affordable amount"
                      >
                        MAX
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Progress Meter */}
              <div className="absolute right-2 top-4 bottom-4 w-2 rounded-full bg-slate-900/50 overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full transition-all duration-500 ease-out ${isTapUpgrade ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{
                    height: `${progressToNext}%`,
                    boxShadow: `0 0 ${10 * glowIntensity}px ${5 * glowIntensity}px ${isTapUpgrade ? 'rgba(251, 191, 36, 0.8)' : 'rgba(99, 102, 241, 0.8)'}`,
                  }}
                ></div>
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
