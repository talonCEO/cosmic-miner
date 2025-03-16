import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createUpgrades, UPGRADE_CATEGORIES } from "@/utils/upgradesData";
import { calculateExperienceRequired, calculateLevel } from "@/utils/levelUpHandler";
import { createAchievements } from "@/utils/achievementsCreator";
import { StorageService } from "@/services/StorageService";

// Define types
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  cost: number;
  level: number;
  maxLevel: number;
  coinsPerSecondBonus: number;
  coinsPerClickBonus: number;
  unlocked: boolean;
  category: string;
  icon: string;
  multiplierBonus?: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  cooldown: number;
  duration: number;
  effect: {
    type: string;
    value: number;
  };
  icon: string;
  row: number;
  column: number;
  requiredLevel: number;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  bonus: string;
  avatar: string;
  cost: number;
  bonusType: string;
  bonusValue: number;
}

// Define achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  checkCondition: (state: GameState) => boolean;
}

// Define game state interface
export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  totalClicks: number;
  totalEarned: number;
  totalSpent: number;
  level: number;
  experience: number;
  experienceRequired: number;
  skillPoints: number;
  prestigeCount: number;
  prestigePoints: number;
  multiplier: number;
  autoBuy: boolean;
  upgrades: Upgrade[];
  abilities: Ability[];
  artifacts: Artifact[];
  ownedArtifacts: string[];
  unlockedPerks: string[];
  newAchievements: string[];
  activeBoosts: any[];
  gems: number;
  // Add any additional state properties needed
}

// Define game context interface
export interface GameContextType {
  state: GameState;
  increment: () => void;
  buyUpgrade: (upgradeId: string, quantity?: number) => void;
  unlockAbility: (abilityId: string) => void;
  activateAbility: (abilityId: string) => void;
  purchaseArtifact: (artifactId: string) => void;
  prestige: () => void;
  toggleAutoBuy: () => void;
  calculateMaxPurchaseAmount: (upgradeId: string) => number;
  addExperience: (amount: number) => void;
  unlockPerk: (perkId: string, parentId: string) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  buyBoost: (boostId: string) => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  resetGame: () => void;
}

