// Migrar, sembrar, reiniciar y probar la base (versión local). Uso: node scripts/db.mjs migrar|semilla|reiniciar
// Las URLs vienen del entorno o de .env (host y puerto de la base local privada de "npm run local").
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { cargarEnv, definirUrls } from './lib/entorno.mjs';

function ejecutar(orden, args, env) {
  const r = spawnSync(orden, args, { stdio: 'inherit', env: { ...process.env, ...env }, shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`Falló: ${orden} ${args.join(' ')}`);
}

export function prepararEntorno() {
  cargarEnv();
  definirUrls({ host: process.env.DB_HOST_LOCAL ?? 'localhost', puerto: process.env.DB_PUERTO_LOCAL ?? '54329' });
}

export function migrar() {
  // Las migraciones corren con el rol dueño; schema.prisma lee DATABASE_URL.
  ejecutar('npx', ['prisma', 'migrate', 'deploy'], { DATABASE_URL: process.env.MIGRATION_DATABASE_URL });
}

export async function baseVacia() {
  const cliente = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
  await cliente.connect();
  try {
    const { rows } = await cliente.query(
      "select case when to_regclass('public.empresa') is null then 0 else (select count(*) from public.empresa) end as n",
    );
    return Number(rows[0].n) === 0;
  } finally {
    await cliente.end();
  }
}

export function sembrar() {
  // La semilla usa DATABASE_URL (app_empresa) y PLATFORM_DATABASE_URL (app_plataforma).
  ejecutar('npx', ['tsx', 'prisma/semilla/index.ts']);
}

// Pruebas con base real (aislamiento, contadores, servicios): necesitan la base local y la semilla ya cargadas.
export function probar(extra = []) {
  ejecutar('npx', ['vitest', 'run', '--config', 'vitest.base.config.mts', ...extra]);
}

export async function reiniciar() {
  // Vacía el esquema como "migraciones" (prisma/reiniciar.sql, de Datos) y vuelve a migrar y sembrar.
  const sql = readFileSync('prisma/reiniciar.sql', 'utf8');
  const cliente = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
  await cliente.connect();
  try {
    await cliente.query(sql);
  } finally {
    await cliente.end();
  }
  migrar();
  sembrar();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  prepararEntorno();
  const orden = process.argv[2];
  try {
    if (orden === 'migrar') migrar();
    else if (orden === 'semilla') sembrar();
    else if (orden === 'reiniciar') await reiniciar();
    else if (orden === 'probar') probar(process.argv.slice(3));
    else {
      console.error('Uso: node scripts/db.mjs migrar | semilla | reiniciar | probar');
      process.exit(2);
    }
  } catch (e) {
    console.error(String(e.message ?? e));
    process.exit(1);
  }
}
