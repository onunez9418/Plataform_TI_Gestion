import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Pruebas que necesitan la base de datos real (variables DATABASE_URL, etc. en el entorno o en .env).
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['pruebas/aislamiento/**/*.test.ts', 'src/**/*.integracion.test.ts', 'src/**/*.db.test.ts'],
    env: { PRUEBAS_BD: '1' },
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
