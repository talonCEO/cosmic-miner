import React, { useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber, calculateTimeToSave, calculateUpgradeProgress } from '@/utils/gameLogic';
import { isGoodValue } from '@/utils/GameMechanics';
import {
  Activity, AlertTriangle, Anchor, Anvil, Atom, Award, Banknote, Battery, BatteryCharging, Beaker,
  Bolt, Box, Car, Cloud, CloudRain, Compass, Cpu, Crown, Database, Diamond,
  Droplet, Droplets, Eye, Flame, Gauge, Gem, Hand, HardDrive, Lightbulb, Lock,
  Magnet, Monitor, Package, Paintbrush, Pickaxe, Plane, Plug, Radiation, Search, Server,
  Shield, ShieldCheck, Sparkles, Star, Sun, TestTube, Thermometer, Truck, Weight, Wind,
  Wrench, Zap, ZapOff
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UPGRADE_CATEGORIES } from '@/utils/upgradesData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as GameMechanics from '@/utils/GameMechanics';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

// Particle Configuration
const particleOptions = {
  particles: {
    number: { value: 15, density: { enable: true, value_area: 800 } },
    color: { value: '#818cf8' }, // indigo-300
    shape: { type: 'circle' },
    opacity: { value: 0.8, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
    size: { value: 6, random: true, anim: { enable: true, speed: 2, size_min: 2 } },
    move: {
      enable: true,
      speed: 4,
      direction: 'none' as const,
      random: true,
      straight: false,
      out_mode: 'out' as const,
      bounce: false,
    },
  },
  interactivity: {
    events: { onhover: { enable: false }, onclick: { enable: false } },
  },
  retina_detect: true,
};

const Upgrades: React.FC = () => {
  const { state, buyUpgrade, toggleAutoBuy, calculateMaxPurchaseAmount } = useGame();
  const { toast } = useToast();
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [particleTriggers, setParticleTriggers] = React.useState<Record<string, boolean>>({});

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const iconMap: Record<string, React.ReactNode> = {
    'cloud': <Cloud size={20} />,
    'diamond': <Diamond size={20} />,
    'wind': <Wind size={20} />,
    'cloud-rain': <CloudRain size={20} />,
    'cpu': <Cpu size={20} />,
    'box': <Box size={20} />,
    'anvil': <Anvil size={20} />,
    'zap': <Zap size={20} />,
    'droplet': <Droplet size={20} />,
    'package': <Package size={20} />,
    'shield-check': <ShieldCheck size={20} />,
    'paintbrush': <Paintbrush size={20} />,
    'wrench': <Wrench size={20} />,
    'magnet': <Magnet size={20} />,
    'battery-charging': <BatteryCharging size={20} />,
    'thermometer': <Thermometer size={20} />,
    'star': <Star size={20} />,
    'flame': <Flame size={20} />,
    'weight': <Weight size={20} />,
    'radiation': <Radiation size={20} />,
    'battery': <Battery size={20} />,
    'compass': <Compass size={20} />,
    'eye': <Eye size={20} />,
    'sun': <Sun size={20} />,
    'monitor': <Monitor size={20} />,
    'zap-off': <ZapOff size={20} />,
    'gem': <Gem size={20} />,
    'plug': <Plug size={20} />,
    'car': <Car size={20} />,
    'truck': <Truck size={20} />,
    'shield': <Shield size={20} />,
    'crown': <Crown size={20} />,
    'award': <Award size={20} />,
    'pickaxe': <Pickaxe size={20} />,
    'anchor': <Anchor size={20} />,
    'plane': <Plane size={20} />,
    'lightbulb': <Lightbulb size={20} />,
    'banknote': <Banknote size={20} />,
    'server': <Server size={20} />,
    'database': <Database size={20} />,
    'alert-triangle': <AlertTriangle size={20} />,
    'activity': <Activity size={20} />,
    'beaker': <Beaker size={20} />,
    'search': <Search size={20} />,
    'gauge': <Gauge size={20} />,
    'hard-drive': <HardDrive size={20} />,
    'test-tube': <TestTube size={20} />,
    'droplets': <Droplets size={20} />,
    'atom': <Atom size={20} />,
    'sparkles': <Sparkles size={20} />,
    'hand': <Hand size={20} />,
    'lock': <Lock size={20} />,
  };
  
  const isAutoBuyUnlocked = state.boosts["boost-auto-buy"]?.purchased > 0;
  const unlockedUpgrades = state.upgrades.filter(upgrade => upgrade.unlocked);
  const elementUpgrades = unlockedUpgrades.filter(u => u.category === UPGRADE_CATEGORIES.ELEMENT);
  const tapUpgrades = unlockedUpgrades.filter(u => u.category === UPGRADE_CATEGORIES.TAP);
  
  const sortedUpgrades = [
    ...[...elementUpgrades].sort((a, b) => (a.level >= a.maxLevel ? 1 : b.level >= b.maxLevel ? -1 : a.baseCost - b.baseCost)),
    ...[...tapUpgrades].sort((a, b) => (a.level >= a.maxLevel ? 1 : b.level >= b.maxLevel ? -1 : a.baseCost - b.baseCost)),
  ];

  const handleBulkPurchase = (upgradeId: string, quantity: number) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const beforeLevel = upgrade.level;
    buyUpgrade(upgradeId, quantity);
    const afterUpgrade = state.upgrades.find(u => u.id === upgradeId);
    if (afterUpgrade && afterUpgrade.level > beforeLevel) {
      const triggerKey = `${upgradeId}-${quantity}`;
      setParticleTriggers(prev => ({ ...prev, [triggerKey]: true }));
      setTimeout(() => setParticleTriggers(prev => ({ ...prev, [triggerKey]: false })), 1000); // 1s duration
      toast({
        title: `Purchased ${afterUpgrade.level - beforeLevel}x ${upgrade.name}`,
        description: `Now at level ${afterUpgrade.level}/${afterUpgrade.maxLevel}`,
        duration: 3000,
      });
    }
  };

  const handleMaxPurchase = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const maxAmount = calculateMaxPurchaseAmount(upgradeId);
    if (maxAmount > 0) handleBulkPurchase(upgradeId, maxAmount);
  };

  const handleUpgradeClick = (upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return;
    const currentCost = GameMechanics.calculateUpgradeCost(state, upgradeId, 1);
    if (state.coins < currentCost) return;
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
      .filter(u => u.level < u.maxLevel && state.coins >= GameMechanics.calculateUpgradeCost(state, u.id, 1))
      .sort((a, b) => GameMechanics.calculateUpgradeCost(state, b.id, 1) - GameMechanics.calculateUpgradeCost(state, a.id, 1));
    if (affordableUpgrades.length > 0) {
      const mostExpensive = affordableUpgrades[0];
      handleBulkPurchase(mostExpensive.id, 1);
      setParticleTriggers(prev => ({ ...prev, 'most-expensive': true }));
      setTimeout(() => setParticleTriggers(prev => ({ ...prev, 'most-expensive': false })), 1000); // 1s duration
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
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
          <div className="relative">
            <button
              onClick={handleBuyMostExpensive}
              className="relative text-sm px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-slate-800/40 text-slate-400 hover:bg-indigo-600/60 hover:text-white transition-all z-0"
            >
              Buy
            </button>
            {particleTriggers['most-expensive'] && (
              <Particles
                id="buy-most-expensive-particles"
                init={particlesInit}
                options={{
                  ...particleOptions,
                  particles: { ...particleOptions.particles, color: { value: '#818cf8' } }, // indigo-300
                }}
                className="absolute inset-0 pointer-events-none z-10"
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedUpgrades.map((upgrade, index) => {
          const currentCost = GameMechanics.calculateUpgradeCost(state, upgrade.id, 1);
          const canAfford = state.coins >= currentCost;
          const progress = calculateUpgradeProgress(currentCost, state.coins);
          const timeToSave = calculateTimeToSave(currentCost, state.coins, state.coinsPerSecond);
          const isMaxLevel = upgrade.level >= upgrade.maxLevel;
          const isTapUpgrade = upgrade.category === UPGRADE_CATEGORIES.TAP;
          let profitPerSecond = upgrade.coinsPerSecondBonus;
          let isUpgradeGoodValue = isGoodValue(currentCost, profitPerSecond);
          let upgradeDescription = upgrade.description;
          let bonusText = isTapUpgrade 
            ? `+${(upgrade.level * upgrade.coinsPerClickBonus * 100).toFixed(0)}% tap power` 
            : `+${formatNumber(upgrade.coinsPerSecondBonus)} per sec`;
          if (isTapUpgrade) isUpgradeGoodValue = true;

          const boostMultiplier = isTapUpgrade ? 0 : GameMechanics.getLevelBoostMultiplier(upgrade.level);
          const totalPassiveIncome = isTapUpgrade ? 0 : upgrade.coinsPerSecondBonus * upgrade.level * (1 + boostMultiplier);
          const boostPercentage = isTapUpgrade ? 0 : boostMultiplier * 100;

          const thresholds = [5, 10, 25, 50, 100, 200, 300, 500, 750, 1000];
          const currentThresholdIndex = thresholds.findIndex(t => upgrade.level < t) - 1;
          const nextThreshold = thresholds[currentThresholdIndex + 1] || 1000;
          const prevThreshold = thresholds[currentThresholdIndex] || 0;
          const progressToNext = ((upgrade.level - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
          const segments = 8;
          const filledSegments = Math.floor((progressToNext / 100) * segments);

          // Glow logic: Element upgrades -> purple, Tap upgrades -> amber
          const glowIntensity = Math.min(upgrade.level / 500, 1);
          let glowStyle = {};
          if (isTapUpgrade) {
            const glowColorStart = [251, 191, 36]; // amber-500
            const glowColorEnd = [251, 146, 60]; // amber-400
            const r = Math.round(glowColorStart[0] + (glowColorEnd[0] - glowColorStart[0]) * glowIntensity);
            const g = Math.round(glowColorStart[1] + (glowColorEnd[1] - glowColorStart[1]) * glowIntensity);
            const b = Math.round(glowColorStart[2] + (glowColorEnd[2] - glowColorStart[2]) * glowIntensity);
            glowStyle = {
              boxShadow: `0 0 ${15 + glowIntensity * 20}px ${5 + glowIntensity * 10}px rgba(${r}, ${g}, ${b}, ${0.3 + glowIntensity * 0.5})`,
            };
          } else {
            const glowColorStart = [79, 70, 229]; // indigo-500
            const glowColorEnd = [167, 139, 250]; // purple-400
            const r = Math.round(glowColorStart[0] + (glowColorEnd[0] - glowColorStart[0]) * glowIntensity);
            const g = Math.round(glowColorStart[1] + (glowColorEnd[1] - glowColorStart[1]) * glowIntensity);
            const b = Math.round(glowColorStart[2] + (glowColorEnd[2] - glowColorStart[2]) * glowIntensity);
            glowStyle = {
              boxShadow: `0 0 ${15 + glowIntensity * 20}px ${5 + glowIntensity * 10}px rgba(${r}, ${g}, ${b}, ${0.3 + glowIntensity * 0.5})`,
            };
          }

          return (
            <div 
              key={upgrade.id}
              onClick={() => handleUpgradeClick(upgrade.id)}
              className={`bg-slate-800/40 backdrop-blur-sm rounded-xl border 
                ${isMaxLevel ? 'border-slate-600 opacity-70' : canAfford 
                  ? (isUpgradeGoodValue ? 'border-green-500/40' : 'border-indigo-500/40') 
                  : 'border-slate-700/40'} 
                p-4 flex items-start gap-2 transition-all relative min-w-0
                ${isTapUpgrade ? 'bg-slate-800/60 border-amber-500/40' : ''}
                ${!isMaxLevel && canAfford ? 'hover:shadow-md hover:shadow-indigo-500/20 cursor-pointer' : ''}`}
              style={{ ...glowStyle, animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center flex-shrink-0">
                <Avatar className={`h-14 w-14 rounded-xl border-2 ${isTapUpgrade ? 'border-amber-500/50' : 'border-indigo-500/30'} shadow-lg ${isTapUpgrade ? 'shadow-amber-500/20' : 'shadow-indigo-500/10'} md:h-16 md:w-16`}>
                  <div className={`flex items-center justify-center w-full h-full rounded-xl ${isTapUpgrade ? 'bg-amber-900/50 text-amber-300' : 'bg-indigo-900/50 text-indigo-300'}`}>
                    {iconMap[upgrade.icon]}
                  </div>
                  <AvatarFallback className={`${isTapUpgrade ? 'bg-amber-900/50 text-amber-300' : 'bg-indigo-900/50 text-indigo-300'} rounded-xl`}>
                    {upgrade.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center text-xs mt-2">
                  <p className={isTapUpgrade ? 'text-amber-400' : 'text-indigo-400'}>{bonusText}</p>
                  {!isTapUpgrade && (
                    <>
                      <p className="text-indigo-300">Total: {formatNumber(totalPassiveIncome)}/s</p>
                      <p className="text-indigo-200">Boost: +{boostPercentage.toFixed(0)}%</p>
                      <div className="w-full h-2 mt-1 flex gap-[2px]">
                        {Array.from({ length: segments }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-full rounded-sm transition-all duration-500 ${
                              i < filledSegments
                                ? isTapUpgrade
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                                : 'bg-slate-700/50'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-bold ${isTapUpgrade ? 'text-amber-100' : 'text-slate-100'} flex-grow min-w-0`}>{upgrade.name}</h3>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-medium ${canAfford ? (isTapUpgrade ? 'text-amber-500' : (isUpgradeGoodValue ? 'text-green-500' : 'text-indigo-500')) : 'text-slate-400'}`}>
                      {isMaxLevel ? 'MAX' : formatNumber(currentCost)}
                    </p>
                    <p className="text-xs text-slate-500">Level {upgrade.level}/{upgrade.maxLevel}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-1 truncate">{upgradeDescription}</p>

                {!isMaxLevel && (
                  <>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 my-2">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${isTapUpgrade ? 'bg-amber-500' : (isUpgradeGoodValue ? 'bg-green-500' : 'bg-indigo-500')}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2 flex-wrap gap-1">
                      <span className="text-slate-400">{timeToSave}</span>
                    </div>
                    <div className="flex gap-1 justify-end mt-2 flex-wrap">
                      {[1, 10, 50, 100].map(quantity => (
                        <div key={`${upgrade.id}-${quantity}`} className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBulkPurchase(upgrade.id, quantity); }}
                            className="relative px-2 py-0.5 bg-slate-700/50 hover:bg-slate-600/50 rounded text-xs font-medium transition-colors flex-shrink-0 z-0"
                            title={`Buy ${quantity}`}
                          >
                            {quantity}
                          </button>
                          {particleTriggers[`${upgrade.id}-${quantity}`] && (
                            <Particles
                              id={`particles-${upgrade.id}-${quantity}`}
                              init={particlesInit}
                              options={{
                                ...particleOptions,
                                particles: {
                                  ...particleOptions.particles,
                                  color: { value: isTapUpgrade ? '#fb923c' : '#818cf8' }, // amber-400 or indigo-300
                                },
                              }}
                              className="absolute inset-0 pointer-events-none z-10"
                            />
                          )}
                        </div>
                      ))}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMaxPurchase(upgrade.id); }}
                          className={`relative px-2 py-0.5 ${isTapUpgrade ? 'bg-amber-700/50 hover:bg-amber-600/50' : 'bg-indigo-700/50 hover:bg-indigo-600/50'} rounded text-xs font-medium transition-colors flex-shrink-0 z-0`}
                          title="Buy maximum affordable amount"
                        >
                          MAX
                        </button>
                        {particleTriggers[`${upgrade.id}-max`] && (
                          <Particles
                            id={`particles-${upgrade.id}-max`}
                            init={particlesInit}
                            options={{
                              ...particleOptions,
                              particles: {
                                ...particleOptions.particles,
                                color: { value: isTapUpgrade ? '#fb923c' : '#818cf8' }, // amber-400 or indigo-300
                              },
                            }}
                            className="absolute inset-0 pointer-events-none z-10"
                          />
                        )}
                      </div>
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