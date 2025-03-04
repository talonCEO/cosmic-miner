
import React from 'react';
import { Award, ArrowUp, ShoppingBag, Sparkles } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { MenuType } from '@/components/GameMenu';
import { useGame } from '@/context/GameContext';
import { formatNumber } from '@/utils/gameLogic';
import { useToast } from '@/components/ui/use-toast';
import { managers } from '@/utils/managersData';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const OtherOptions: React.FC = () => {
  const { state, prestige, calculateEssenceReward, buyManager } = useGame();
  const [menuType, setMenuType] = React.useState<MenuType>("none");
  const { toast } = useToast();
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMenuType("none");
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
  
  const handleBuyManager = (managerId: string, cost: number, name: string) => {
    buyManager(managerId);
    
    toast({
      title: `${name} Hired!`,
      description: `Manager added to your team.`,
      variant: "default",
    });
  };
  
  const potentialEssenceReward = calculateEssenceReward(state.totalEarned);
  
  // Calculate achievement progress
  const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
  const totalAchievements = state.achievements.length;
  const achievementProgress = totalAchievements > 0 ? 
    Math.round((unlockedAchievements / totalAchievements) * 100) : 0;
  
  return (
    <div className="w-full max-w-md mx-auto pb-8">
      <h2 className="text-lg font-medium mb-4 text-center">Game Options</h2>
      
      <div className="flex flex-col gap-3">
        <Dialog onOpenChange={handleOpenChange} open={menuType === "achievements"}>
          <DialogTrigger asChild>
            <button 
              onClick={() => setMenuType("achievements")}
              className="bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <Award size={20} />
              <span>Achievements</span>
            </button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md bg-white rounded-xl p-0 border-none shadow-xl">
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Achievements</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${achievementProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center text-slate-500 mb-4">
                {unlockedAchievements} of {totalAchievements} achievements unlocked ({achievementProgress}%)
              </p>
              
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                {state.achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`flex items-start gap-4 p-3 border-b border-slate-200 transition-opacity ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}
                  >
                    <div className="rounded-lg bg-indigo-100 p-2 h-12 w-12 flex items-center justify-center flex-shrink-0">
                      <Award size={24} className={`${achievement.unlocked ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold">{achievement.name}</h3>
                      <p className="text-sm text-slate-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog onOpenChange={handleOpenChange} open={menuType === "prestige"}>
          <DialogTrigger asChild>
            <button 
              onClick={() => setMenuType("prestige")}
              className="bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowUp size={20} />
              <span>Prestige</span>
            </button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md bg-white rounded-xl p-0 border-none shadow-xl">
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Prestige</DialogTitle>
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
          </DialogContent>
        </Dialog>
        
        <Dialog onOpenChange={handleOpenChange} open={menuType === "shop"}>
          <DialogTrigger asChild>
            <button 
              onClick={() => setMenuType("shop")}
              className="bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              <span>Shop</span>
            </button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md bg-white rounded-xl p-0 border-none shadow-xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Managers Shop</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="flex items-center justify-center mb-4">
                <Sparkles size={16} className="text-purple-500 mr-1" />
                <p className="text-lg font-medium text-purple-500">{formatNumber(state.essence)} Essence Available</p>
              </div>
              
              <div className="overflow-y-auto max-h-[60vh] pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {managers.map((manager) => {
                    const isOwned = state.ownedManagers.includes(manager.id);
                    const canAfford = state.essence >= manager.cost;
                    
                    return (
                      <div 
                        key={manager.id}
                        className={`border rounded-lg p-4 transition-all ${isOwned ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-16 w-16 rounded-xl">
                            <AvatarImage src={manager.avatar} alt={manager.name} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-500 rounded-xl">
                              {manager.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800">{manager.name}</h3>
                            <p className="text-xs text-indigo-500 mt-1">{manager.bonus}</p>
                            
                            {!isOwned ? (
                              <div className="mt-2 flex justify-between items-center">
                                <div className="flex items-center">
                                  <Sparkles size={12} className="text-purple-500 mr-1" />
                                  <span className="text-sm font-medium">{formatNumber(manager.cost)}</span>
                                </div>
                                
                                <button
                                  onClick={() => handleBuyManager(manager.id, manager.cost, manager.name)}
                                  disabled={!canAfford}
                                  className={`px-3 py-1 rounded text-xs font-medium 
                                    ${canAfford 
                                      ? 'bg-purple-500 text-white hover:bg-purple-600' 
                                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                                >
                                  Buy
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-green-500 mt-2 font-medium">Owned</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OtherOptions;
