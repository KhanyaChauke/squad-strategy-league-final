
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f96f7ec505a9433facacd84793510fb0',
  appName: 'squad-strategy-league',
  webDir: 'dist',
  server: {
    url: "https://f96f7ec5-05a9-433f-acac-d84793510fb0.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2D7D32",
      showSpinner: false
    }
  }
};

export default config;
