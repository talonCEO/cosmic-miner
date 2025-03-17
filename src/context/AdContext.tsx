
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGameContext } from './GameContext';
import AdMobService from '../services/AdMobService';

// Define boost types
export type BoostType = 'income' | 'gems' | 'timeWarp' | 'tapPower';

interface BoostOption {
  type: BoostType;
  title: string;
  description: string;
  icon: string;
  duration?: number; // in seconds, optional because not all boosts are timed
}

export interface AdContextType {
  showRewardedAd: () => void;
  isBoostActive: boolean;
  activeBoostType: BoostType | null;
  boostTimeRemaining: number;
  boostExpiryTime: number | null;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const gameContext = useGameContext();
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [activeBoostType, setActiveBoostType] = useState<BoostType | null>(null);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState(0);
  const [boostExpiryTime, setBoostExpiryTime] = useState<number | null>(null);

  const boostOptions: BoostOption[] = [
    {
      type: 'income',
      title: 'Income Boost',
      description: 'x2 income for 60 seconds',
      icon: '💰',
      duration: 60
    },
    {
      type: 'gems',
      title: 'Gem Reward',
      description: 'Receive 10 gems',
      icon: '💎'
    },
    {
      type: 'timeWarp',
      title: 'Time Warp',
      description: 'Gain 120 minutes of passive income',
      icon: '⌛'
    },
    {
      type: 'tapPower',
      title: 'Tap Boost',
      description: 'x5 tap power for 60 seconds',
      icon: '👆',
      duration: 60
    }
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isBoostActive && boostExpiryTime) {
        const currentTime = Date.now();
        if (currentTime >= boostExpiryTime) {
          // Boost has expired
          setIsBoostActive(false);
          setBoostExpiryTime(null);
          setActiveBoostType(null);
          setBoostTimeRemaining(0);
          
          // Display toast notification that boost has ended
          toast({
            title: "Boost Ended",
            description: "Your temporary boost has expired.",
          });
          
          // Reset any game mechanics that were boosted
          if (gameContext) {
            gameContext.setIncomeMultiplier(1);
            gameContext.setTapPowerMultiplier(1);
          }
        } else {
          // Update remaining time
          setBoostTimeRemaining(Math.floor((boostExpiryTime - currentTime) / 1000));
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isBoostActive, boostExpiryTime, toast, gameContext]);

  const applyBoost = (boostType: BoostType) => {
    const selectedBoost = boostOptions.find(boost => boost.type === boostType);
    
    if (!selectedBoost) return;
    
    // Apply the effects based on boost type
    switch (boostType) {
      case 'income':
        if (gameContext) {
          gameContext.setIncomeMultiplier(2);
          
          if (selectedBoost.duration) {
            const expiryTime = Date.now() + selectedBoost.duration * 1000;
            setBoostExpiryTime(expiryTime);
            setBoostTimeRemaining(selectedBoost.duration);
            setIsBoostActive(true);
            setActiveBoostType('income');
          }
        }
        break;
        
      case 'gems':
        if (gameContext) {
          gameContext.addGems(10);
          // This is an instant boost, no need to set timers
          toast({
            title: "Gems Received!",
            description: "You received 10 gems from watching an ad!",
          });
        }
        break;
        
      case 'timeWarp':
        if (gameContext) {
          // Calculate 120 minutes of income
          const minutesOfIncome = 120;
          const secondsOfIncome = minutesOfIncome * 60;
          const incomePerSecond = gameContext.totalIncomePerSecond;
          const totalIncome = incomePerSecond * secondsOfIncome;
          
          gameContext.addCoins(totalIncome);
          
          toast({
            title: "Time Warp Activated!",
            description: `You gained ${gameContext.formatNumber(totalIncome)} coins from ${minutesOfIncome} minutes of passive income!`,
          });
        }
        break;
        
      case 'tapPower':
        if (gameContext) {
          gameContext.setTapPowerMultiplier(5);
          
          if (selectedBoost.duration) {
            const expiryTime = Date.now() + selectedBoost.duration * 1000;
            setBoostExpiryTime(expiryTime);
            setBoostTimeRemaining(selectedBoost.duration);
            setIsBoostActive(true);
            setActiveBoostType('tapPower');
          }
        }
        break;
    }
  };

  const showRewardedAd = async () => {
    try {
      const adResult = await AdMobService.showRewardedAd();
      
      if (adResult.rewarded) {
        // Select a random boost
        const randomIndex = Math.floor(Math.random() * boostOptions.length);
        const selectedBoost = boostOptions[randomIndex];
        
        toast({
          title: `${selectedBoost.title} Activated!`,
          description: selectedBoost.description,
        });
        
        // Apply the selected boost
        applyBoost(selectedBoost.type);
      }
    } catch (error) {
      console.error("Error showing rewarded ad:", error);
      toast({
        title: "Ad Error",
        description: "There was an error playing the ad. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdContext.Provider value={{ 
      showRewardedAd, 
      isBoostActive, 
      activeBoostType,
      boostTimeRemaining,
      boostExpiryTime
    }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAdContext must be used within an AdProvider');
  }
  return context;
};
