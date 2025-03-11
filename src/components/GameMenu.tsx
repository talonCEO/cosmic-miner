
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { MenuType } from './menu/types';
import { BoostItem as BoostItemType, initialBoostItems } from './menu/types/premiumStore';
import MenuButton from './menu/MenuButton';
import MainMenu from './menu/MainMenu';
import Achievements from './menu/Achievements';
import Prestige from './menu/Prestige';
import Shop from './menu/Shop';
import TechTree from './menu/TechTree';
import PremiumStore from './menu/PremiumStore';
import Profile from './menu/Profile';

interface GameMenuProps {
  menuType?: 'main' | 'premium';
}

const GameMenu: React.FC<GameMenuProps> = ({ menuType: buttonType = 'main' }) => {
  const { state, prestige, calculatePotentialEssenceReward, buyManager, buyArtifact } = useGame();
  const [menuType, setMenuType] = useState<MenuType>("none");
  const [playerGems, setPlayerGems] = useState<number>(500); // Start with 500 gems for testing
  const [boostItems, setBoostItems] = useState<BoostItemType[]>([]);
  const { toast } = useToast();
  
  // Initialize boost items with icons on component mount
  useEffect(() => {
    // We'll initialize the boost items here
    // In a real implementation, this would load from persistent storage
    if (boostItems.length === 0) {
      setBoostItems(initialBoostItems);
    }
  }, [boostItems.length]);
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset to main menu when dialog is closed externally
      setMenuType("none");
    }
  };
  
  const handleButtonClick = () => {
    if (buttonType === 'main') {
      setMenuType("main");
    } else if (buttonType === 'premium') {
      setMenuType("premium");
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
  
  // Handle buying gem packages via Google Play
  const handleBuyGemPackage = async (packageId: string, amount: number) => {
    try {
      // In a real implementation with Capacitor, this would use a plugin like
      // @capacitor/google-play-billing or similar to initiate a purchase
      
      // For now, simulate a successful purchase
      console.log(`Initiating Google Play purchase for package: ${packageId}`);
      
      // After successful purchase, update the gems
      setPlayerGems(prev => prev + amount);
      
      toast({
        title: "Gems Purchased!",
        description: `${amount} gems have been added to your account.`,
      });
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase.",
        variant: "destructive",
      });
    }
  };

  // Handle buying boost items
  const handleBuyBoostItem = (itemId: string) => {
    const item = boostItems.find(item => item.id === itemId);
    if (!item || !item.purchasable) return;
    
    // Check if player has enough gems
    if (playerGems < item.cost) {
      toast({
        title: "Not Enough Gems",
        description: `You need ${item.cost - playerGems} more gems to purchase this.`,
        variant: "destructive",
      });
      return;
    }
    
    // Mark the item as purchased and no longer purchasable
    // Set refresh time to 8 hours from now
    const refreshTime = Date.now() + (8 * 60 * 60 * 1000);
    
    setBoostItems(items => 
      items.map(i => 
        i.id === itemId 
          ? { ...i, purchased: true, purchasable: false, refreshTime } 
          : i
      )
    );
    
    // Deduct gems
    setPlayerGems(prev => prev - item.cost);
    
    // Apply the boost effect (in a real implementation)
    // This would modify game state based on the item's effect
    
    toast({
      title: `${item.name} Activated!`,
      description: `${item.effect} has been applied to your game.`,
    });
  };
  
  const potentialEssenceReward = calculatePotentialEssenceReward();
  
  return (
    <Dialog onOpenChange={handleOpenChange} open={menuType !== "none"}>
      <MenuButton 
        variant={buttonType === 'premium' ? 'premium' : 'default'} 
        onClick={handleButtonClick} 
      />
      
      <DialogContent className="sm:max-w-md backdrop-blur-sm bg-slate-900/90 border-indigo-500/30 rounded-xl p-0 border shadow-xl text-white z-[9999]">
        {menuType === "main" && (
          <MainMenu setMenuType={setMenuType} />
        )}
        
        {menuType === "profile" && (
          <Profile />
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
          <PremiumStore 
            playerGems={playerGems}
            boostItems={boostItems}
            onBuyGemPackage={handleBuyGemPackage}
            onBuyBoostItem={handleBuyBoostItem}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
