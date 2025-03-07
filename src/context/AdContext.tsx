
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';
import { Plus, PlayCircle, Clock, Zap, MousePointerClick } from 'lucide-react';

// Define the different boost types
export type BoostType = 'income' | 'autoTap' | 'timeWarp';

// Define the boost configuration interface
interface BoostConfig {
  type: BoostType;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in seconds, 0 means instant effect
  multiplier?: number; // for income boost
  clicksPerSecond?: number; // for auto tap boost
  timeSkip?: number; // for time warp (in seconds)
}

interface AdContextType {
  showAdNotification: boolean;
  adBoostActive: boolean;
  adBoostTimeRemaining: number;
  adBoostMultiplier: number;
  activeBoostType: BoostType | null;
  currentBoostConfig: BoostConfig | null;
  handleWatchAd: () => Promise<void>;
  dismissAdNotification: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

// Boost configurations
const boostConfigs: BoostConfig[] = [
  {
    type: 'income',
    name: 'Income Boost',
    description: '2x Income for 10min',
    icon: <Plus className="h-3 w-3" />,
    duration: 10 * 60, // 10 minutes in seconds
    multiplier: 2
  },
  {
    type: 'autoTap',
    name: 'Auto Tap',
    description: 'Auto tap 5 times/sec for 2min',
    icon: <MousePointerClick className="h-3 w-3" />,
    duration: 2 * 60, // 2 minutes in seconds
    clicksPerSecond: 5
  },
  {
    type: 'timeWarp',
    name: 'Time Warp',
    description: 'Skip ahead 30min of income',
    icon: <Clock className="h-3 w-3" />,
    duration: 0, // instant effect
    timeSkip: 30 * 60 // 30 minutes in seconds
  }
];

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Create a simplified version that doesn't try to modify game state directly
  const { toast } = useToast();
  
  // Simple state management
  const [showAdNotification, setShowAdNotification] = useState(false);
  const [adBoostActive, setAdBoostActive] = useState(false);
  const [adBoostTimeRemaining, setAdBoostTimeRemaining] = useState(0);
  const [activeBoostType, setActiveBoostType] = useState<BoostType | null>(null);
  const [currentBoostConfig, setCurrentBoostConfig] = useState<BoostConfig | null>(null);
  const [availableBoost, setAvailableBoost] = useState<BoostConfig>(boostConfigs[0]);
  
  // Create a dummy ad service that always succeeds
  const mockAdSuccess = async () => {
    // Simulate ad loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  };
  
  // Handle notification display - simplified
  useEffect(() => {
    // Show ad notification after 30 seconds
    const timer = setTimeout(() => {
      setShowAdNotification(true);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Simple timer for boost countdown
  useInterval(() => {
    if (adBoostActive && adBoostTimeRemaining > 0) {
      setAdBoostTimeRemaining(prev => Math.max(0, prev - 1));
      
      if (adBoostTimeRemaining === 1) {
        setAdBoostActive(false);
        setActiveBoostType(null);
        setCurrentBoostConfig(null);
      }
    }
  }, 1000);
  
  // Simplified ad handler
  const handleWatchAd = async () => {
    try {
      // Hide notification first
      setShowAdNotification(false);
      
      // Select a random boost
      const randomIndex = Math.floor(Math.random() * boostConfigs.length);
      const selectedBoost = boostConfigs[randomIndex];
      
      // Simulate successful ad completion
      await mockAdSuccess();
      
      // Apply boost (UI only - no actual game effects)
      if (selectedBoost.type === 'income' || selectedBoost.type === 'autoTap') {
        setCurrentBoostConfig(selectedBoost);
        setActiveBoostType(selectedBoost.type);
        setAdBoostActive(true);
        setAdBoostTimeRemaining(selectedBoost.duration);
      } 
      else if (selectedBoost.type === 'timeWarp') {
        // Just show a toast for time warp
        toast({
          title: "Time Warp!",
          description: `Skipped ahead (visual effect only)`,
          variant: "default",
        });
        
        // Trigger animation effect
        document.dispatchEvent(new CustomEvent('timeWarpActivated'));
      }
      
      // Show notification again after 2 minutes
      setTimeout(() => {
        setShowAdNotification(true);
      }, 2 * 60 * 1000);
      
    } catch (error) {
      console.error("Error showing ad:", error);
    }
  };
  
  const dismissAdNotification = () => {
    setShowAdNotification(false);
    
    // Show notification again after 5 minutes
    setTimeout(() => {
      setShowAdNotification(true);
    }, 5 * 60 * 1000);
  };
  
  return (
    <AdContext.Provider value={{
      showAdNotification,
      adBoostActive,
      adBoostTimeRemaining,
      adBoostMultiplier: 2,
      activeBoostType,
      currentBoostConfig,
      handleWatchAd,
      dismissAdNotification
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = (): AdContextType => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAd must be used within an AdProvider');
  }
  return context;
};
