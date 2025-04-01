import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { Bitcoin, MousePointer, Sparkles, Gauge, Recycle, BarChart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLevelFromExp, getUnlockedTitles, getUnlockedPortraits, TITLES, PORTRAITS } from '@/data/playerProgressionData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';
import * as GameMechanics from '@/utils/GameMechanics';
import { useBoostManager } from '@/hooks/useBoostManager';
import { BoostEffect } from './menu/types';

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const { getBoostTotals, calculateTotalCPS } = useBoostManager(); // Add calculateTotalCPS

  const tapPower = GameMechanics.calculateBaseTapValueWithoutCrit(state);
  const totalPassiveIncome = calculateTotalCPS(); // Use calculateTotalCPS instead
  const boostTotals = getBoostTotals();
  const globalMultiplier = typeof GameMechanics.calculateGlobalMultiplier === 'function'
    ? GameMechanics.calculateGlobalMultiplier(state)
    : 1;
  const levelData = getLevelFromExp(state.playerData.experience || 0);
  const unlockedTitles = getUnlockedTitles(levelData.currentLevel.level, state.achievements.map(a => a.id).filter(id => state.achievements.find(ach => ach.id === id)?.unlocked) || [], state.prestigeCount);
  const unlockedPortraits = getUnlockedPortraits(levelData.currentLevel.level, state.achievements.map(a => a.id).filter(id => state.achievements.find(ach => ach.id === id)?.unlocked) || [], state.prestigeCount);
  
  const expToNextLevel = levelData.nextLevel?.expRequired || state.playerData.maxExp;
  const currentExp = state.playerData.experience || 0;
  const progressPercentage = expToNextLevel > 0 
    ? ((currentExp / expToNextLevel) * 100).toFixed(2) 
    : "100.00";

  const calculateUpgradeStats = (upgrade: any) => {
    const levelsPurchased = upgrade.level;
    const boostMultiplier = upgrade.category === 'tap' ? 0 : GameMechanics.getLevelBoostMultiplier?.(upgrade.level) || 0;
    const totalPassiveIncome = upgrade.category === 'tap' ? 0 : upgrade.coinsPerSecondBonus * levelsPurchased * (1 + boostMultiplier);
    const boostPercentage = boostMultiplier * 100;
    return { levelsPurchased, totalPassiveIncome, boostPercentage };
  };

  const managerPerkCounts = managers.map(manager => {
    const owned = state.ownedManagers?.includes(manager.id);
    const perkCount = owned && manager.perks
      ? manager.perks.filter(p => state.unlockedPerks?.includes(p.id) || p.unlocked).length
      : 0;
    return { name: manager.name, owned, perksUnlocked: perkCount, totalPerks: manager.perks?.length || 0 };
  });

  const artifactPerkCounts = artifacts.map(artifact => {
    const owned = state.ownedArtifacts?.includes(artifact.id);
    const perkCount = owned && artifact.perks
      ? artifact.perks.filter(p => state.unlockedPerks?.includes(p.id) || p.unlocked).length
      : 0;
    return { name: artifact.name, owned, perksUnlocked: perkCount, totalPerks: artifact.perks?.length || 0 };
  });

  const critBoostActive = state.activeBoosts.some((b: BoostEffect) => 
    b.id === 'boost-critical-chance' && (b.remainingTime !== undefined ? b.remainingTime > 0 : GameMechanics.getRemaining(b) > 0)
  );
  const autoTapActive = state.autoTapActive || state.autoTap;

  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <div className="p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 relative">
          <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Game Statistics</h2>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <BarChart size={18} />
            </Button>
          </DialogTrigger>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
              <div className="flex items-center mb-1">
                <MousePointer size={18} className="text-blue-400 mr-2" />
                <span className="text-xs font-medium text-slate-300">Tap Power</span>
              </div>
              <span className="text-lg font-bold text-blue-400">{formatNumber(tapPower)}</span>
              <span className="text-xs text-slate-500 mt-1">Clicks: {formatNumber(state.totalClicks)}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
              <div className="flex items-center mb-1">
                <Gauge size={18} className="text-blue-400 mr-2" />
                <span className="text-xs font-medium text-slate-300">Mining Rate</span>
              </div>
              <span className="text-lg font-bold text-blue-400">{formatNumber(totalPassiveIncome)}/s</span>
              <span className="text-xs text-slate-500 mt-1">Passive Income</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
              <div className="flex items-center mb-1">
                <Sparkles size={18} className="text-blue-400 mr-2" />
                <span className="text-xs font-medium text-slate-300">Global Multiplier</span>
              </div>
              <span className="text-lg font-bold text-blue-400">x{formatNumber(globalMultiplier)}</span>
              <span className="text-xs text-slate-500 mt-1">Boosts All Income</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
              <div className="flex items-center mb-1">
                <Sparkles size={18} className="text-blue-400 mr-2" />
                <span className="text-xs font-medium text-slate-300">Essence</span>
              </div>
              <span className="text-lg font-bold text-blue-400">{formatNumber(state.essence)}</span>
              <span className="text-xs text-slate-500 mt-1">+{formatNumber(calculatePotentialEssenceReward())}</span>
            </div>
            <div className="col-span-2 flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
              <div className="flex items-center mb-1">
                <Recycle size={18} className="text-blue-400 mr-2" />
                <span className="text-xs font-medium text-slate-300">Prestige Level</span>
              </div>
              <span className="text-lg font-bold text-blue-400">{state.prestigeCount}</span>
              <span className="text-xs text-slate-500 mt-1">Coins Earned: {formatNumber(state.totalEarned)}</span>
            </div>
          </div>
          {/* Active Boosts section remains unchanged */}
          {state.activeBoosts.length > 0 && (
            <div className="mt-4 bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
              <h3 className="text-md font-semibold text-indigo-300 mb-2">Active Boosts</h3>
              <div className="space-y-2">
                {state.activeBoosts
                  .filter((boost: BoostEffect) => boost.remainingTime !== undefined && boost.remainingTime > 0)
                  .map((boost: BoostEffect) => (
                    <div key={boost.id} className="flex items-center justify-between text-sm text-slate-300">
                      <div className="flex items-center">
                        {boost.icon}
                        <span className="ml-2">{boost.name}</span>
                      </div>
                      <span>
                        {boost.id === 'boost-tap-boost'
                          ? `${state.tapBoostTapsRemaining || 0} taps`
                          : formatDuration(boost.remainingTime!)}
                      </span>
                    </div>
                  ))}
                {state.activeBoosts
                  .filter((boost: BoostEffect) => boost.remainingTime === undefined || boost.remainingTime <= 0)
                  .map((boost: BoostEffect) => (
                    <div key={boost.id} className="flex items-center justify-between text-sm text-slate-300">
                      <div className="flex items-center">
                        {boost.icon}
                        <span className="ml-2">{boost.name}</span>
                      </div>
                      <span>Permanent</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogContent className="bg-slate-900 border border-indigo-500/20 rounded-lg max-w-md mx-auto p-0 max-h-[80vh] overflow-hidden">
          <DialogHeader className="p-4 border-b border-indigo-500/20">
            <DialogTitle className="text-center text-xl text-white">Detail Report</DialogTitle>
            <DialogDescription className="text-center text-slate-300">
              Comprehensive overview of your cosmic mining progress
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] p-4">
            <div className="space-y-6">
              <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">Production Metrics</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <tbody>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Coins</td>
                      <td className="py-2 px-3 text-indigo-200">{formatNumber(state.coins)}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Total Coins</td>
                      <td className="py-2 px-3 text-indigo-200">{formatNumber(state.totalEarned)}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Essence</td>
                      <td className="py-2 px-3 text-indigo-200">{formatNumber(state.essence)}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Gems</td>
                      <td className="py-2 px-3 text-indigo-200">{formatNumber(state.gems)}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Tap Power</td>
                      <td className="py-2 px-3 text-indigo-200">{formatNumber(tapPower)}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Mining Rate</td>
                      <td className="py-2 px-3 text-indigo-200">{formatNumber(totalPassiveIncome)}/s</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Total Clicks</td>
                      <td className="py-2 px-3 text-indigo-200">{formatNumber(state.totalClicks)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Other sections remain unchanged */}
              <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">Player Progression</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <tbody>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Level</td>
                      <td className="py-2 px-3 text-indigo-200">{levelData.currentLevel.level}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Experience</td>
                      <td className="py-2 px-3 text-indigo-200">
                        {formatNumber(state.playerData.experience)} / {formatNumber(expToNextLevel)}
                      </td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Progress to Next Level</td>
                      <td className="py-2 px-3 text-indigo-200">{progressPercentage}%</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Titles Unlocked</td>
                      <td className="py-2 px-3 text-indigo-200">{unlockedTitles.length} / {TITLES.length}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Portraits Unlocked</td>
                      <td className="py-2 px-3 text-indigo-200">{unlockedPortraits.length} / {PORTRAITS.length}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Prestige Count</td>
                      <td className="py-2 px-3 text-indigo-200">{state.prestigeCount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">Boosts in Effect</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <tbody>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Global Multiplier</td>
                      <td className="py-2 px-3 text-indigo-200">x{formatNumber(boostTotals.globalMultiplier)}</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Tap Power</td>
                      <td className="py-2 px-3 text-indigo-200">{(boostTotals.tapPower * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Passive Income</td>
                      <td className="py-2 px-3 text-indigo-200">{(boostTotals.passiveIncome * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Essence Reward</td>
                      <td className="py-2 px-3 text-indigo-200">{(boostTotals.essenceReward * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="border-b border-indigo-500/20">
                      <td className="py-2 px-3">Cost Reduction</td>
                      <td className="py-2 px-3 text-indigo-200">{((1 - boostTotals.costReduction) * 100).toFixed(1)}%</td>
                    </tr>
                    {critBoostActive && (
                      <tr className="border-b border-indigo-500/20">
                        <td className="py-2 px-3">Critical Chance</td>
                        <td className="py-2 px-3 text-indigo-200">100%</td>
                      </tr>
                    )}
                    {autoTapActive && (
                      <tr className="border-b border-indigo-500/20">
                        <td className="py-2 px-3">Auto Tap</td>
                        <td className="py-2 px-3 text-indigo-200">
                          {state.autoTapActive ? 'Boosted' : 'Base'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-indigo-500/20">
            <Button
              onClick={() => setShowStatsDialog(false)}
              className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stats;