import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Iron Log — 운동 기록',
        short_name: 'Iron Log',
        description: '로컬 우선 운동 기록 및 디로딩 주기 관리 앱',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        icons: [],
      },
    }),
  ],
});
