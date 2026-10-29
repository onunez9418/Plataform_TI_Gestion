import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

// Configuración propia del recorrido de QA (la raíz tiene otra, de DevOps, que no sabe de este navegador).
// Uso:  URL_BASE=http://127.0.0.1:3100 npx playwright test --config pruebas/recorrido/playwright.config.ts
// Si el navegador que instala Playwright no es el que hay en el equipo, se usa CHROMIUM_PATH o el de /opt/pw-browsers.
const candidato = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'
const ejecutable = process.env.CHROMIUM_PATH ?? (existsSync(candidato) ? candidato : undefined)

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 180_000,
  expect: { timeout: 30_000 },
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.URL_BASE ?? 'http://localhost:3000',
    trace: 'off',
    screenshot: 'only-on-failure',
    launchOptions: { ...(ejecutable ? { executablePath: ejecutable } : {}), args: ['--no-sandbox'] },
  },
  outputDir: process.env.SALIDA_PRUEBAS ?? '/tmp/qa-recorrido-salida',
})
