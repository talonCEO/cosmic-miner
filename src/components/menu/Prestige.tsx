import React from 'react';
import { Sparkles } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { calculateEssenceMultiplier } from '@/utils/gameLogic';

interface PrestigeProps {
  potentialEssenceReward: number;
  handlePrestige: () => void;
}

const Prestige: React.FC<PrestigeProps> = ({ potentialEssenceReward = 0, handlePrestige }) => {
  const { state } = useGame();
  const onPrestige = () => {
    handlePrestige();
  };

  // Calculate the essence boost bonus percentage from temp stacks
  const tempEssenceBoostStacks = state.tempEssenceBoostStacks || 0;
  const essenceBoostMultiplier = Math.pow(1.25, tempEssenceBoostStacks);
  const essenceBoostBonus = (essenceBoostMultiplier - 1) * 100;
  const hasEssenceBoost = tempEssenceBoostStacks > 0;

  // Calculate the total essence multiplier bonus
  const currentEssence = state.totalEssence || 0;
  const newEssenceTotal = currentEssence + potentialEssenceReward;
  const essenceMultiplier = calculateEssenceMultiplier(newEssenceTotal) - 1; // Subtract 1 to get bonus
  const essenceMultiplierBonus = essenceMultiplier * 100; // Convert to percentage

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-xl">Prestige</DialogTitle>
      </DialogHeader>
      <div className="p-6 flex flex-col items-center">
        <div className="bg-indigo-900/30 rounded-lg py-3 px-6 mb-4 flex items-center justify-between w-full">
          <p className="text-lg font-medium">Potential Essence Reward:</p>
          <div className="flex items-center">
            <Sparkles size={18} className="text-purple-400 mr-1" />
            <span className="text-xl font-bold text-purple-400">{formatNumber(potentialEssenceReward)}</span>
          </div>
        </div>

        {/* Display essence multiplier bonus */}
        {potentialEssenceReward > 0 && (
          <p className="text-sm text-green-400 mb-4 text-center">
            Prestige Bonus: +{formatNumber(essenceMultiplierBonus)}% to all income (Each essence grants +10%)
          </p>
        )}

        {/* Display current essence multiplier */}
        <p className="text-sm text-slate-300 mb-4 text-center">
          Current Essence Multiplier: {formatNumber((calculateEssenceMultiplier(currentEssence) - 1) * 100)}% 
          ({formatNumber(currentEssence)} essence)
        </p>

        {/* Display essence boost bonus if active */}
        {hasEssenceBoost && (
          <p className="text-sm text-yellow-400 mb-4 text-center">
            Essence Boost Active: +{formatNumber(essenceBoostBonus)}% this prestige ({tempEssenceBoostStacks} stack{tempEssenceBoostStacks !== 1 ? 's' : ''})
          </p>
        )}
        
        <p className="text-center text-slate-300 mb-4">
          Reset your progress in exchange for essence, which permanently boosts your income. Each essence earned increases all income by 10%.
        </p>
        
        <div className="border-t border-indigo-500/20 w-full my-2"></div>
        
        <p className="text-sm text-slate-400 mb-4 text-center">
          Essence reward scales with total coins earned. Earn your first essence at 100k coins, with costs doubling every 5 essence.
        </p>
        
        <button
          onClick={onPrestige}
          className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors w-full"
          disabled={potentialEssenceReward === 0}
        >
          {potentialEssenceReward === 0 ? "Not enough coins to prestige" : "Prestige Now"}
        </button>
        
        {potentialEssenceReward === 0 && (
          <p className="text-xs text-red-400 mt-2 text-center">
            You need at least 100,000 total coins to earn essence.
          </p>
        )}
      </div>
    </>
  );
};

export default Prestige;
