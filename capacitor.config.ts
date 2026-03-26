import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tujague.app',
  appName: 'Tujague Strength',
  webDir: 'out',
  server: {
    // 🔥 ACÁ VA TU LINK REAL DE VERCEL (Ej: https://tujague.vercel.app) 🔥
    url: 'https://tujague-strength.vercel.app/login', 
    cleartext: true
  }
};

export default config;