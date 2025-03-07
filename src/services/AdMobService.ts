
import { AdMob, AdOptions } from '@capacitor-community/admob';

// Simple AdMobService that doesn't try to track listeners or handle complex event types
class AdMobService {
  // Test ad IDs - replace with your real IDs in production
  private interstitialAdId = 'ca-app-pub-3940256099942544/1033173712'; // Test ID
  private initialized = false;

  // Initialize AdMob
  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        await AdMob.initialize();
        console.log('AdMob initialized successfully');
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
}

// Export a singleton instance
export const adMobService = new AdMobService();
