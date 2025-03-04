
import React, { useState } from 'react';
import { Menu, X, Award, ArrowUp, ShoppingBag, Sparkles } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
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
  
  // Calculate achievements progress
  const achievementProgress = () => {
    const unlocked = state.achievements.filter(a => a.unlocked).length;
    const total = state.achievements.length;
    return { unlocked, total, percentage: total > 0 ? (unlocked / total) * 100 : 0 };
  };

  const progress = achievementProgress();
  
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
      
      <DialogContent className="sm:max-w-md backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white">
        {menuType === "main" && (
          <>
            <DialogHeader className="p-4 border-b border-indigo-500/20">
              <DialogTitle className="text-center text-xl">Game Menu</DialogTitle>
              <DialogDescription className="text-center text-slate-300">
                Select an option to continue
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col p-4 gap-3">
              <button 
                onClick={() => setMenuType("achievements")} 
                className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Award size={20} />
                <span>Achievements</span>
              </button>
              <button 
                onClick={() => setMenuType("prestige")} 
                className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUp size={20} />
                <span>Prestige</span>
              </button>
              <button 
                onClick={() => setMenuType("shop")} 
                className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                <span>Shop</span>
              </button>
              <DialogClose className="bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors mt-2">
                Back
              </DialogClose>
            </div>
          </>
        )}
        
        {menuType === "achievements" && (
          <>
            <DialogHeader className="p-4 border-b border-indigo-500/20 flex justify-between items-center">
              <DialogTitle className="text-xl">Achievements</DialogTitle>
              <button 
                onClick={() => setMenuType("main")} 
                className="p-1 rounded-full hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </DialogHeader>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-4 bg-slate-800/50 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{progress.unlocked}/{progress.total} ({Math.round(progress.percentage)}%)</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                {state.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-start p-3 rounded-lg border ${
                      achievement.unlocked
                        ? "border-indigo-500/30 bg-indigo-900/20"
                        : "border-slate-700/30 bg-slate-800/20 opacity-60"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-600/30 flex items-center justify-center mr-3 flex-shrink-0">
                      <Award size={24} className={achievement.unlocked ? "text-yellow-400" : "text-slate-400"} />
                    </div>
                    <div>
                      <h3 className="font-medium text-base">
                        {achievement.name}
                        {achievement.unlocked && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-2">Unlocked</span>}
                      </h3>
                      <p className="text-sm text-slate-300 mt-1">{achievement.description}</p>
                    </div>
                  </div>
                ))}
                
                {state.achievements.length === 0 && (
                  <div className="text-center py-6 text-slate-400">
                    <p>No achievements available yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {menuType === "prestige" && (
          <>
            <DialogHeader className="p-4 border-b border-indigo-500/20 flex justify-between items-center">
              <DialogTitle className="text-xl">Prestige</DialogTitle>
              <button 
                onClick={() => setMenuType("main")} 
                className="p-1 rounded-full hover:bg-slate-700"
              >
                <X size={20} />
              </button>
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
                <p className="text-xs text-red-400 mt-2 text-center">
                  You need at least 100,000 total coins to earn essence.
                </p>
              )}
            </div>
          </>
        )}
        
        {menuType === "shop" && (
          <>
            <DialogHeader className="p-4 border-b border-indigo-500/20 flex justify-between items-center">
              <DialogTitle className="text-xl">Manager Shop</DialogTitle>
              <button 
                onClick={() => setMenuType("main")} 
                className="p-1 rounded-full hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </DialogHeader>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center mb-4 bg-indigo-900/30 rounded-lg p-2">
                <Sparkles size={16} className="text-purple-400 mr-1" />
                <p className="font-medium text-purple-300">{formatNumber(state.essence)} Essence Available</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {state.managers.map(manager => {
                  const isOwned = manager.owned;
                  const canAfford = state.essence >= manager.cost;
                  
                  return (
                    <div 
                      key={manager.id} 
                      className={`rounded-lg border p-3 transition ${
                        isOwned 
                          ? "border-green-500/30 bg-green-900/10" 
                          : canAfford 
                            ? "border-indigo-500/30 bg-indigo-900/10 hover:bg-indigo-900/20" 
                            : "border-slate-700/30 bg-slate-800/10 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isOwned ? "bg-green-700/50" : "bg-indigo-700/50"
                        }`}>
                          {manager.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{manager.name}</h3>
                          <p className="text-xs text-slate-300 truncate">{manager.description}</p>
                        </div>
                      </div>
                      
                      {isOwned ? (
                        <div className="bg-green-900/20 text-green-400 text-center py-1 rounded text-sm font-medium">
                          Owned
                        </div>
                      ) : (
                        <button
                          onClick={() => manager.buy()}
                          className={`w-full py-1 px-2 rounded text-sm font-medium ${
                            canAfford 
                              ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                              : "bg-slate-700 text-slate-300 cursor-not-allowed"
                          }`}
                          disabled={!canAfford}
                        >
                          {canAfford ? (
                            <span className="flex items-center justify-center gap-1">
                              <Sparkles size={12} />
                              <span>{manager.cost}</span>
                            </span>
                          ) : (
                            <span>Can't afford</span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
                
                {state.managers.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-slate-400">
                    <p>No managers available yet</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
