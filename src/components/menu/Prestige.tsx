import React from 'react';
import { Sparkles } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { calculateEssenceIncomeBoost } from '@/utils/gameLogic';

interface PrestigeProps {
  potentialEssenceReward: number;
  handlePrestige: () => void;
}

const Prestige: React.FC<PrestigeProps> = ({ potentialEssenceReward = 0, handlePrestige }) => {
  const { state } = useGame();

  const onPrestige = () => {
    handlePrestige();
  };

  const currentEssence = state.totalEssence || 0;
  const newEssenceTotal = currentEssence + potentialEssenceReward;
  const currentBoost = ((calculateEssenceIncomeBoost(currentEssence) - 1) * 100).toFixed(1);
  const totalBoost = ((calculateEssenceIncomeBoost(newEssenceTotal) - 1) * 100).toFixed(1);

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-xl">Prestige</DialogTitle>
      </DialogHeader>
      <div className="p-6 flex flex-col items-center">
        {/* Essence Reward */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg py-4 px-6 mb-4 w-full text-center">
          <p className="text-lg font-medium text-slate-200">Essence Reward</p>
          <div className="flex items-center justify-center mt-1">
            <Sparkles size={24} className="text-purple-400 mr-2" />
            <span className="text-2xl font-bold text-purple-300">
              {formatNumber(potentialEssenceReward)}
            </span>
          </div>
        </div>

        {/* Current and Total Boost */}
        <div className="text-center mb-4 w-full">
          <p className="text-md font-semibold text-green-400">
            Current Boost: +{currentBoost}%
          </p>
          <p className="text-md font-semibold text-green-400">
            New Boost: +{totalBoost}%
          </p>
          <p className="text-sm text-slate-300 mt-1">
            Total Essence: {formatNumber(currentEssence)} → {formatNumber(newEssenceTotal)}
          </p>
        </div>

        {/* Essence Description */}
        <p className="text-sm text-slate-300 mb-4 text-center">
          Essence is a powerful resource earned by resetting progress. It boosts all income permanently!
        </p>

        {/* Prestige Button */}
        <button
          onClick={onPrestige}
          className={`py-3 px-6 rounded-lg font-medium w-full transition-colors ${
            potentialEssenceReward === 0
              ? "bg-gray-600 text-slate-400 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
          disabled={potentialEssenceReward === 0}
        >
          {potentialEssenceReward === 0 ? "Need 100k Coins" : "Prestige Now"}
        </button>

        {potentialEssenceReward === 0 && (
          <p className="text-xs text-red-400 mt-2 text-center">
            Earn {formatNumber(100000 - (state.totalEarned || 0))} more coins to prestige!
          </p>
        )}
      </div>
    </>
  );
};

export default Prestige;