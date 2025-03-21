import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { MousePointer, Gauge, Sparkles, Recycle, Bitcoin, Timer } from 'lucide-react';
import { calculateTapValue } from '@/utils/GameMechanics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { managers } from '@/utils/managersData';
import { artifacts } from '@/utils/artifactsData';

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Core metrics
  const tapPower = calculateTapValue(state);
  const miningRate = state.coinsPerSecond;
  const essenceReward = calculatePotentialEssenceReward();

  // Filter active boosts
  const trackedBoostIds = [
    'boost-double-coins', 'boost-auto-tap', 'boost-tap-boost',
    'boost-cheap-upgrades', 'boost-essence-boost', 'boost-perma-tap',
    'boost-perma-passive'
  ];
  const activeBoosts = state.activeBoosts.filter(boost => trackedBoostIds.includes(boost.id));

  // Calculate upgrade stats
  const calculateUpgradeStats = (upgrade: any) => {
    const levelsPurchased = upgrade.level;
    const coinsPerClickProduced = upgrade.coinsPerClickBonus * levelsPurchased;
    const coinsPerSecondProduced = upgrade.coinsPerSecondBonus * levelsPurchased;
    const totalCost = upgrade.baseCost * ((1 - Math.pow(1.08, levelsPurchased)) / (1 - 1.08));
    return { levelsPurchased, coinsPerClickProduced, coinsPerSecondProduced, totalCost };
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 p-4">
        <h2 className="text-lg font-medium mb-4 text-center text-slate-100">Stats</h2>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Bitcoin size={18} className="text-yellow-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Coins</span>
            </div>
            <span className="text-lg font-bold text-yellow-300">{formatNumber(state.coins)}</span>
            <span className="text-xs text-slate-500 mt-1">Earned: {formatNumber(state.totalEarned)}</span>
          </div>

          <div className="flex flex-col items-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <MousePointer size={18} className="text-yellow-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Drill Power</span>
            </div>
            <span className="text-lg font-bold text-yellow-300">{formatNumber(tapPower)}</span>
            <span className="text-xs text-slate-500 mt-1">Clicks: {formatNumber(state.totalClicks)}</span>
          </div>

          <div className="flex flex-col items-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Gauge size={18} className="text-blue-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Mining Rate</span>
            </div>
            <span className="text-lg font-bold text-blue-300">{formatNumber(miningRate)}/s</span>
            <span className="text-xs text-slate-500 mt-1">Passive Income</span>
          </div>

          <div className="flex flex-col items-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Sparkles size={18} className="text-purple-300 mr-2" />
              <span className="text-xs font-medium text-slate-300">Essence</span>
            </div>
            <span className="text-lg font-bold text-purple-300">{formatNumber(state.essence)}</span>
            <span className="text-xs text-slate-500 mt-1">+{formatNumber(essenceReward)}</span>
          </div>

          <div className="col-span-2 flex flex-col items-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <div className="flex items-center mb-1">
              <Recycle size={18} className="text-indigo-400 mr-2" />
              <span className="text-xs font-medium text-slate-300">Prestige</span>
            </div>
            <span className="text-lg font-bold text-indigo-300">{state.prestigeCount}</span>
            <span className="text-xs text-slate-500 mt-1">Multiplier: x{formatNumber(state.incomeMultiplier)}</span>
          </div>
        </div>

        {/* Active Boosts */}
        {activeBoosts.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2 text-indigo-400">Active Boosts</h3>
            <div className="space-y-2">
              {activeBoosts.map((boost) => {
                const timeLeft = boost.remainingTime !== undefined
                  ? `${Math.floor(boost.remainingTime / 60)}m ${Math.floor(boost.remainingTime % 60)}s`
                  : 'Permanent';
                return (
                  <div
                    key={boost.id}
                    className="flex items-center justify-between p-2 bg-slate-800/40 rounded-md border border-indigo-500/20"
                  >
                    <div className="flex items-center">
                      <div className="mr-2">{boost.icon}</div>
                      <div>
                        <div className="font-medium text-slate-100">{boost.name}</div>
                        <div className="text-xs text-slate-400">{boost.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">×{boost.quantity}</div>
                      <div className="text-xs text-yellow-400">{timeLeft}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Details Button */}
        <div className="mt-4 flex justify-center">
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogTrigger asChild>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border border-slate-700/50 rounded-xl text-white max-w-2xl max-h-[80vh] p-0">
              <DialogHeader className="p-4 pb-0">
                <DialogTitle className="text-xl font-semibold text-center text-indigo-300">
                  Detailed Stats
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] p-4">
                <div className="space-y-6">
                  {/* Upgrades */}
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-400 mb-2">Upgrades</h3>
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="py-2 px-3">Upgrade</th>
                          <th className="py-2 px-3">Levels</th>
                          <th className="py-2 px-3">Click Income</th>
                          <th className="py-2 px-3">Passive Income</th>
                          <th className="py-2 px-3">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.upgrades.map((upgrade) => {
                          const stats = calculateUpgradeStats(upgrade);
                          return (
                            <tr key={upgrade.id} className="border-b border-slate-700/50">
                              <td className="py-2 px-3">{upgrade.name}</td>
                              <td className="py-2 px-3 text-cyan-300">{stats.levelsPurchased}</td>
                              <td className="py-2 px-3 text-yellow-300">{formatNumber(stats.coinsPerClickProduced)}</td>
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
      </div>
    </div>
  );
};

export default Stats;
