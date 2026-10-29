// Conexiones a PostgreSQL. SOLO este módulo conoce las direcciones de base de datos.
// Roles (ADR-04, versión reducida de la 0.1):
//   DATABASE_URL           -> app_empresa     (toda la aplicación)
//   PLATFORM_DATABASE_URL  -> app_plataforma  (solo crear empresas en la semilla)
// Las contraseñas vienen del entorno; nunca están en el repositorio.

import pg from 'pg'
import { ErrorUsoAislamiento } from './errores-base'

export type NombrePool = 'app' | 'plataforma'

const VARIABLE: Record<NombrePool, string> = {
  app: 'DATABASE_URL',
  plataforma: 'PLATFORM_DATABASE_URL',
}

// Tipos: bigint pequeño -> number; date -> texto 'AAAA-MM-DD' (sin corrimiento de zona horaria);
// numeric queda como texto para no perder decimales (dinero y cantidades).
const OID_INT8 = 20
const OID_DATE = 1082
const tipos = {
  getTypeParser(oid: number, formato?: 'text' | 'binary') {
    if (oid === OID_INT8) {
      return (v: string) => {
        const n = Number(v)
        return Number.isSafeInteger(n) ? n : v
      }
    }
    if (oid === OID_DATE) return (v: string) => v
    return pg.types.getTypeParser(oid, formato ?? 'text')
  },
}

const registro = globalThis as unknown as { __poolsAislamiento?: Map<NombrePool, pg.Pool> }

export function poolDe(nombre: NombrePool): pg.Pool {
  registro.__poolsAislamiento ??= new Map()
  const existente = registro.__poolsAislamiento.get(nombre)
  if (existente) return existente

  const url = process.env[VARIABLE[nombre]]
  if (!url) {
    throw new ErrorUsoAislamiento(`Falta la variable de entorno ${VARIABLE[nombre]} (dirección de la base de datos).`)
  }
  const pool = new pg.Pool({
    connectionString: url,
    max: Number(process.env.DB_POOL_MAX ?? 10),
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    types: tipos,
  })
  // Un error en una conexión ociosa no debe tumbar el proceso.
  pool.on('error', (e) => console.error('[aislamiento] error en conexión ociosa:', e.message))
  registro.__poolsAislamiento.set(nombre, pool)
  return pool
}

/** Cierra todas las conexiones (fin de la semilla y de las pruebas). */
export async function cerrarConexiones(): Promise<void> {
  const pools = registro.__poolsAislamiento
  if (!pools) return
  registro.__poolsAislamiento = undefined
  await Promise.all([...pools.values()].map((p) => p.end()))
}
