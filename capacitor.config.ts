import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.abmodel.app',
  appName: 'TeLlevoApp',
  webDir: 'www',
  server: {
    url: 'http://localhost:8100',
    cleartext: true
  }
};

export default config;
