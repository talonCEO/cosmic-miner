
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { useBoostManager } from '@/hooks/useBoostManager';
import { calculateTapValue } from '@/utils/GameMechanics';
import { INVENTORY_ITEMS } from '@/components/menu/types';
import { Clock } from 'lucide-react';

const Stats: React.FC = () => {
  const { state, calculatePotentialEssenceReward } = useGame();
  const { calculateTotalCPS, calculateGlobalIncomeMultiplier } = useBoostManager();
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  
  const totalCPS = calculateTotalCPS();
  const globalMultiplier = calculateGlobalIncomeMultiplier();
  const tapPower = calculateTapValue(state);

  const activeBoosts = Object.entries(state.boosts)
    .filter(([_, boost]) => boost.active || boost.purchased > 0)
    .map(([id, boost]) => ({
      id,
      name: INVENTORY_ITEMS[id as keyof typeof INVENTORY_ITEMS]?.name || id,
      remainingTime: boost.remainingTime,
      remainingUses: boost.remainingUses,
      purchased: boost.purchased,
    }));

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-md mx-auto pb-12">
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40">
        <div className="flex flex-col items-center">
          <span className="text-sm text-center text-slate-400">Tap Power</span>
          <span className="text-lg font-bold text-white">{formatNumber(tapPower)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-center text-slate-400">Coins/Sec</span>
          <span className="text-lg font-bold text-white">{formatNumber(totalCPS)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-center text-slate-400">Multiplier</span>
          <span className="text-lg font-bold text-white">{globalMultiplier.toFixed(2)}x</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-center text-slate-400">Essence Potential</span>
          <span className="text-lg font-bold text-white">{calculatePotentialEssenceReward()}</span>
        </div>
        <button
          className="col-span-2 mt-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={() => setShowStatsDialog(true)}
        >
          Detailed Stats
        </button>
      </div>

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="bg-slate-900 border border-indigo-500/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Detailed Statistics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Resources</h3>
              <p>Coins: {formatNumber(state.coins)}</p>
              <p>Gems: {state.gems}</p>
              <p>Essence: {state.essence}</p>
              <p>Total Earned: {formatNumber(state.totalEarned)}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Income</h3>
              <p>Base Tap Power: {formatNumber(state.coinsPerClick)}</p>
              <p>Tap Power with Bonuses: {formatNumber(tapPower)}</p>
              <p>Base Coins/Sec: {formatNumber(state.coinsPerSecond)}</p>
              <p>Total Coins/Sec: {formatNumber(totalCPS)}</p>
              <p>Global Multiplier: {globalMultiplier.toFixed(2)}x</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Progress</h3>
              <p>Prestige Count: {state.prestigeCount}</p>
              <p>Potential Essence: {calculatePotentialEssenceReward()}</p>
              <p>Total Taps: {state.totalClicks}</p>
              <p>Upgrades Purchased: {Object.values(state.upgrades).reduce((sum, u) => sum + u.level, 0)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {activeBoosts.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/40">
          <h3 className="text-lg font-medium mb-2 text-center text-slate-100">Active Boosts</h3>
          <div className="space-y-2">
            {activeBoosts.map(boost => (
              <div key={boost.id} className="flex justify-between items-center text-sm text-slate-300">
                <span>{boost.name}</span>
                <span>
                  {boost.remainingTime ? `${formatTime(boost.remainingTime)} left` : 
                   boost.remainingUses ? `${boost.remainingUses} taps left` : 
                   `x${boost.purchased} (Permanent)`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