// Create initial state
const initialState: GameState = {
  coins: 0,
  coinsPerClick: 1,
  coinsPerSecond: 0,
  totalClicks: 0,
  totalEarned: 0,
  totalSpent: 0,
  level: 1,
  experience: 0,
  experienceRequired: 100,
  skillPoints: 0,
  prestigeCount: 0,
  prestigePoints: 0,
  multiplier: 1,
  autoBuy: false,
  upgrades: createUpgrades(),
  abilities: [],
  artifacts: [],
  ownedArtifacts: [],
  unlockedPerks: [],
  newAchievements: [],
  activeBoosts: [],
  gems: 0
};

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>({...initialState});
  const [achievements, setAchievements] = useState<Achievement[]>(createAchievements());
  
  // Load game data
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Try to load from local storage
        const savedState = await StorageService.getData("gameState");
        
        if (savedState) {
          // Calculate level and experience required
          const level = calculateLevel(savedState.experience || 0);
          const experienceRequired = calculateExperienceRequired(level);
          
          setState({
            ...savedState,
            level,
            experienceRequired
          });
          
          console.log("Game state loaded from local storage");
        }
      } catch (error) {
        console.error("Error loading game state:", error);
      }
    };
    
    loadGameData();
  }, []);
  
  // Autosave game state
  useEffect(() => {
    const saveInterval = setInterval(() => {
      StorageService.saveData("gameState", state);
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [state]);
  
  // Actions
  const increment = useCallback(() => {
    setState(prevState => {
      const newCoins = prevState.coins + prevState.coinsPerClick;
      return {
        ...prevState,
        coins: newCoins,
        totalClicks: prevState.totalClicks + 1,
        totalEarned: prevState.totalEarned + prevState.coinsPerClick
      };
    });
  }, []);
  
  const buyUpgrade = useCallback((upgradeId: string, quantity: number = 1) => {
    setState(prevState => {
      const upgradeIndex = prevState.upgrades.findIndex(u => u.id === upgradeId);
      if (upgradeIndex === -1) return prevState;
      
      const upgrade = { ...prevState.upgrades[upgradeIndex] };
      
      let affordableQuantity = 0;
      let totalCost = 0;
      
      for (let i = 0; i < quantity; i++) {
        if (upgrade.level + i >= upgrade.maxLevel) break;
        
        const cost = upgrade.cost * Math.pow(1.08, upgrade.level + i);
        
        if (prevState.coins >= cost) {
          affordableQuantity++;
          totalCost += cost;
        } else {
          break;
        }
      }
      
      if (affordableQuantity === 0) return prevState;
      
      const updatedUpgrades = [...prevState.upgrades];
      const updatedUpgrade = { ...upgrade };
      
      updatedUpgrade.level += affordableQuantity;
      updatedUpgrade.cost = upgrade.baseCost * Math.pow(1.08, updatedUpgrade.level);
      
      if (updatedUpgrade.level >= updatedUpgrade.maxLevel) {
        updatedUpgrade.cost = 0;
      }
      
      updatedUpgrades[upgradeIndex] = updatedUpgrade;
      
      let newCoinsPerSecond = prevState.coinsPerSecond;
      let newCoinsPerClick = prevState.coinsPerClick;
      
      if (upgrade.category === UPGRADE_CATEGORIES.ELEMENT) {
        newCoinsPerSecond += upgrade.coinsPerSecondBonus * affordableQuantity;
      } else if (upgrade.category === UPGRADE_CATEGORIES.TAP) {
        newCoinsPerClick += upgrade.coinsPerClickBonus * affordableQuantity;
      }
      
      return {
        ...prevState,
        coins: prevState.coins - totalCost,
        coinsPerSecond: newCoinsPerSecond,
        coinsPerClick: newCoinsPerClick,
        totalSpent: prevState.totalSpent + totalCost,
        upgrades: updatedUpgrades
      };
    });
  }, []);
  
  const unlockAbility = useCallback((abilityId: string) => {
    setState(prevState => {
      const abilityIndex = prevState.abilities.findIndex(a => a.id === abilityId);
      if (abilityIndex === -1) return prevState;
      
      const ability = { ...prevState.abilities[abilityIndex] };
      if (prevState.skillPoints < ability.cost || ability.unlocked) return prevState;
      
      const updatedAbilities = [...prevState.abilities];
      const updatedAbility = { ...ability, unlocked: true };
      updatedAbilities[abilityIndex] = updatedAbility;
      
      return {
        ...prevState,
        skillPoints: prevState.skillPoints - ability.cost,
        abilities: updatedAbilities
      };
    });
  }, []);
  
  const activateAbility = useCallback((abilityId: string) => {
    setState(prevState => {
      const abilityIndex = prevState.abilities.findIndex(a => a.id === abilityId);
      if (abilityIndex === -1) return prevState;
      
      const ability = { ...prevState.abilities[abilityIndex] };
      if (!ability.unlocked) return prevState;
      
      // Implement ability effect logic here based on ability.effect.type
      // This is just a placeholder
      console.log(`Ability ${ability.name} activated!`);
      
      return prevState;
    });
  }, []);
  
  const purchaseArtifact = useCallback((artifactId: string) => {
    setState(prevState => {
      const artifact = prevState.artifacts.find(a => a.id === artifactId);
      if (!artifact || prevState.coins < artifact.cost || prevState.ownedArtifacts.includes(artifact.id)) {
        return prevState;
      }
      
      return {
        ...prevState,
        coins: prevState.coins - artifact.cost,
        ownedArtifacts: [...prevState.ownedArtifacts, artifact.id]
      };
    });
  }, []);
  
  const prestige = useCallback(() => {
    setState(prevState => {
      const prestigePoints = prevState.prestigePoints + 1;
      
      // Reset game state to initial state
      return {
        ...initialState,
        prestigeCount: prevState.prestigeCount + 1,
        prestigePoints: prestigePoints,
        coins: 500,
        coinsPerClick: 5,
        coinsPerSecond: 0,
        upgrades: createUpgrades(),
        abilities: [],
        artifacts: [],
        ownedArtifacts: [],
        unlockedPerks: [],
        newAchievements: [],
        activeBoosts: [],
        gems: prevState.gems
      };
    });
  }, []);
  
  const toggleAutoBuy = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      autoBuy: !prevState.autoBuy
    }));
  }, []);
  
  const calculateMaxPurchaseAmount = useCallback((upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    
    let affordableQuantity = 0;
    let totalCost = 0;
    
    for (let i = 0; i < upgrade.maxLevel - upgrade.level; i++) {
      const cost = upgrade.cost * Math.pow(1.08, upgrade.level + i);
      
      if (state.coins >= cost) {
        affordableQuantity++;
        totalCost += cost;
      } else {
        break;
      }
    }
    
    return affordableQuantity;
  }, [state.coins]);
  
  const addExperience = useCallback((amount: number) => {
    setState(prevState => {
      let newExperience = prevState.experience + amount;
      let newLevel = calculateLevel(newExperience);
      let skillPointsToAdd = newLevel - prevState.level > 0 ? newLevel - prevState.level : 0;
      
      return {
        ...prevState,
        experience: newExperience,
        level: newLevel,
        experienceRequired: calculateExperienceRequired(newLevel),
        skillPoints: prevState.skillPoints + skillPointsToAdd
      };
    });
  }, []);
  
  const unlockPerk = useCallback((perkId: string, parentId: string) => {
    setState(prevState => {
      if (prevState.unlockedPerks.includes(perkId)) return prevState;
      
      const perkCost =
        parentId === "manager-1"
          ? 3
          : parentId === "manager-2"
            ? 6
            : parentId === "manager-3"
              ? 12
              : 3;
      
      if (prevState.skillPoints >= perkCost) {
        return {
          ...prevState,
          skillPoints: prevState.skillPoints - perkCost,
          unlockedPerks: [...prevState.unlockedPerks, perkId]
        };
      } else {
        return prevState;
      }
    });
  }, []);
  
  const addCoins = useCallback((amount: number) => {
    setState(prevState => ({
      ...prevState,
      coins: prevState.coins + amount,
      totalEarned: prevState.totalEarned + amount
    }));
  }, []);
  
  const addGems = useCallback((amount: number) => {
    setState(prevState => ({
      ...prevState,
      gems: prevState.gems + amount
    }));
  }, []);
  
  const buyBoost = useCallback((boostId: string) => {
    setState(prevState => {
      // Find the boost in the available boosts
      const boost = prevState.activeBoosts.find(boost => boost.id === boostId);
      
      if (!boost) {
        console.warn(`Boost with id ${boostId} not found.`);
        return prevState;
      }
      
      if (prevState.gems < boost.cost) {
        console.warn(`Not enough gems to purchase boost ${boostId}.`);
        return prevState;
      }
      
      // Apply the boost effect
      let updatedState = { ...prevState };
      
      switch (boost.effect.type) {
        case 'coinsPerClick':
          updatedState.coinsPerClick += boost.effect.value;
          break;
        case 'coinsPerSecond':
          updatedState.coinsPerSecond += boost.effect.value;
          break;
        default:
          console.warn(`Unknown boost effect type: ${boost.effect.type}`);
          return prevState;
      }
      
      // Deduct the cost of the boost
      updatedState.gems -= boost.cost;
      
      // Remove the boost from available boosts (or handle duration if needed)
      const updatedBoosts = prevState.activeBoosts.filter(boost => boost.id !== boostId);
      updatedState.activeBoosts = updatedBoosts;
      
      return updatedState;
    });
  }, []);
  
  const saveGame = useCallback(async () => {
    try {
      await StorageService.saveData("gameState", state);
      console.log("Game saved");
      return Promise.resolve();
    } catch (error) {
      console.error("Error saving game:", error);
      return Promise.reject(error);
    }
  }, [state]);
  
  const loadGame = useCallback(async () => {
    try {
      const savedState = await StorageService.getData("gameState");
      if (savedState) {
        setState(savedState);
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error loading game:", error);
      return Promise.reject(error);
    }
  }, []);
  
  const resetGame = useCallback(() => {
    setState({...initialState});
    StorageService.saveData("gameState", initialState);
  }, []);
  
  // Check achievements
  useEffect(() => {
    const unlockedAchievements: string[] = [];
    
    achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.checkCondition(state)) {
        unlockedAchievements.push(achievement.id);
      }
    });
    
    if (unlockedAchievements.length > 0) {
      setAchievements(prevAchievements => 
        prevAchievements.map(achievement => 
          unlockedAchievements.includes(achievement.id)
            ? { ...achievement, unlocked: true }
            : achievement
        )
      );
      
      setState(prevState => ({
        ...prevState,
        newAchievements: [...prevState.newAchievements, ...unlockedAchievements]
      }));
    }
  }, [state.totalClicks, state.totalEarned, state.coinsPerSecond]);
  
  return (
    <GameContext.Provider
      value={{
        state,
        increment,
        buyUpgrade,
        unlockAbility,
        activateAbility,
        purchaseArtifact,
        prestige,
        toggleAutoBuy,
        calculateMaxPurchaseAmount,
        addExperience,
        unlockPerk,
        addCoins,
        addGems,
        buyBoost,
        saveGame,
        loadGame,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

// For backward compatibility
export const useGameContext = useGame;
