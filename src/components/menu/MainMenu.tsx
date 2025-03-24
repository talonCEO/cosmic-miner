
import React from 'react';
import { 
  Trophy, 
  BarChart3, 
  Package, 
  Scroll, 
  Atom,
  GemIcon,
  UserCircle,
  TicketIcon,
  Globe
} from "lucide-react";
import { useGame } from '@/context/GameContext';
import { MenuType } from './types';

interface MainMenuProps {
  setMenuType: (menuType: MenuType) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ setMenuType }) => {
  const { state } = useGame();
  
  // Check if the worlds feature is unlocked
  const isWorldsUnlocked = state.worlds.some((world, index) => index > 0 && world.unlocked);
  
  return (
    <div className="space-y-6 px-6 py-4">
      <h2 className="text-2xl font-bold text-center">Menu</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <MenuButton
          icon={<UserCircle />}
          label="Profile"
          onClick={() => setMenuType("profile")}
        />
        
        <MenuButton
          icon={<Trophy />}
          label="Achievements"
          onClick={() => setMenuType("achievements")}
        />
        
        <MenuButton
          icon={<BarChart3 />}
          label="Leaderboard"
          onClick={() => setMenuType("leaderboard")}
        />
        
        <MenuButton
          icon={<Package />}
          label="Inventory"
          onClick={() => setMenuType("inventory")}
        />
        
        <MenuButton
          icon={<Atom />}
          label="Tech Tree"
          onClick={() => setMenuType("techTree")}
        />
        
        <MenuButton
          icon={<Scroll />}
          label="Prestige"
          onClick={() => setMenuType("prestige")}
        />
        
        <MenuButton
          icon={<TicketIcon />}
          label="Shop"
          onClick={() => setMenuType("shop")}
        />
        
        <MenuButton
          icon={<GemIcon />}
          label="Premium"
          onClick={() => setMenuType("premium")}
        />
        
        {isWorldsUnlocked && (
          <MenuButton
            icon={<Globe />}
            label="Worlds"
            onClick={() => setMenuType("worlds")}
            new={true}
          />
        )}
      </div>
    </div>
  );
};

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  new?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, onClick, new: isNew }) => {
  return (
    <button
      className="flex flex-col items-center justify-center space-y-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg p-3 transition-colors relative"
      onClick={onClick}
    >
      <div className="text-indigo-400">
        {icon}
      </div>
      <span className="text-sm">{label}</span>
      
      {isNew && (
        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          NEW
        </div>
      )}
    </button>
  );
};

export default MainMenu;
