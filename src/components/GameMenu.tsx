
import React, { useState } from 'react';
import { Menu, X, Award, ArrowUp, ShoppingBag } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export type MenuType = "main" | "achievements" | "prestige" | "shop" | "none";

const GameMenu: React.FC = () => {
  const [menuType, setMenuType] = useState<MenuType>("none");
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset to main menu when dialog is closed externally
      setMenuType("none");
    } else if (menuType === "none") {
      // When opening, ensure we start with main menu
      setMenuType("main");
    }
  };
  
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
            <div className="p-6">
              <p className="text-center text-slate-500">Prestige system coming soon!</p>
              <p className="text-center text-sm text-slate-400 mt-2">
                Reset your progress for permanent bonuses.
              </p>
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
                Purchase special items and upgrades.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
