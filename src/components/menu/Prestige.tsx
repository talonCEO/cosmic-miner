
import React from 'react';
import { Sparkles } from 'lucide-react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PrestigeProps {
  potentialEssenceReward: number;
  handlePrestige: () => void;
}

const Prestige: React.FC<PrestigeProps> = ({ potentialEssenceReward = 0, handlePrestige }) => {
  const onPrestige = () => {
    handlePrestige();
  };
  
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
        
        <p className="text-center text-slate-300 mb-4">
          Reset your progress in exchange for essence, allowing you to buy powerful upgrades from the shop.
        </p>
        
        <div className="border-t border-indigo-500/20 w-full my-2"></div>
        
        <p className="text-sm text-slate-400 mb-4 text-center">
        Conquer this planet to unlock a universe of new worlds. Max it out, claim your rewards, and explore the stars!
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
