import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'budget-challenge',
  brand: {
    displayName: 'budget-challenge',
    primaryColor: '#3182F6',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
});
