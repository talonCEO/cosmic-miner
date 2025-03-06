import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGame } from './GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useInterval } from '@/hooks/useInterval';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// Create Interstitial Ad Instance (Replace with real Ad Unit ID for production)
const adUnitId = TestIds.INTERSTITIAL; // Change to real ID in production
const interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

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
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  
  const adBoostMultiplier = 2; // x2 income boost
  const adBoostDuration = 10 * 60; // 10 minutes in seconds
  const minAdInterval = 5 * 60; // 5 minutes minimum between ad offers
  const maxAdInterval = 15 * 60; // 15 minutes maximum between ad offers
  const cooldownPeriod = 2 * 60; // 2 minutes cooldown after watching ad

  // 🔹 Load AdMob Interstitial Ad in Advance
  useEffect(() => {
    const loadAd = () => {
      interstitialAd.load();
    };

    loadAd();

    const handleAdLoaded = () => setIsAdLoaded(true);
    const handleAdClosed = () => {
      setIsAdLoaded(false);
      interstitialAd.load(); // Reload for next time
    };
    
    interstitialAd.addAdEventListener(AdEventType.LOADED, handleAdLoaded);
    interstitialAd.addAdEventListener(AdEventType.CLOSED, handleAdClosed);
    
    return () => {
      interstitialAd.removeAllListeners();
    };
  }, []);

  // Function to set initial random ad time
  useEffect(() => {
    if (!nextAdTime) {
      const initialDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + initialDelay * 1000);
    }
  }, [nextAdTime]);

  // Interval for checking ad notifications & boost expiration
  useInterval(() => {
    const now = Date.now();
    
    if (!showAdNotification && now >= nextAdTime && now - lastAdWatchedTime >= cooldownPeriod * 1000) {
      setShowAdNotification(true);
    }

    if (adBoostActive && adBoostTimeRemaining > 0) {
      setAdBoostTimeRemaining(prev => prev - 1);
    }

    if (adBoostActive && adBoostTimeRemaining <= 0) {
      setAdBoostActive(false);
      setIncomeMultiplier(state.incomeMultiplier / adBoostMultiplier);
      
      toast({
        title: "Boost Expired",
        description: "Your ad boost has expired. Watch another ad for more boost time!",
      });
    }
  }, 1000);

  // 🔹 Handle Watching an Ad Instantly
  const handleWatchAd = async () => {
    setShowAdNotification(false);

    try {
      if (isAdLoaded) {
        interstitialAd.show();
      } else {
        console.warn("Ad not loaded yet. Trying to load again...");
        interstitialAd.load();
        return;
      }

      setLastAdWatchedTime(Date.now());

      const nextDelay = Math.floor(Math.random() * (maxAdInterval - minAdInterval + 1)) + minAdInterval;
      setNextAdTime(Date.now() + nextDelay * 1000);

      setAdBoostActive(true);
      setAdBoostTimeRemaining(adBoostDuration);

      setIncomeMultiplier(state.incomeMultiplier * adBoostMultiplier);

      toast({
        title: "Boost Activated!",
        description: `Your income is boosted x${adBoostMultiplier} for 10 minutes!`,
      });
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
