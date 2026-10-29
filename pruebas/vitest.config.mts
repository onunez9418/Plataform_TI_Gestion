import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Pruebas de QA que necesitan la base de datos real (aislamiento, permisos entre módulos, acceso).
// Se corren con:  npx vitest run --config pruebas/vitest.config.mts
// Variables necesarias (las mismas que usa la aplicación): DATABASE_URL (app_empresa),
// PLATFORM_DATABASE_URL (app_plataforma) y, solo para cortar conexiones a propósito, MIGRATION_DATABASE_URL.
// Si faltan, las pruebas FALLAN a propósito (no se saltan): no ejecutar no es aprobar.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['pruebas/aislamiento/**/*.test.ts', 'pruebas/permisos/**/*.test.ts', 'pruebas/acceso/**/*.test.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
