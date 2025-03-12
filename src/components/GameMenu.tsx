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
import UnlockAnimation from './UnlockAnimation';
import { Sparkles, Shield, Zap, Star, Gem, X } from 'lucide-react';

interface GameMenuProps {
  menuType?: 'main' | 'premium';
}

const GameMenu: React.FC<GameMenuProps> = ({ menuType: buttonType = 'main' }) => {
  const { state, prestige, calculatePotentialEssenceReward, buyManager, buyArtifact } = useGame();
  const [menuType, setMenuType] = useState<MenuType>("none");
  const [playerGems, setPlayerGems] = useState<number>(500); // Start with 500 gems for testing
  const [boostItems, setBoostItems] = useState<BoostItemType[]>([]);
  
  // Animation state
  const [unlockAnimation, setUnlockAnimation] = useState<{
    show: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
    imageSrc?: string;
  }>({
    show: false,
    title: "",
    description: "",
    icon: <Star className="h-12 w-12" />
  });
  
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
  
  const showUnlockAnimation = (title: string, description: string, icon: React.ReactNode, imageSrc?: string) => {
    setUnlockAnimation({
      show: true,
      title,
      description,
      icon,
      imageSrc
    });
  };
  
  const hideUnlockAnimation = () => {
    setUnlockAnimation(prev => ({
      ...prev,
      show: false
    }));
  };
  
  const handlePrestige = () => {
    const essenceReward = calculatePotentialEssenceReward();
    
    prestige();
    setMenuType("none");
    
    showUnlockAnimation(
      "Prestige Complete!",
      `Gained ${essenceReward} essence. All progress has been reset.`,
      <Sparkles className="h-12 w-12" />
    );
  };

  const handleBuyManager = (managerId: string, name: string, description: string) => {
    buyManager(managerId);
    
    // Find the manager to get its avatar for the animation
    const manager = state.managers.find(m => m.id === managerId);
    
    showUnlockAnimation(
      `${name} Hired!`,
      description || "Manager added to your team.",
      <Shield className="h-12 w-12" />,
      manager?.avatar
    );
  };

  const handleBuyArtifact = (artifactId: string, name: string, description: string) => {
    buyArtifact(artifactId);
    
    // Find the artifact to get its avatar for the animation
    const artifact = state.artifacts.find(a => a.id === artifactId);
    
    showUnlockAnimation(
      `${name} Acquired!`,
      description || "Artifact added to your collection.",
      <Zap className="h-12 w-12" />,
      artifact?.avatar
    );
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
      
      // Show animation instead of toast
      showUnlockAnimation(
        `${amount} Gems Purchased!`,
        `Gems have been added to your account.`,
        <Gem className="h-12 w-12" />
      );
    } catch (error) {
      console.error('Purchase failed:', error);
      // Show error animation
      showUnlockAnimation(
        "Purchase Failed",
        "There was an error processing your purchase.",
        <X className="h-12 w-12 text-red-500" />
      );
    }
  };

  // Handle buying boost items
  const handleBuyBoostItem = (itemId: string) => {
    const item = boostItems.find(item => item.id === itemId);
    if (!item || !item.purchasable) return;
    
    // Check if player has enough gems
    if (playerGems < item.cost) {
      showUnlockAnimation(
        "Not Enough Gems",
        `You need ${item.cost - playerGems} more gems to purchase this.`,
        <Gem className="h-12 w-12 text-red-500" />
      );
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
    
    // Show animation for the boost item
    showUnlockAnimation(
      item.name,
      item.effect,
      <Star className="h-12 w-12" />,
      item.imageSrc
    );
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
      
      {/* Global Animation Popup */}
      <UnlockAnimation
        show={unlockAnimation.show}
        title={unlockAnimation.title}
        description={unlockAnimation.description}
        icon={unlockAnimation.icon}
        imageSrc={unlockAnimation.imageSrc}
        onClose={hideUnlockAnimation}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </Dialog>
  );
};

export default GameMenu;
