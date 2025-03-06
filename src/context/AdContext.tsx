
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';

// Real AdMob interstitial ad implementation
const adUnitId = "ca-app-pub-3940256099942544/6300978111"; // Test AdMob ID

// Initialize AdMob
const initializeAdMob = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window.admob === 'undefined') {
      console.log('AdMob not available - creating mock implementation');
      // Create mock implementation if AdMob is not available (for development)
      window.admob = {
        interstitial: {
          load: (options: any, callback: Function) => {
            console.log('Mock: Loading interstitial ad', options);
            setTimeout(() => callback(null), 500);
          },
          show: (callback: Function) => {
            console.log('Mock: Showing interstitial ad');
            setTimeout(() => callback(null), 1000);
          }
        }
      };
    }
    console.log('AdMob initialized');
    resolve();
  });
};

// Load an interstitial ad
const loadInterstitialAd = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Loading interstitial ad...');
    window.admob.interstitial.load(
      { id: adUnitId },
      (err: any) => {
        if (err) {
          console.error('Failed to load interstitial ad', err);
          reject(err);
        } else {
          console.log('Interstitial ad loaded successfully');
          resolve();
        }
      }
    );
  });
};

// Show the loaded interstitial ad
const showInterstitialAd = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    console.log('Showing interstitial ad...');
    window.admob.interstitial.show(
      (err: any) => {
        if (err) {
          console.error('Failed to show interstitial ad', err);
          reject(err);
          return;
        }
        console.log('Interstitial ad shown successfully');
        resolve(true);
      }
    );
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
  const [adNotificationStartTime, setAdNotificationStartTime] = useState(0);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  
  const adBoostMultiplier = 2; // x2 income boost
  const adBoostDuration = 10 * 60; // 10 minutes in seconds
  const minAdInterval = 5 * 60; // 5 minutes minimum between ad offers
  const maxAdInterval = 15 * 60; // 15 minutes maximum between ad offers
  const cooldownPeriod = 2 * 60; // 2 minutes cooldown after watching ad
  const adNotificationDuration = 60; // 1 minute auto-dismiss
  
  // Initialize AdMob when component mounts
  useEffect(() => {
    initializeAdMob().then(() => {
      // Pre-load an ad after initialization
      loadInterstitialAd()
        .then(() => setIsAdLoaded(true))
        .catch(err => console.error('Failed to load initial ad', err));
    });
  }, []);

  // Function to show ad notification at random intervals
  useEffect(() => {
    if (!nextAdTime) {
      // Set initial random time for first ad
      const initialDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + initialDelay * 1000);
    }
  }, []);
  
  // Check if it's time to show an ad notification or if current notification needs to be dismissed
  useInterval(() => {
    const now = Date.now();
    
    // Check if it's time to show a new ad notification
    if (!showAdNotification && now >= nextAdTime && now - lastAdWatchedTime >= cooldownPeriod * 1000) {
      setShowAdNotification(true);
      setAdNotificationStartTime(now);
      
      // If we don't have an ad loaded, try to load one
      if (!isAdLoaded) {
        loadInterstitialAd()
          .then(() => setIsAdLoaded(true))
          .catch(err => console.error('Failed to load ad', err));
      }
    }
    
    // Check if current notification needs to be auto-dismissed
    if (showAdNotification && now - adNotificationStartTime >= adNotificationDuration * 1000) {
      dismissAdNotification();
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
      if (!isAdLoaded) {
        // Try to load the ad if not already loaded
        await loadInterstitialAd();
      }
      
      // Show the ad
      const adCompleted = await showInterstitialAd();
      setIsAdLoaded(false); // Ad was shown, so we need to load a new one
      
      // Load the next ad immediately
      loadInterstitialAd()
        .then(() => setIsAdLoaded(true))
        .catch(err => console.error('Failed to load next ad', err));
      
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
      
      // Still set next ad time to avoid spamming error
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
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

// Add the type definition for admob global to avoid TypeScript errors
declare global {
  interface Window {
    admob?: {
      interstitial: {
        load: (options: any, callback: (err: any) => void) => void;
        show: (callback: (err: any) => void) => void;
      }
    }
  }
}
