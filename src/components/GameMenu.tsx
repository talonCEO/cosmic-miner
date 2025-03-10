import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { MenuType } from './menu/types';
import MenuButton from './menu/MenuButton';
import MainMenu from './menu/MainMenu';
import Achievements from './menu/Achievements';
import Prestige from './menu/Prestige';
import Shop from './menu/Shop';
import TechTree from './menu/TechTree';
import PremiumStore from './menu/PremiumStore';

const GameMenu: React.FC = () => {
  const { state, prestige, calculatePotentialEssenceReward, buyManager, buyArtifact } = useGame();
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
    const essenceReward = calculatePotentialEssenceReward();
    
    prestige();
    setMenuType("none");
    
    toast({
      title: "Prestige Complete!",
      description: `Gained ${essenceReward} essence. All progress has been reset.`,
      variant: "default",
    });
  };

  const handleBuyManager = (managerId: string, name: string) => {
    buyManager(managerId);
    
    toast({
      title: `${name} Hired!`,
      description: `Manager added to your team.`,
      variant: "default",
    });
  };

  const handleBuyArtifact = (artifactId: string, name: string) => {
    buyArtifact(artifactId);
    
    toast({
      title: `${name} Acquired!`,
      description: `Artifact added to your collection.`,
      variant: "default",
    });
  };
  
  const potentialEssenceReward = calculatePotentialEssenceReward();
  
  return (
    <Dialog onOpenChange={handleOpenChange} open={menuType !== "none"}>
      <div className="space-y-2">
        <MenuButton />
        <MenuButton variant="premium" onClick={() => setMenuType("premium")} />
      </div>
      
      <DialogContent className="sm:max-w-md backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white z-[9999]">
        {menuType === "main" && (
          <MainMenu setMenuType={setMenuType} />
        )}
        
        {menuType === "achievements" && (
          <Achievements achievements={state.achievements} />
        )}
        
        {menuType === "techTree" && (
          <TechTree />
        )}
        
        {menuType === "prestige" && (
          <Prestige 
            potentialEssenceReward={potentialEssenceReward} 
            handlePrestige={handlePrestige} 
          />
        )}
        
        {menuType === "shop" && (
          <Shop 
            essence={state.essence}
            managers={state.managers}
            artifacts={state.artifacts}
            ownedManagers={state.ownedManagers}
            ownedArtifacts={state.ownedArtifacts}
            onBuyManager={handleBuyManager}
            onBuyArtifact={handleBuyArtifact}
          />
        )}
        
        {menuType === "premium" && (
          <PremiumStore />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
