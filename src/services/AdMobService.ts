
import { AdMob, AdOptions, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';

// Simple AdMobService that doesn't try to track listeners or handle complex event types
class AdMobService {
  // Test ad IDs - replace with your real IDs in production
  private interstitialAdId = 'ca-app-pub-3940256099942544/1033173712'; // Test ID
  private rewardedAdId = 'ca-app-pub-3940256099942544/5224354917'; // Test ID for rewarded ads
  private initialized = false;
  private rewardedAdCallback: ((reward: boolean) => void) | null = null;

  // Initialize AdMob
  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        await AdMob.initialize();
        console.log('AdMob initialized successfully');
        
        // Set up rewarded ad event listeners
        AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
          console.log('User earned reward:', reward);
          if (this.rewardedAdCallback) {
            this.rewardedAdCallback(true);
            this.rewardedAdCallback = null;
          }
        });
        
        AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
          console.error('Rewarded ad failed:', error);
          if (this.rewardedAdCallback) {
            this.rewardedAdCallback(false);
            this.rewardedAdCallback = null;
          }
        });
        
        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          console.log('Rewarded ad was dismissed');
          // If callback wasn't triggered by a reward, it means the user closed the ad without watching
          if (this.rewardedAdCallback) {
            this.rewardedAdCallback(false);
            this.rewardedAdCallback = null;
          }
        });
        
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize AdMob:', error);
      }
    }
  }

  // Load an interstitial ad
  async loadInterstitialAd(): Promise<boolean> {
    try {
      if (!this.initialized) await this.initialize();
      
      const options: AdOptions = {
        adId: this.interstitialAdId,
      };
      
      await AdMob.prepareInterstitial(options);
      console.log('Interstitial ad loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load interstitial ad:', error);
      return false;
    }
  }

  // Show the loaded interstitial ad
  async showInterstitialAd(): Promise<boolean> {
    try {
      const result = await AdMob.showInterstitial();
      console.log('Interstitial ad shown successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      return false;
    }
  }
  
  // Load a rewarded ad
  async loadRewardedAd(): Promise<boolean> {
    try {
      if (!this.initialized) await this.initialize();
      
      const options: RewardAdOptions = {
        adId: this.rewardedAdId,
      };
      
      await AdMob.prepareRewardVideoAd(options);
      console.log('Rewarded ad loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load rewarded ad:', error);
      return false;
    }
  }
  
  // Show the loaded rewarded ad and return a promise that resolves with the reward status
  async showRewardedAd(): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        this.rewardedAdCallback = (success) => {
          resolve(success);
        };
        
        AdMob.showRewardVideoAd()
          .catch((error) => {
            console.error('Failed to show rewarded ad:', error);
            this.rewardedAdCallback = null;
            resolve(false);
          });
      });
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const adMobService = new AdMobService();
