import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Pruebas rápidas, sin base de datos ni servidor: las corre `npm run verificar` y la integración continua.
// Las de base real (pruebas/aislamiento) y el recorrido (pruebas/recorrido) van aparte.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'pruebas/arranque/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'pruebas/aislamiento/**', 'pruebas/recorrido/**'],
  },
});
