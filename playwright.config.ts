import { defineConfig } from '@playwright/test';

// Recorrido del guion de la demo contra la aplicación ya levantada (docker compose o npm run local).
export default defineConfig({
  testDir: './pruebas/recorrido',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: { baseURL: process.env.URL_BASE ?? 'http://localhost:3000', trace: 'retain-on-failure' },
});
