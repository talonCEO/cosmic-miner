
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent
} from "@/components/ui/dialog";
import { useGame } from '@/context/GameContext';
import { MenuType } from './menu/types';
import { BoostItem as BoostItemType, initialBoostItems } from './menu/types/premiumStore';
import { useFirebase } from '@/context/FirebaseContext';
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
  const { syncUserData } = useFirebase();
  const [activeMenuType, setActiveMenuType] = useState<MenuType>("none");
  const [boostItems, setBoostItems] = useState<BoostItemType[]>([]);
  
  // Initialize boost items with icons on component mount
  useEffect(() => {
    // In a real implementation, this would load from persistent storage
    if (boostItems.length === 0) {
      setBoostItems(initialBoostItems);
    }
  }, [boostItems.length]);
  
  // Sync game data periodically
  useEffect(() => {
    if (syncUserData) {
      // Initial sync
      syncUserData();
    }
  }, [syncUserData]);
  
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
    
    // Sync with Firebase after prestige
    if (syncUserData) {
      syncUserData();
    }
    
    setActiveMenuType("none");
  };

  const handleBuyManager = (managerId: string, name: string) => {
    buyManager(managerId);
    
    // Sync with Firebase after purchase
    if (syncUserData) {
      syncUserData();
    }
  };

  const handleBuyArtifact = (artifactId: string, name: string) => {
    buyArtifact(artifactId);
    
    // Sync with Firebase after purchase
    if (syncUserData) {
      syncUserData();
    }
  };

  // Handle buying boost items
  const handleBuyBoostItem = (itemId: string) => {
    const item = boostItems.find(item => item.id === itemId);
    if (!item || !item.purchasable) return;
    
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
    
    // Apply the boost effect (in a real implementation)
    // This would modify game state based on the item's effect
    
    // Sync with Firebase after purchase
    if (syncUserData) {
      syncUserData();
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
            boostItems={boostItems}
            onBuyBoostItem={handleBuyBoostItem}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameMenu;
