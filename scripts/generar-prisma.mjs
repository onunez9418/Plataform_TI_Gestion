// Genera el cliente de Prisma solo si Datos ya publicó prisma/schema.prisma.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

if (!existsSync('prisma/schema.prisma')) {
  console.log('[prisma] Todavía no hay prisma/schema.prisma; se omite "prisma generate".');
  process.exit(0);
}
// Prisma exige DATABASE_URL al leer el esquema, aunque generar no se conecta.
const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://x:x@localhost:5432/x' };
const r = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit', env, shell: process.platform === 'win32' });
process.exit(r.status ?? 1);
