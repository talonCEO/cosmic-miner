import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Perks, SpaceObject, Skill, Boost, Manager } from '../utils/types';
import useInterval from '../hooks/useInterval';
import upgradesData from '../utils/upgradesData';
import managersData from '../utils/managersData';
import { defaultGameState } from '../data/playerProgressionData';
import { StorageService } from '../services/StorageService';
// import { toast } from "sonner"; // Removing the toast import

interface GameContextProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  activePerk: Perks | null;
  setActivePerk: React.Dispatch<React.SetStateAction<Perks | null>>;
  calculateIncome: () => void;
  handleClick: () => void;
  buyUpgrade: (id: number) => void;
  buyManager: (id: number) => void;
  purchaseTechTreeItem: (skill: Skill) => void;
  addCurrency: (amount: number) => void;
  addDarkMatter: (amount: number) => void;
  prestige: () => void;
  lastUpdated: number;
  setLastUpdated: React.Dispatch<React.SetStateAction<number>>;
  purchaseInventoryItem: (item: any) => void;
  applyBoost: (boost: Boost) => void;
  selectPlanet: (planet: SpaceObject) => void;
  openChest: () => void;
  saveGame: () => void;
  addGems: (amount: number) => void;
  showDrillAnimation: boolean;
  setShowDrillAnimation: React.Dispatch<React.SetStateAction<boolean>>;
  activeBoosts: Boost[];
}

const GameContext = createContext<GameContextProps>({} as GameContextProps);

