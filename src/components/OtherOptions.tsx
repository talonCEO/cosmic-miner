
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

const OtherOptions: React.FC = () => {
  const { state, prestige, calculateEssenceReward } = useGame();
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
  
  const potentialEssenceReward = calculateEssenceReward(state.totalEarned);
  
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
            <div className="p-6">
              <p className="text-center text-slate-500">Achievements coming soon!</p>
              <p className="text-center text-sm text-slate-400 mt-2">
                Unlock achievements as you progress in the game.
              </p>
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
          
          <DialogContent className="sm:max-w-md bg-white rounded-xl p-0 border-none shadow-xl">
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Shop</DialogTitle>
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OtherOptions;
