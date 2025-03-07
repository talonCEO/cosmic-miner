
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourusername.clickgame', // REPLACE with your unique app ID
  appName: 'Cosmic Miner', // REPLACE with your game name
  webDir: 'dist',
  server: {
    // For development only - remove for production build
    url: 'http://localhost:8080',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    // Add AdMob configuration
    AdMob: {
      androidAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', // REPLACE with your AdMob app ID
    }
  }
};

export default config;
