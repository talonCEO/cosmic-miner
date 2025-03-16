
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { MenuType } from './menu/types';
import MenuButton from './menu/MenuButton';
import MainMenu from './menu/MainMenu';
import Achievements from './menu/Achievements';
import Prestige from './menu/Prestige';
import Shop from './menu/Shop';
import TechTree from './menu/TechTree';
import PremiumStore from './menu/PremiumStore';
import Profile from './menu/Profile';
import Inventory from './menu/Inventory';
import Leaderboard from './menu/Leaderboard';

interface GameMenuProps {
  menuType?: 'main' | 'premium';
}

const GameMenu: React.FC<GameMenuProps> = ({ menuType: buttonType = 'main' }) => {
  const { state, prestige, calculatePotentialEssenceReward, buyManager, buyArtifact } = useGame();
  const [activeMenuType, setActiveMenuType] = useState<MenuType>("none");
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset to main menu when dialog is closed externally
      setActiveMenuType("none");
    }
  };
  
  const handleButtonClick = () => {
    if (buttonType === 'main') {
      setActiveMenuType("main");
    } else if (buttonType === 'premium') {
      setActiveMenuType("premium");
    }
  };
  
  const handlePrestige = () => {
    const essenceReward = calculatePotentialEssenceReward();
    prestige();
    setActiveMenuType("none");
  };

  const handleBuyManager = (managerId: string, name: string) => {
    buyManager(managerId);
  };

  const handleBuyArtifact = (artifactId: string, name: string) => {
    buyArtifact(artifactId);
  };
  
  // Handle buying gem packages via Google Play
  const handleBuyGemPackage = async (packageId: string, amount: number) => {
    try {
      // In a real implementation with Capacitor, this would use a plugin like
      // @capacitor/google-play-billing or similar to initiate a purchase
      
      // For now, simulate a successful purchase
      console.log(`Initiating Google Play purchase for package: ${packageId}`);
      
      // After successful purchase, update the gems through the GameContext
      // The actual update happens in PremiumStore when showGemUnlockAnimation is called
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const potentialEssenceReward = calculatePotentialEssenceReward();
  
  // Handler for menu type changes from subcomponents
  const handleMenuChange = (menuType: MenuType) => {
    setActiveMenuType(menuType);
  };
  
  return (
    <Dialog onOpenChange={handleOpenChange} open={activeMenuType !== "none"}>
      <MenuButton 
        variant={buttonType === 'premium' ? 'premium' : 'default'} 
        onClick={handleButtonClick} 
      />
      
      <DialogContent className="sm:max-w-md backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white z-[9999]">
        {activeMenuType === "main" && (
          <MainMenu setMenuType={handleMenuChange} />
        )}
        
        {activeMenuType === "profile" && (
          <Profile setMenuType={handleMenuChange} />
        )}
        
        {activeMenuType === "achievements" && (
          <Achievements achievements={state.achievements || []} />
        )}
        
        {activeMenuType === "leaderboard" && (
          <Leaderboard />
        )}
        
        {activeMenuType === "inventory" && (
          <Inventory />
        )}
        
        {activeMenuType === "techTree" && (
          <TechTree />
        )}
        
        {activeMenuType === "prestige" && (
          <Prestige 
            potentialEssenceReward={potentialEssenceReward} 
            handlePrestige={handlePrestige} 
          />
        )}
        
        {activeMenuType === "shop" && (
          <Shop 
            essence={state.essence}
            managers={state.managers || []}
            artifacts={state.artifacts || []}
            ownedManagers={state.ownedManagers || []}
            ownedArtifacts={state.ownedArtifacts || []}
            onBuyManager={handleBuyManager}
            onBuyArtifact={handleBuyArtifact}
          />
        )}
        
        {activeMenuType === "premium" && (
          <PremiumStore 
            onBuyGemPackage={handleBuyGemPackage}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
