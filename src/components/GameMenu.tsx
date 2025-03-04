
import React, { useState } from 'react';
import { Menu, X, Award, ArrowUp, ShoppingBag, Sparkles } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { useToast } from '@/components/ui/use-toast';

export type MenuType = "main" | "achievements" | "prestige" | "shop" | "none";

const GameMenu: React.FC = () => {
  const { state, prestige, calculateEssenceReward } = useGame();
  const [menuType, setMenuType] = useState<MenuType>("none");
  const { toast } = useToast();
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset to main menu when dialog is closed externally
      setMenuType("none");
    } else if (menuType === "none") {
      // When opening, ensure we start with main menu
      setMenuType("main");
    }
  };
  
  const handlePrestige = () => {
    const essenceReward = calculateEssenceReward(state.totalEarned);
    
    prestige();
    setMenuType("none");
    
    toast({
      title: "Prestige Complete!",
      description: `Gained ${essenceReward} essence. All progress has been reset.`,
      variant: "default",
    });
  };
  
  const potentialEssenceReward = calculateEssenceReward(state.totalEarned);
  
  return (
    <Dialog onOpenChange={handleOpenChange} open={menuType !== "none"}>
      <DialogTrigger asChild>
        <button 
          className="p-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-white rounded-xl p-0 border-none shadow-xl">
        {menuType === "main" && (
          <>
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-center text-xl">Game Menu</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col p-4 gap-3">
              <button 
                onClick={() => setMenuType("achievements")} 
                className="bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <Award size={20} />
                <span>Achievements</span>
              </button>
              <button 
                onClick={() => setMenuType("prestige")} 
                className="bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUp size={20} />
                <span>Prestige</span>
              </button>
              <button 
                onClick={() => setMenuType("shop")} 
                className="bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                <span>Shop</span>
              </button>
              <DialogClose className="bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-300 transition-colors mt-2">
                Back
              </DialogClose>
            </div>
          </>
        )}
        
        {menuType === "achievements" && (
          <>
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Achievements</DialogTitle>
              <button 
                onClick={() => setMenuType("main")} 
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </DialogHeader>
            <div className="p-6">
              <p className="text-center text-slate-500">Achievements coming soon!</p>
              <p className="text-center text-sm text-slate-400 mt-2">
                Unlock achievements as you progress in the game.
              </p>
            </div>
          </>
        )}
        
        {menuType === "prestige" && (
          <>
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Prestige</DialogTitle>
              <button 
                onClick={() => setMenuType("main")} 
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </DialogHeader>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-purple-100 rounded-lg py-3 px-6 mb-4 flex items-center">
                <p className="text-lg font-medium">Potential Essence Reward:</p>
                <div className="flex items-center ml-2">
                  <Sparkles size={18} className="text-purple-500 mr-1" />
                  <span className="text-xl font-bold text-purple-500">{potentialEssenceReward}</span>
                </div>
              </div>
              
              <p className="text-center text-slate-600 mb-4">
                Reset your progress in exchange for essence, allowing you to buy powerful upgrades from the prestige shop.
              </p>
              
              <div className="border-t border-slate-200 w-full my-2"></div>
              
              <p className="text-sm text-slate-500 mb-4 text-center">
                Your potential essence reward is calculated based on your total coins earned this prestige. 
                For every 100,000 coins earned, you receive 1 essence.
              </p>
              
              <button
                onClick={handlePrestige}
                className="bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors w-full"
                disabled={potentialEssenceReward === 0}
              >
                {potentialEssenceReward === 0 ? "Not enough coins to prestige" : "Prestige Now"}
              </button>
              
              {potentialEssenceReward === 0 && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  You need at least 100,000 total coins to earn essence.
                </p>
              )}
            </div>
          </>
        )}
        
        {menuType === "shop" && (
          <>
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Shop</DialogTitle>
              <button 
                onClick={() => setMenuType("main")} 
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </DialogHeader>
            <div className="p-6">
              <p className="text-center text-slate-500">Shop coming soon!</p>
              <p className="text-center text-sm text-slate-400 mt-2">
                Purchase special items and upgrades with your Essence.
              </p>
              <div className="flex items-center justify-center mt-3">
                <Sparkles size={16} className="text-purple-500 mr-1" />
                <p className="text-lg font-medium text-purple-500">{formatNumber(state.essence)} Essence Available</p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
