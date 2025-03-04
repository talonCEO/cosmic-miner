
import React from 'react';
import { Award, ArrowUp, ShoppingBag } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { MenuType } from '@/components/GameMenu';

const OtherOptions: React.FC = () => {
  const [menuType, setMenuType] = React.useState<MenuType>("none");
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMenuType("none");
    }
  };
  
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
            <div className="p-6">
              <p className="text-center text-slate-500">Prestige system coming soon!</p>
              <p className="text-center text-sm text-slate-400 mt-2">
                Reset your progress for permanent bonuses.
              </p>
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
                Purchase special items and upgrades.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OtherOptions;
