// `npm run local`: levanta TODO sin Docker, para desarrollo y pruebas del equipo:
//   PostgreSQL 16 privado en .local/ (solo 127.0.0.1, puerto 54329) -> roles -> migraciones -> semilla -> aplicación.
// Opciones: --solo-base (deja solo la base lista)  --detener-base (apaga la base y termina)
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { join, resolve } from 'node:path';
import pg from 'pg';
import { cargarEnv, crearEnvSiFalta, definirUrls } from './lib/entorno.mjs';
import { migrar, baseVacia, sembrar } from './db.mjs';

const PUERTO = process.env.DB_PUERTO_LOCAL ?? '54329';
const DIR = resolve('.local');
const PGDATA = join(DIR, 'pgdata');
const SOCK = join(DIR, 'sock');
const LOG = join(DIR, 'log', 'postgres.log');
const esRoot = typeof process.getuid === 'function' && process.getuid() === 0;

function carpetaBin() {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  const base = '/usr/lib/postgresql';
  if (existsSync(base)) {
    const versiones = readdirSync(base).filter((v) => existsSync(join(base, v, 'bin', 'initdb'))).sort((a, b) => Number(b) - Number(a));
    if (versiones.length) return join(base, versiones[0], 'bin');
  }
  return ''; // se usa el PATH
}
const BIN = carpetaBin();
const bin = (n) => (BIN ? join(BIN, n) : n);

function correr(orden, args, opciones = {}) {
  const r = spawnSync(orden, args, { stdio: 'inherit', ...opciones });
  if (r.status !== 0) throw new Error(`Falló: ${orden} ${args.join(' ')}`);
}
// PostgreSQL se niega a correr como administrador (root): en ese caso lo corre el usuario "postgres".
function comoPostgres(orden, args, opciones) {
  return esRoot ? correr('runuser', ['-u', 'postgres', '--', orden, ...args], opciones) : correr(orden, args, opciones);
}

async function esperarBase() {
  for (let i = 0; i < 60; i++) {
    try {
      const c = new pg.Client({ host: '127.0.0.1', port: Number(PUERTO), user: 'postgres', password: process.env.POSTGRES_PASSWORD, database: 'postgres' });
      await c.connect();
      await c.end();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('La base local no respondió. Revise .local/log/postgres.log');
}

async function prepararBase() {
  mkdirSync(join(DIR, 'log'), { recursive: true });
  mkdirSync(SOCK, { recursive: true });
  if (esRoot) {
    chmodSync(DIR, 0o755);
    correr('chown', ['-R', 'postgres', DIR]);
  }
  if (!existsSync(join(PGDATA, 'PG_VERSION'))) {
    console.log('[local] Creando la base local privada (primera vez)...');
    const archivoClave = join(DIR, 'clave.tmp');
    writeFileSync(archivoClave, process.env.POSTGRES_PASSWORD, { mode: 0o644 });
    try {
      comoPostgres(bin('initdb'), ['-D', PGDATA, '-U', 'postgres', '-E', 'UTF8', '--auth=scram-sha-256', `--pwfile=${archivoClave}`]);
    } finally {
      rmSync(archivoClave, { force: true });
    }
  }
  const estado = spawnSync(esRoot ? 'runuser' : bin('pg_ctl'), esRoot ? ['-u', 'postgres', '--', bin('pg_ctl'), '-D', PGDATA, 'status'] : ['-D', PGDATA, 'status'], { stdio: 'ignore' });
  if (estado.status !== 0) {
    console.log('[local] Iniciando PostgreSQL en 127.0.0.1:' + PUERTO + ' ...');
    comoPostgres(bin('pg_ctl'), ['-D', PGDATA, '-l', LOG, '-w', '-o', `-p ${PUERTO} -k ${SOCK} -c listen_addresses=127.0.0.1`, 'start']);
  }
  await esperarBase();

  const admin = new pg.Client({ host: '127.0.0.1', port: Number(PUERTO), user: 'postgres', password: process.env.POSTGRES_PASSWORD, database: 'postgres' });
  await admin.connect();
  try {
    const { rowCount } = await admin.query("select 1 from pg_database where datname = 'plataforma'");
    if (!rowCount) await admin.query('create database plataforma');
  } finally {
    await admin.end();
  }
  // Roles (repetible; también actualiza las contraseñas si cambió .env).
  correr(bin('psql'), [
    '-X', '-q', '-h', '127.0.0.1', '-p', PUERTO, '-U', 'postgres', '-d', 'plataforma', '-v', 'ON_ERROR_STOP=1',
    '-v', `p_migraciones=${process.env.PG_PASS_MIGRACIONES}`,
    '-v', `p_app_empresa=${process.env.PG_PASS_APP_EMPRESA}`,
    '-v', `p_app_plataforma=${process.env.PG_PASS_APP_PLATAFORMA}`,
    '-v', `p_lector_auditoria=${process.env.PG_PASS_LECTOR_AUDITORIA}`,
    '-f', 'scripts/db-init/roles.psql',
  ], { env: { ...process.env, PGPASSWORD: process.env.POSTGRES_PASSWORD } });
}

crearEnvSiFalta();
cargarEnv();

if (process.argv.includes('--detener-base')) {
  comoPostgres(bin('pg_ctl'), ['-D', PGDATA, '-m', 'fast', 'stop']);
  process.exit(0);
}

await prepararBase();
process.env.DB_PUERTO_LOCAL = PUERTO;
definirUrls({ host: 'localhost', puerto: PUERTO });
Object.assign(process.env, { MODO_LOCAL: '1', ENTORNO: 'desarrollo', APP_URL: 'http://localhost:3000' });

if (existsSync('prisma/schema.prisma')) migrar();
else console.warn('[local] AVISO: aún no hay prisma/schema.prisma; no se migra.');
if (existsSync('prisma/semilla/index.ts')) {
  if (await baseVacia()) sembrar();
  else console.log('[local] La base ya tiene datos; no se carga la semilla.');
} else console.warn('[local] AVISO: aún no hay prisma/semilla/index.ts; no hay datos de ejemplo.');

if (process.argv.includes('--solo-base')) {
  console.log('[local] Base lista en localhost:' + PUERTO + ' (URLs en .env + scripts/lib/entorno.mjs).');
  process.exit(0);
}
console.log('[local] Iniciando la aplicación en http://localhost:3000 (Ctrl+C para salir; la base sigue encendida).');
const app = spawn('npx', ['next', 'dev', '-p', '3000'], { stdio: 'inherit', env: process.env });
app.on('exit', (codigo) => process.exit(codigo ?? 0));
