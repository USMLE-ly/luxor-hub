import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luxor.app',
  appName: 'LEXOR',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'lexor',
    hostname: 'luxor.ly'
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    backgroundColor: '#0A0A0B',
    minVersion: '15.0',
    scheme: 'LEXOR'
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0A0A0B',
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert', 'banner', 'list']
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0A0A0B',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      useDialog: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0B',
      overlaysWebView: true
    },
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    }
  },
  cordova: {
    preferences: {
      DisableDeploy: 'true',
      EnableViewportScale: 'false',
      SuppressesIncrementalRendering: 'true',
      SuppressesLongPressGesture: 'true',
      UIWebViewDecelerationSpeed: 'fast'
    }
  }
};

export default config;
