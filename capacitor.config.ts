import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.equillabs.noctua',
  appName: 'Noctua',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      launchFadeOutDuration: 400,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_noctua',
      iconColor: '#c9a866',
      sound: 'default',
    },
    // Patch global fetch() to use native URLSession — bypasses WebView CORS/ATS restrictions
    CapacitorHttp: {
      enabled: true,
    },
  },
  ios: {
    // Let WebView extend edge-to-edge; CSS env(safe-area-inset-*) handles spacing
    contentInset: 'never',
    backgroundColor: '#000000',
  },
};

export default config;
