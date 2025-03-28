import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { Bitcoin, MousePointer, Sparkles, Gauge, Recycle, BarChart } from 'lucide-react';
import { useBoostManager } from '@/hooks/useBoostManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { calculateTapValue } from '@/utils/GameMechanics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getLevelFromExp, getUnlockedTitles, getUnlockedPortraits, TITLES, PORTRAITS } from '@/data/playerProgressionData';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const { calculateTotalCPS, calculateGlobalIncomeMultiplier } = useBoostManager();
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  const totalCPS = calculateTotalCPS();
  const globalMultiplier = calculateGlobalIncomeMultiplier();
  const tapPower = calculateTapValue(state);

  const trackedBoostIds = [
    'boost-double-coins', 'boost-auto-tap', 'boost-tap-boost',
    'boost-cheap-upgrades', 'boost-essence-boost', 'boost-perma-tap',
    'boost-perma-passive'
  ];

  const activeBoosts = state.activeBoosts.filter(boost => trackedBoostIds.includes(boost.id));
  const levelData = getLevelFromExp(state.experience || 0);
  const unlockedTitles = getUnlockedTitles(levelData.currentLevel.level, state.achievements || [], state.prestigeCount);
  const unlockedPortraits = getUnlockedPortraits(levelData.currentLevel.level, state.achievements || [], state.prestigeCount);

  const calculateUpgradeStats = (upgrade: any) => {
    const levelsPurchased = upgrade.level;
    const coinsPerSecondProduced = upgrade.coinsPerSecondBonus * levelsPurchased;
    const totalCost = upgrade.baseCost * ((1 - Math.pow(1.08, levelsPurchased)) / (1 - 1.08));
    return { levelsPurchased, coinsPerSecondProduced, totalCost };
  };

  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <div className="p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 relative">
        <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Game Statistics</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowStatsDialog(true)}
          className="absolute right-2 top-2 text-slate-300 hover:text-white hover:bg-slate-700/50"
        >
          <BarChart size={18} />
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <MousePointer size={18} className="text-blue-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Tap Power</span>
            </div>
            <span className="text-lg font-bold text-blue-300">{formatNumber(tapPower)}</span>
            <span className="text-xs text-slate-500 mt-1">Clicks: {formatNumber(state.totalClicks)}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Gauge size={18} className="text-blue-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Mining Rate</span>
            </div>
            <span className="text-lg font-bold text-blue-300">{formatNumber(totalCPS)}/s</span>
            <span className="text-xs text-slate-500 mt-1">Passive Income</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Sparkles size={18} className="text-purple-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Global Multiplier</span>
            </div>
            <span className="text-lg font-bold text-purple-300">x{formatNumber(globalMultiplier)}</span>
            <span className="text-xs text-slate-500 mt-1">Boosts All Income</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Sparkles size={18} className="text-purple-300 mr-2" />
              <span className="text-xs font-medium text-slate-300">Essence</span>
            </div>
            <span className="text-lg font-bold text-purple-300">{formatNumber(state.essence)}</span>
            <span className="text-xs text-slate-500 mt-1">+{formatNumber(calculatePotentialEssenceReward())}</span>
          </div>
          <div className="col-span-2 flex flex-col items-center justify-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Recycle size={18} className="text-indigo-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Prestige Level</span>
            </div>
            <span className="text-lg font-bold text-indigo-300">{state.prestigeCount}</span>
            <span className="text-xs text-slate-500 mt-1">Coins Earned: {formatNumber(state.totalEarned)}</span>
          </div>
        </div>

        {activeBoosts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-indigo-400">Active Boosts</h3>
            <div className="space-y-2">
              {activeBoosts.map((boost) => {
                const remainingTimeText = boost.remainingTime
                  ? `${Math.floor(boost.remainingTime / 60)}m ${Math.floor(boost.remainingTime % 60)}s`
                  : 'Permanent';
                return (
                  <div key={boost.id} className="flex items-center justify-between p-2 bg-slate-800/40 rounded-md border border-indigo-500/20">
                    <div className="flex items-center">
                      <div className="mr-2">{boost.icon}</div>
                      <div>
                        <div className="font-medium">{boost.name}</div>
                        <div className="text-xs text-slate-400">{boost.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">×{boost.quantity}</div>
                      {boost.remainingTime !== undefined && (
                        <div className="text-xs text-yellow-400">{remainingTimeText}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-slate-800 border border-slate-700/50 rounded-xl text-white max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-xl font-semibold text-center text-indigo-300">
              Detail Report
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-4">
            <div className="space-y-6">
              {/* Production Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Analytics</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="py-2 px-3">Metric</th>
                      <th className="py-2 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Coins</td>
                      <td className="py-2 px-3 text-yellow-300">{formatNumber(state.coins)}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Total Coins</td>
                      <td className="py-2 px-3 text-yellow-300">{formatNumber(state.totalEarned)}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Essence</td>
                      <td className="py-2 px-3 text-purple-300">{formatNumber(state.essence)}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Gems</td>
                      <td className="py-2 px-3 text-emerald-300">{formatNumber(state.gems)}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Tap Power</td>
                      <td className="py-2 px-3 text-yellow-300">{formatNumber(tapPower)}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Mining Rate</td>
                      <td className="py-2 px-3 text-blue-300">{formatNumber(totalCPS)}/s</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Global Multiplier</td>
                      <td className="py-2 px-3 text-purple-300">x{formatNumber(globalMultiplier)}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Total Clicks</td>
                      <td className="py-2 px-3 text-green-300">{formatNumber(state.totalClicks)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Player Progression */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Player Progression</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="py-2 px-3">Metric</th>
                      <th className="py-2 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Level</td>
                      <td className="py-2 px-3 text-cyan-300">{levelData.currentLevel.level}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Experience</td>
                      <td className="py-2 px-3 text-cyan-300">
                        {formatNumber(state.experience || 0)} / {formatNumber(levelData.nextLevel?.expRequired || 0)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Progress to Next Level</td>
                      <td className="py-2 px-3 text-cyan-300">{levelData.progress.toFixed(2)}%</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Titles Unlocked</td>
                      <td className="py-2 px-3 text-cyan-300">{unlockedTitles.length} / {TITLES.length}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Portraits Unlocked</td>
                      <td className="py-2 px-3 text-cyan-300">{unlockedPortraits.length} / {PORTRAITS.length}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-2 px-3">Prestige Count</td>
                      <td className="py-2 px-3 text-indigo-300">{state.prestigeCount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Upgrades */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Upgrades</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="py-2 px-3">Upgrade</th>
                      <th className="py-2 px-3">Levels</th>
                      <th className="py-2 px-3">Income</th>
                      <th className="py-2 px-3">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.upgrades.map((upgrade) => {
                      const stats = calculateUpgradeStats(upgrade);
                      return (
                        <tr key={upgrade.id} className="border-b border-slate-700/50">
                          <td className="py-2 px-3">{upgrade.name}</td>
                          <td className="py-2 px-3 text-cyan-300">{stats.levelsPurchased}</td>
                          <td className="py-2 px-3 text-blue-300">{formatNumber(stats.coinsPerSecondProduced)}</td>
                          <td className="py-2 px-3 text-red-300">{formatNumber(stats.totalCost)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Managers */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Managers</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="py-2 px-3">Manager</th>
                      <th className="py-2 px-3">Owned</th>
                      <th className="py-2 px-3">Perks Unlocked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map((manager) => (
                      <tr key={manager.id} className="border-b border-slate-700/50">
                        <td className="py-2 px-3">{manager.name}</td>
                        <td className="py-2 px-3 text-green-400">{state.ownedManagers?.includes(manager.id) ? 'Yes' : 'No'}</td>
                        <td className="py-2 px-3 text-cyan-300">
                          {(manager.perks || []).filter(p => p.unlocked).length} / {(manager.perks || []).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Artifacts */}
              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Artifacts</h3>
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="py-2 px-3">Artifact</th>
                      <th className="py-2 px-3">Owned</th>
                      <th className="py-2 px-3">Perks Unlocked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artifacts.map((artifact) => (
                      <tr key={artifact.id} className="border-b border-slate-700/50">
                        <td className="py-2 px-3">{artifact.name}</td>
                        <td className="py-2 px-3 text-green-400">{state.ownedArtifacts?.includes(artifact.id) ? 'Yes' : 'No'}</td>
                        <td className="py-2 px-3 text-cyan-300">
                          {(artifact.perks || []).filter(p => p.unlocked).length} / {(artifact.perks || []).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stats;
