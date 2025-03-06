
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';

// For AdMob, in a real implementation we would import and use AdMob-specific functions
// This is a mock implementation to demonstrate the flow
const mockShowInterstitialAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log('Showing interstitial ad...');
    // Simulate ad display time
    setTimeout(() => {
      console.log('Ad display complete');
      resolve(true);
    }, 1000);
  });
};

interface AdContextType {
  showAdNotification: boolean;
  adBoostActive: boolean;
  adBoostTimeRemaining: number;
  adBoostMultiplier: number;
  handleWatchAd: () => Promise<void>;
  dismissAdNotification: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, setIncomeMultiplier } = useGame();
  const { toast } = useToast();
  
  const [showAdNotification, setShowAdNotification] = useState(false);
  const [adBoostActive, setAdBoostActive] = useState(false);
  const [adBoostTimeRemaining, setAdBoostTimeRemaining] = useState(0);
  const [lastAdWatchedTime, setLastAdWatchedTime] = useState(0);
  const [nextAdTime, setNextAdTime] = useState(0);
  
  const adBoostMultiplier = 2; // x2 income boost
  const adBoostDuration = 10 * 60; // 10 minutes in seconds
  const minAdInterval = 5 * 60; // 5 minutes minimum between ad offers
  const maxAdInterval = 15 * 60; // 15 minutes maximum between ad offers
  const cooldownPeriod = 2 * 60; // 2 minutes cooldown after watching ad
  
  // Function to show ad notification at random intervals
  useEffect(() => {
    if (!nextAdTime) {
      // Set initial random time for first ad
      const initialDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + initialDelay * 1000);
    }
  }, []);
  
  // Check if it's time to show an ad notification
  useInterval(() => {
    const now = Date.now();
    
    // Check if it's time to show a new ad notification
    if (!showAdNotification && now >= nextAdTime && now - lastAdWatchedTime >= cooldownPeriod * 1000) {
      setShowAdNotification(true);
    }
    
    // Update boost timer if active
    if (adBoostActive && adBoostTimeRemaining > 0) {
      setAdBoostTimeRemaining(prev => Math.max(0, prev - 1));
      
      // If boost just ended, reset multiplier
      if (adBoostTimeRemaining === 1) {
        setAdBoostActive(false);
        // Reset the income multiplier to its base value
        setIncomeMultiplier(state.incomeMultiplier / adBoostMultiplier);
        
        toast({
          title: "Boost Expired",
          description: "Your ad boost has expired. Watch another ad for more boost time!",
        });
      }
    }
  }, 1000);
  
  // Handle watching an ad
  const handleWatchAd = async () => {
    setShowAdNotification(false);
    
    try {
      // Show the ad (in a real implementation, this would be AdMob specific)
      const adCompleted = await mockShowInterstitialAd();
      
      if (adCompleted) {
        // Update last watched time
        setLastAdWatchedTime(Date.now());
        
        // Set next random ad time
        const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
        setNextAdTime(Date.now() + nextDelay * 1000);
        
        // Apply boost
        setAdBoostActive(true);
        setAdBoostTimeRemaining(adBoostDuration);
        
        // Update income multiplier
        setIncomeMultiplier(state.incomeMultiplier * adBoostMultiplier);
        
        toast({
          title: "Boost Activated!",
          description: `Your income is boosted x${adBoostMultiplier} for 10 minutes!`,
        });
      }
    } catch (error) {
      console.error("Error showing ad:", error);
      toast({
        title: "Ad Error",
        description: "There was a problem displaying the ad. Please try again later.",
      });
    }
  };
  
  // Dismiss ad notification without watching
  const dismissAdNotification = () => {
    setShowAdNotification(false);
    
    // Set next random ad time
    const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
    setNextAdTime(Date.now() + nextDelay * 1000);
  };
  
  return (
    <AdContext.Provider value={{
      showAdNotification,
      adBoostActive,
      adBoostTimeRemaining,
      adBoostMultiplier,
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