export const useGameContext = () => {
  return useContext(GameContext);
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [activePerk, setActivePerk] = useState<Perks | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [showDrillAnimation, setShowDrillAnimation] = useState<boolean>(false);
  const [activeBoosts, setActiveBoosts] = useState<Boost[]>([]);

  const gameStateRef = useRef(gameState);
  const activeBoostsRef = useRef(activeBoosts);

  // Update ref when state changes
  useEffect(() => {
    gameStateRef.current = gameState;
    activeBoostsRef.current = activeBoosts;
  }, [gameState, activeBoosts]);

  const saveGame = useCallback(async () => {
    try {
      await StorageService.saveGameState(gameState);
      console.log('Game saved successfully');
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [gameState]);

  // Load game from storage on mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        const savedState = await StorageService.loadGameState();
        if (savedState) {
          // Merge saved state with default state to ensure all properties exist
          setGameState(prevState => ({
            ...prevState,
            ...savedState,
          }));
          console.log('Game loaded successfully');
        }
      } catch (error) {
        console.error('Error loading game state:', error);
      }
    };

    loadGame();
  }, []);

  // Autosave every 30 seconds
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      saveGame();
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [saveGame]);

  const calculateIncome = useCallback(() => {
    let totalIncome = 0;
    
    // Base income calculation
    gameState.upgrades.forEach(upgrade => {
      if (upgrade.owned > 0) {
        const baseIncomePerSecond = upgrade.baseIncome * upgrade.owned;
        const multiplier = upgrade.multiplier * (1 + (gameState.prestigeMultiplier - 1));
        
        // Apply tech tree multipliers
        let techMultiplier = 1;
        gameState.techTree.forEach(skill => {
          if (skill.purchased && skill.upgradeIdAffected === upgrade.id) {
            techMultiplier *= skill.multiplier;
          }
        });
        
        totalIncome += baseIncomePerSecond * multiplier * techMultiplier;
      }
    });
    
    // Apply active boosts
    activeBoostsRef.current.forEach(boost => {
      if (boost.type === 'income') {
        totalIncome *= boost.multiplier;
      }
    });
    
    // Apply selected planet multiplier
    if (gameState.selectedPlanet) {
      totalIncome *= gameState.selectedPlanet.multiplier;
    }
    
    return totalIncome;
  }, [gameState.upgrades, gameState.prestigeMultiplier, gameState.techTree, gameState.selectedPlanet]);

  // Update currency based on income
  useInterval(() => {
    const now = Date.now();
    const timeDiff = (now - lastUpdated) / 1000; // Convert to seconds
    
    const income = calculateIncome();
    const incomeForPeriod = income * timeDiff;
    
    setGameState(prevState => ({
      ...prevState,
      currency: prevState.currency + incomeForPeriod
    }));
    
    setLastUpdated(now);
    
    // Process active boosts
    if (activeBoosts.length > 0) {
      const updatedBoosts = activeBoosts.filter(boost => {
        // Subtract elapsed time from remaining duration
        const remainingDuration = boost.duration - timeDiff;
        // Keep boosts that still have time left
        return remainingDuration > 0;
      }).map(boost => ({
        ...boost,
        duration: boost.duration - timeDiff
      }));
      
      setActiveBoosts(updatedBoosts);
    }
  }, 1000);

  const handleClick = useCallback(() => {
    let clickValue = gameState.clickValue;
    
    // Apply tech tree click multipliers
    gameState.techTree.forEach(skill => {
      if (skill.purchased && skill.type === 'click') {
        clickValue *= skill.multiplier;
      }
    });
    
    // Apply active boosts
    activeBoostsRef.current.forEach(boost => {
      if (boost.type === 'click') {
        clickValue *= boost.multiplier;
      }
    });
    
    setGameState(prevState => ({
      ...prevState,
      currency: prevState.currency + clickValue,
      totalClicks: prevState.totalClicks + 1
    }));
    
    // Show animation
    setShowDrillAnimation(true);
    setTimeout(() => setShowDrillAnimation(false), 300);
  }, [gameState.clickValue, gameState.techTree]);

  const buyUpgrade = useCallback((id: number) => {
    setGameState(prevState => {
      const upgrades = [...prevState.upgrades];
      const upgradeIndex = upgrades.findIndex(u => u.id === id);
      
      if (upgradeIndex === -1) return prevState;
      
      const upgrade = upgrades[upgradeIndex];
      const cost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned);
      
      if (prevState.currency < cost) return prevState;
      
      upgrades[upgradeIndex] = {
        ...upgrade,
        owned: upgrade.owned + 1,
        multiplier: upgrade.multiplier * (upgradesData.find(u => u.id === id)?.multiplierIncrease || 1.0)
      };
      
      return {
        ...prevState,
        currency: prevState.currency - cost,
        upgrades
      };
    });
  }, []);

  const buyManager = useCallback((id: number) => {
    setGameState(prevState => {
      if (prevState.managers.some(m => m.id === id && m.purchased)) {
        return prevState;
      }
      
      const manager = managersData.find(m => m.id === id);
      if (!manager || prevState.currency < manager.cost) {
        return prevState;
      }
      
      return {
        ...prevState,
        currency: prevState.currency - manager.cost,
        managers: prevState.managers.map(m => 
          m.id === id ? { ...m, purchased: true } : m
        )
      };
    });
  }, []);

  const purchaseTechTreeItem = useCallback((skill: Skill) => {
    setGameState(prevState => {
      // Check if already purchased
      if (prevState.techTree.some(s => s.id === skill.id && s.purchased)) {
        return prevState;
      }
      
      // Check if player has enough skill points
      if (prevState.skillPoints < skill.cost) {
        return prevState;
      }
      
      // Check prerequisites if any
      if (skill.prerequisiteIds && skill.prerequisiteIds.length > 0) {
        const prereqsMet = skill.prerequisiteIds.every(
          preId => prevState.techTree.some(s => s.id === preId && s.purchased)
        );
        if (!prereqsMet) {
          return prevState;
        }
      }
      
      const updatedTechTree = prevState.techTree.map(s => 
        s.id === skill.id ? { ...s, purchased: true } : s
      );
      
      // Remove the toast notification here
      
      return {
        ...prevState,
        skillPoints: prevState.skillPoints - skill.cost,
        techTree: updatedTechTree
      };
    });
  }, []);

  const addCurrency = useCallback((amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      currency: prevState.currency + amount
    }));
  }, []);

  const addDarkMatter = useCallback((amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      darkMatter: prevState.darkMatter + amount
    }));
  }, []);
  
  const addGems = useCallback((amount: number) => {
    setGameState(prevState => ({
      ...prevState,
      gems: prevState.gems + amount
    }));
  }, []);

  const prestige = useCallback(() => {
    // Calculate prestige rewards based on current progress
    const darkMatterGain = Math.floor(Math.sqrt(gameState.currency / 1e6));
    
    setGameState(prevState => {
      // Create a new game state with reset progress but increased multipliers
      const resetState = {
        ...defaultGameState,
        darkMatter: prevState.darkMatter + darkMatterGain,
        totalDarkMatter: prevState.totalDarkMatter + darkMatterGain,
        prestigeCount: prevState.prestigeCount + 1,
        prestigeMultiplier: prevState.prestigeMultiplier + (darkMatterGain * 0.1), // Each dark matter adds 10% to multiplier
        managers: prevState.managers, // Keep purchased managers
        techTree: prevState.techTree, // Keep purchased tech
        inventory: prevState.inventory, // Keep inventory
        gems: prevState.gems, // Keep gems
        skillPoints: prevState.skillPoints, // Keep skill points
        // Additional values to preserve across prestiges
        achievements: prevState.achievements,
        dailyRewards: prevState.dailyRewards,
        lastDailyReward: prevState.lastDailyReward,
        playerCustomization: prevState.playerCustomization
      };
      
      return resetState;
    });
  }, [gameState.currency]);

  const purchaseInventoryItem = useCallback((item: any) => {
    setGameState(prevState => {
      if (prevState.currency < item.cost) {
        return prevState;
      }
      
      // Add item to inventory
      const newInventory = [...prevState.inventory, item];
      
      return {
        ...prevState,
        currency: prevState.currency - item.cost,
        inventory: newInventory
      };
    });
  }, []);

  const applyBoost = useCallback((boost: Boost) => {
    // Add the boost to active boosts
    setActiveBoosts(prevBoosts => [...prevBoosts, boost]);
    
    // Remove the boost from inventory if it's from there
    setGameState(prevState => ({
      ...prevState,
      inventory: prevState.inventory.filter(item => 
        !(item.id === boost.id && item.type === boost.type)
      )
    }));
  }, []);

  const selectPlanet = useCallback((planet: SpaceObject) => {
    setGameState(prevState => ({
      ...prevState,
      selectedPlanet: planet
    }));
  }, []);

  const openChest = useCallback(() => {
    // Generate random rewards from opening a chest
    const currencyReward = Math.floor(Math.random() * 1000 + 100);
    const gemsReward = Math.floor(Math.random() * 10 + 1);
    
    setGameState(prevState => ({
      ...prevState,
      currency: prevState.currency + currencyReward,
      gems: prevState.gems + gemsReward
    }));
    
    return { currency: currencyReward, gems: gemsReward };
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        activePerk,
        setActivePerk,
        calculateIncome,
        handleClick,
        buyUpgrade,
        buyManager,
        purchaseTechTreeItem,
        addCurrency,
        addDarkMatter,
        prestige,
        lastUpdated,
        setLastUpdated,
        purchaseInventoryItem,
        applyBoost,
        selectPlanet,
        openChest,
        saveGame,
        addGems,
        showDrillAnimation,
        setShowDrillAnimation,
        activeBoosts
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
