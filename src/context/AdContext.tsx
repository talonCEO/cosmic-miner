
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';
import { adMobService } from '@/services/AdMobService';

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
  
  // Configuration values
  const adBoostMultiplier = 2; // x2 income boost
  const adBoostDuration = 10 * 60; // 10 minutes in seconds
  const minAdInterval = 5 * 60; // 5 minutes minimum between ad offers
  const maxAdInterval = 15 * 60; // 15 minutes maximum between ad offers
  const cooldownPeriod = 60; // 60 seconds minimum between ads
  const adNotificationDuration = 60; // 1 minute auto-dismiss
  const initialAdDelay = 90; // Delay first ad by 90 seconds (1.5 minutes)
  
  // Initialize AdMob when component mounts
  useEffect(() => {
    const initAds = async () => {
      try {
        await adMobService.initialize();
        // Pre-load an ad after initialization
        const adLoaded = await adMobService.loadInterstitialAd();
        setIsAdLoaded(adLoaded);
        
        // Set up event listeners
        adMobService.setupAdEventListeners(
          () => setIsAdLoaded(true),
          () => setIsAdLoaded(false),
          () => {
            // Ad was watched successfully, apply boost
            setAdBoostActive(true);
            setAdBoostTimeRemaining(adBoostDuration);
            setIncomeMultiplier(adBoostMultiplier);
          }
        );
        
        // Show first ad notification after initial delay
        setNextAdTime(Date.now() + initialAdDelay * 1000); 
      } catch (error) {
        console.error('Error initializing ads:', error);
      }
    };
    
    initAds();
    
    // Clean up function that will run when component unmounts
    return () => {
      // Log that we're cleaning up, but don't try to remove listeners with a non-existent method
      console.log('Cleaning up ad context');
    };
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
    if (!showAdNotification && now >= nextAdTime && now - lastAdWatchedTime >= cooldownPeriod * 1000 && !adBoostActive) {
      setShowAdNotification(true);
      setAdNotificationStartTime(now);
      console.log('Showing ad notification');
      
      // If we don't have an ad loaded, try to load one
      if (!isAdLoaded) {
        adMobService.loadInterstitialAd()
          .then(success => setIsAdLoaded(success))
          .catch(err => console.error('Failed to load ad', err));
      }
    }
    
    // Check if current notification needs to be auto-dismissed
    if (showAdNotification && now - adNotificationStartTime >= adNotificationDuration * 1000) {
      dismissAdNotification();
      console.log('Auto-dismissing ad notification');
    }
    
    // Update boost timer if active
    if (adBoostActive && adBoostTimeRemaining > 0) {
      setAdBoostTimeRemaining(prev => Math.max(0, prev - 1));
      
      // If boost just ended, reset multiplier
      if (adBoostTimeRemaining === 1) {
        setAdBoostActive(false);
        // Reset the income multiplier
        setIncomeMultiplier(1.0);
      }
    }
  }, 1000);
  
  // Handle watching an ad
  const handleWatchAd = async () => {
    // Don't do anything if boost is already active
    if (adBoostActive) {
      setShowAdNotification(false);
      return;
    }
    
    setShowAdNotification(false);
    
    try {
      if (!isAdLoaded) {
        // Try to load the ad if not already loaded
        const adLoaded = await adMobService.loadInterstitialAd();
        setIsAdLoaded(adLoaded);
        if (!adLoaded) {
          throw new Error("Failed to load ad");
        }
      }
      
      // Show the ad
      const adCompleted = await adMobService.showInterstitialAd();
      setIsAdLoaded(false); // Ad was shown, so we need to load a new one
      
      // Load the next ad immediately
      adMobService.loadInterstitialAd()
        .then(success => setIsAdLoaded(success))
        .catch(err => console.error('Failed to load next ad', err));
      
      // Update last watched time
      setLastAdWatchedTime(Date.now());
      
      // Set next random ad time
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
      
      // Apply boost will happen via event listener callback when ad is dismissed
    } catch (error) {
      console.error("Error showing ad:", error);
      
      // Set next ad time to avoid spamming error
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
