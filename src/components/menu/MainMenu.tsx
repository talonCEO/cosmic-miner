
import React from 'react';
import { Award, GraduationCap, ShoppingBasket, GitBranch } from 'lucide-react';
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MenuType } from './types';

interface MainMenuProps {
  setMenuType: (menuType: MenuType) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ setMenuType }) => {
  return (
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
          onClick={() => setMenuType("techTree")} 
          className="bg-indigo-600/80 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <GitBranch size={20} />
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
        <DialogClose className="bg-slate-700/80 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors mt-2">
          Back
        </DialogClose>
      </div>
    </>
  );
};

export default MainMenu;
