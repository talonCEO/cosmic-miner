
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Trophy, Star, Rocket, Store, Brain, Gem, 
  Settings, User, Package
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { MainMenuProps } from '@/utils/types';
import { MenuType } from './types';

const MainMenu: React.FC<MainMenuProps> = ({ setMenuType }) => {
  const { state, dispatch } = useGame();
  
  const handleMenuChange = (menuType: MenuType) => {
    setMenuType(menuType);
  };
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20">
        <DialogTitle className="text-center text-xl">Deep Space Mining Corp.</DialogTitle>
      </DialogHeader>
      <div className="p-4 grid grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("profile")}
        >
          <User className="h-6 w-6 mb-1 text-blue-400" />
          <span className="text-xs">Profile</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("achievements")}
        >
          <Trophy className="h-6 w-6 mb-1 text-yellow-400" />
          <span className="text-xs">Achievements</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("leaderboard")}
        >
          <Star className="h-6 w-6 mb-1 text-purple-400" />
          <span className="text-xs">Ranks</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("inventory")}
        >
          <Package className="h-6 w-6 mb-1 text-amber-400" />
          <span className="text-xs">Inventory</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("shop")}
        >
          <Store className="h-6 w-6 mb-1 text-green-400" />
          <span className="text-xs">Shop</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("techTree")}
        >
          <Brain className="h-6 w-6 mb-1 text-indigo-400" />
          <span className="text-xs">Tech Tree</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("prestige")}
        >
          <Rocket className="h-6 w-6 mb-1 text-red-400" />
          <span className="text-xs">Prestige</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("premium")}
        >
          <Gem className="h-6 w-6 mb-1 text-pink-400" />
          <span className="text-xs">Premium</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/50"
          onClick={() => handleMenuChange("settings")}
        >
          <Settings className="h-6 w-6 mb-1 text-slate-400" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </>
  );
};

export default MainMenu;
