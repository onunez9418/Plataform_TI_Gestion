// Utilidades compartidas por los scripts de arranque local (sin dependencias externas).
import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

export const CLAVES_SECRETAS = [
  'POSTGRES_PASSWORD',
  'PG_PASS_MIGRACIONES',
  'PG_PASS_APP_EMPRESA',
  'PG_PASS_APP_PLATAFORMA',
  'PG_PASS_LECTOR_AUDITORIA',
  'AUTH_SECRET',
];

/** Crea ".env" con contraseñas aleatorias si no existe. Devuelve true si lo creó. */
export function crearEnvSiFalta(ruta = '.env') {
  if (existsSync(ruta)) return false;
  const lineas = [
    '# Creado automaticamente. Contiene contrasenas aleatorias SOLO de esta computadora.',
    '# No lo comparta ni lo suba a ningun sitio. Si lo borra, se crea otro (y la base se debe reiniciar).',
    ...CLAVES_SECRETAS.map((k) => `${k}=${randomBytes(24).toString('hex')}`),
    '',
  ];
  writeFileSync(ruta, lineas.join('\n'), { encoding: 'utf8', mode: 0o600 });
  return true;
}

/** Carga ".env" sin pisar variables que ya vengan del entorno. */
export function cargarEnv(ruta = '.env') {
  if (existsSync(ruta)) process.loadEnvFile(ruta);
}

/** Define las URLs de los cuatro roles si no vienen dadas, para una base en host:puerto. */
export function definirUrls({ host, puerto, base = 'plataforma' }) {
  const url = (rol, clave) => `postgres://${rol}:${process.env[clave]}@${host}:${puerto}/${base}`;
  process.env.DATABASE_URL ??= url('app_empresa', 'PG_PASS_APP_EMPRESA');
  process.env.PLATFORM_DATABASE_URL ??= url('app_plataforma', 'PG_PASS_APP_PLATAFORMA');
  process.env.MIGRATION_DATABASE_URL ??= url('migraciones', 'PG_PASS_MIGRACIONES');
  process.env.AUDIT_READER_DATABASE_URL ??= url('lector_auditoria', 'PG_PASS_LECTOR_AUDITORIA');
}
