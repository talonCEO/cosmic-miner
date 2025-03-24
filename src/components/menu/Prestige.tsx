import React from 'react';
import { Sparkles } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';

interface PrestigeProps {
  potentialEssenceReward: number;
  handlePrestige: () => void;
}

const Prestige: React.FC<PrestigeProps> = ({ potentialEssenceReward = 0, handlePrestige }) => {
  const { state } = useGame(); // Access game state to get tempEssenceBoostStacks
  const onPrestige = () => {
    handlePrestige();
  };

  // Calculate the essence boost bonus percentage
  const tempEssenceBoostStacks = state.tempEssenceBoostStacks || 0;
  const essenceBoostMultiplier = Math.pow(1.25, tempEssenceBoostStacks); // 1.25 per stack
  const essenceBoostBonus = (essenceBoostMultiplier - 1) * 100; // Convert to percentage increase
  const hasEssenceBoost = tempEssenceBoostStacks > 0;

  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-xl">Prestige</DialogTitle>
      </DialogHeader>
      <div className="p-6 flex flex-col items-center">
        <div className="bg-indigo-900/30 rounded-lg py-3 px-6 mb-4 flex items-center">
          <p className="text-lg font-medium">Potential Essence Reward:</p>
          <div className="flex items-center ml-2">
            <Sparkles size={18} className="text-purple-400 mr-1" />
            <span className="text-xl font-bold text-purple-400">{potentialEssenceReward}</span>
          </div>
        </div>

        {/* Display essence boost bonus if active */}
        {hasEssenceBoost && (
          <p className="text-sm text-green-400 mb-4 text-center">
            Boost Active: +{essenceBoostBonus.toFixed(1)}% 
        )}
        
        <p className="text-center text-slate-300 mb-4">
          Reset your progress in exchange for essence, allowing you to buy powerful upgrades from the shop.
        </p>
        
        <div className="border-t border-indigo-500/20 w-full my-2"></div>
        
        <p className="text-sm text-slate-400 mb-4 text-center">
          Essence reward scales based on your total coins earned. The more essence you earn, the more coins you'll need for additional essence.
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
            You need at least 1,000,000 total coins to earn essence.
          </p>
        )}
      </div>
    </>
  );
};

export default Prestige;
