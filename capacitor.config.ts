import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.garretthoughton.noctua',
  appName: 'Noctua',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_noctua',
      iconColor: '#c9a866',
      sound: 'default',
    },
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
