
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
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
import Inventory from './menu/Inventory';
import Leaderboard from './menu/Leaderboard';

interface GameMenuProps {
  menuType?: 'main' | 'premium';
}

const GameMenu: React.FC<GameMenuProps> = ({ menuType: buttonType = 'main' }) => {
  const { state, prestige, calculatePotentialEssenceReward, buyManager, buyArtifact } = useGame();
  const [activeMenuType, setActiveMenuType] = useState<MenuType>("none");
  const [playerGems, setPlayerGems] = useState<number>(500); // Start with 500 gems for testing
  const [boostItems, setBoostItems] = useState<BoostItemType[]>([]);
  
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
      
      // After successful purchase, update the gems
      setPlayerGems(prev => prev + amount);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  // Handle buying boost items
  const handleBuyBoostItem = (itemId: string) => {
    const item = boostItems.find(item => item.id === itemId);
    if (!item || !item.purchasable) return;
    
    // Check if player has enough gems
    if (playerGems < item.cost) {
      return;
    }
    
    // For the "No Ads" item, mark it as permanently purchased
    if (item.id === 'boost_no_ads') {
      setBoostItems(items => 
        items.map(i => 
          i.id === itemId 
            ? { ...i, purchased: true, purchasable: false } 
            : i
        )
      );
    } else {
      // For other items, mark as purchased and set refresh time
      const refreshTime = Date.now() + (8 * 60 * 60 * 1000);
      
      setBoostItems(items => 
        items.map(i => 
          i.id === itemId 
            ? { ...i, purchased: true, purchasable: false, refreshTime } 
            : i
        )
      );
    }
    
    // Deduct gems
    setPlayerGems(prev => prev - item.cost);
    
    // Apply the boost effect (in a real implementation)
    // This would modify game state based on the item's effect
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
