
import React from 'react';
import { GraduationCap, ShoppingBasket, Network, Users, Package } from 'lucide-react';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuType } from './types';
import MuteButton from '../MuteButton';
import { useGame } from '@/context/GameContext';

interface MainMenuProps {
  setMenuType: (menuType: MenuType) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ setMenuType }) => {
  const { state, dispatch } = useGame();
  
  return (
    <>
      <DialogHeader className="p-4 border-b border-indigo-500/20 relative">
        <div className="absolute top-4 left-4">
          <MuteButton />
        </div>
        <DialogTitle className="text-center text-xl">Game Menu</DialogTitle>
        <DialogDescription className="text-center text-slate-300">
          Select an option to continue
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-[50vh]">
        <div className="flex flex-col p-4 gap-3">
          <button 
            onClick={() => setMenuType("profile")} 
            className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Users size={20} />
            <span>Profile</span>
          </button>
          
          <button 
            onClick={() => setMenuType("inventory")} 
            className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Package size={20} />
            <span>Inventory</span>
          </button>
          
          <button 
            onClick={() => setMenuType("techTree")} 
            className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Network size={20} />
            <span>Tech Tree</span>
          </button>
          
          <button 
            onClick={() => setMenuType("prestige")} 
            className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <GraduationCap size={20} />
            <span>Prestige</span>
          </button>
          
          <button 
            onClick={() => setMenuType("shop")} 
            className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBasket size={20} />
            <span>Shop</span>
          </button>
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-indigo-500/20">
        <DialogClose className="w-full bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default MainMenu;
