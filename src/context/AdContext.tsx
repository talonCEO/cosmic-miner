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
  
  const adBoostMultiplier = 2; // x2 income boost
  const adBoostDuration = 10 * 60; // 10 minutes in seconds
  const minAdInterval = 5 * 60; // 5 minutes minimum between ad offers
  const maxAdInterval = 15 * 60; // 15 minutes maximum between ad offers
  const cooldownPeriod = 60; // 60 seconds minimum between ads
  const adNotificationDuration = 60; // 1 minute auto-dismiss
  const initialAdDelay = 90; // Delay first ad by 90 seconds (1.5 minutes)
  
  useEffect(() => {
    const initAds = async () => {
      try {
        await adMobService.initialize();
        const adLoaded = await adMobService.loadInterstitialAd();
        setIsAdLoaded(adLoaded);
        
        adMobService.setupAdEventListeners(
          () => setIsAdLoaded(true),
          () => setIsAdLoaded(false),
          () => {
            setAdBoostActive(true);
            setAdBoostTimeRemaining(adBoostDuration);
            setIncomeMultiplier(adBoostMultiplier);
          }
        );
        
        setNextAdTime(Date.now() + initialAdDelay * 1000); 
      } catch (error) {
        console.error('Error initializing ads:', error);
      }
    };
    
    initAds();
    
    return () => {
      adMobService.removeAllListeners()
        .then(() => console.log('Successfully cleaned up ad context'))
        .catch(err => console.error('Error during ad context cleanup:', err));
    };
  }, []);

  useEffect(() => {
    if (!nextAdTime) {
      const initialDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + initialDelay * 1000);
    }
  }, []);
  
  useInterval(() => {
    const now = Date.now();
    
    if (!showAdNotification && now >= nextAdTime && now - lastAdWatchedTime >= cooldownPeriod * 1000 && !adBoostActive) {
      setShowAdNotification(true);
      setAdNotificationStartTime(now);
      console.log('Showing ad notification');
      
      if (!isAdLoaded) {
        adMobService.loadInterstitialAd()
          .then(success => setIsAdLoaded(success))
          .catch(err => console.error('Failed to load ad', err));
      }
    }
    
    if (showAdNotification && now - adNotificationStartTime >= adNotificationDuration * 1000) {
      dismissAdNotification();
      console.log('Auto-dismissing ad notification');
    }
    
    if (adBoostActive && adBoostTimeRemaining > 0) {
      setAdBoostTimeRemaining(prev => Math.max(0, prev - 1));
      
      if (adBoostTimeRemaining === 1) {
        setAdBoostActive(false);
        setIncomeMultiplier(1.0);
      }
    }
  }, 1000);
  
  const handleWatchAd = async () => {
    if (adBoostActive) {
      setShowAdNotification(false);
      return;
    }
    
    setShowAdNotification(false);
    
    try {
      if (!isAdLoaded) {
        const adLoaded = await adMobService.loadInterstitialAd();
        setIsAdLoaded(adLoaded);
        if (!adLoaded) {
          throw new Error("Failed to load ad");
        }
      }
      
      const adCompleted = await adMobService.showInterstitialAd();
      setIsAdLoaded(false);
      
      adMobService.loadInterstitialAd()
        .then(success => setIsAdLoaded(success))
        .catch(err => console.error('Failed to load next ad', err));
      
      setLastAdWatchedTime(Date.now());
      
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
    } catch (error) {
      console.error("Error showing ad:", error);
      
      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);
    }
  };
  
  const dismissAdNotification = () => {
    setShowAdNotification(false);
    
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
