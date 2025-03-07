
import { AdMob, AdOptions, InterstitialAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';

// Initialize AdMob once when the service is first imported
let initialized = false;

class AdMobService {
  // Test ad IDs - replace with your real IDs in production
  private interstitialAdId = 'ca-app-pub-3940256099942544/1033173712'; // Test ID

  constructor() {
    this.initialize();
  }

  // Initialize AdMob
  async initialize(): Promise<void> {
    if (!initialized) {
      try {
        await AdMob.initialize();
        console.log('AdMob initialized successfully');
        initialized = true;
      } catch (error) {
        console.error('Failed to initialize AdMob:', error);
      }
    }
  }

  // Load an interstitial ad
  async loadInterstitialAd(): Promise<boolean> {
    try {
      if (!initialized) await this.initialize();
      
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

  // Set up event listeners for ads
  setupAdEventListeners(
    onAdLoaded?: () => void,
    onAdFailed?: () => void,
    onAdDismissed?: () => void
  ): void {
    // Listen for interstitial ad events
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
      console.log('Interstitial ad loaded');
      onAdLoaded?.();
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
      console.error('Interstitial ad failed to load:', error);
      onAdFailed?.();
    });

    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      console.log('Interstitial ad dismissed');
      onAdDismissed?.();
    });
  }

  // Remove all event listeners
  removeAllListeners(): Promise<void> {
    return AdMob.removeAllListeners();
  }
}

// Export a singleton instance
export const adMobService = new AdMobService();
