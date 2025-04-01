import { Capacitor } from '@capacitor/core';
import { gemPackages } from '@/components/menu/types/premiumStore';

// Declare the global store object from cordova-plugin-purchase
declare global {
  interface Window {
    store: {
      register: (product: { id: string; type: string }) => void;
      when: (query: string) => {
        approved: (callback: (product: any) => void) => void;
        error: (callback: (error: any) => void) => void;
      };
      order: (productId: string) => void;
      refresh: () => void;
      get: (productId: string) => any;
      CONSUMABLE: string; // Add other types as needed (e.g., NON_RENEWING_SUBSCRIPTION)
    };
  }
}

export class InAppPurchaseService {
  private static initialized = false;

  static async initialize() {
    if (this.initialized || Capacitor.getPlatform() === 'web') return;

    try {
      const productIds = gemPackages.map(pack => pack.id);

      // Register products with the Cordova store
      productIds.forEach(id => {
        window.store.register({
          id,
          type: window.store.CONSUMABLE, // Use CONSUMABLE for one-time gem purchases
        });
      });

      // Handle purchase approval
      window.store.when('product').approved((product: any) => {
        product.finish();
        console.log(`Purchase approved: ${product.id}`);
      });

      // Handle errors
      window.store.when('product').error((error: any) => {
        console.error('Purchase error:', error);
      });

      // Refresh the store to load product details
      window.store.refresh();
      this.initialized = true;
      console.log('InAppPurchaseService initialized');
    } catch (error) {
      console.error('Failed to initialize InAppPurchaseService:', error);
    }
  }

  static async purchaseProduct(productId: string): Promise<void> {
    if (Capacitor.getPlatform() === 'web' || !this.initialized) {
      console.log(`Mock purchase of ${productId}`);
      return Promise.resolve();
    }
  
    return new Promise((resolve, reject) => {
      try {
        window.store.order(productId);
        window.store.when(productId)
          .approved(() => {
            const product = window.store.get(productId);
            product.finish();
            console.log(`Purchased ${productId}`);
            resolve();
          })
          .error((error: any) => {
            console.error(`Purchase failed for ${productId}:`, error);
            reject(error);
          });
      } catch (error) {
        console.error(`Purchase initiation failed for ${productId}:`, error);
        reject(error);
      }
    });
  }

  static getProductDetails(productId: string): any {
    return window.store.get(productId);
  }
}

// Initialize on deviceready
document.addEventListener('deviceready', () => InAppPurchaseService.initialize());