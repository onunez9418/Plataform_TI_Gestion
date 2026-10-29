// Puerta única a la base de datos (ADR-03, plan-etapa-1 A.6).
//
// REGLAS
//   * conEmpresa es la ÚNICA forma de tocar tablas de una empresa: abre una transacción y
//     fija la empresa con set_config(..., true) (local a la transacción). Nadie más llama a
//     set_config ni a SET; Tx.consultar rechaza ese SQL.
//   * conGlobal: transacción SIN empresa, solo para usuario, sesion, enlace_ingreso, empresa y
//     la función mis_empresas(usuario_id). Las tablas de empresa devuelven cero filas.
//   * conPlataforma: lo usa solo la semilla (crear la fila de `empresa`).
//   * El SQL lleva marcadores $1, $2...; nunca se concatenan valores en el texto.
//   * No se anidan: dentro de la función recibida se usa el `tx` que ya se tiene.
//   * Si una sentencia falla, la transacción queda abortada (comportamiento de PostgreSQL):
//     para probar algo que puede fallar y seguir, usa `tx.intentar(...)` (punto de guardado).

import { AsyncLocalStorage } from 'node:async_hooks'
import type pg from 'pg'
import { poolDe, cerrarConexiones, type NombrePool } from './cliente'
import { ErrorBaseDatos, ErrorUsoAislamiento } from './errores-base'
import { validarSql } from './sql-permitido'

export { ErrorBaseDatos, ErrorUsoAislamiento } from './errores-base'
export { cerrarConexiones }

export interface Tx {
  /** Empresa fijada en esta transacción (nula en conGlobal y conPlataforma). */
  readonly empresaId: string | null
  /** Ejecuta una sentencia con marcadores $1, $2... y devuelve las filas (columnas en snake_case). */
  consultar<T = Record<string, unknown>>(sql: string, valores?: readonly unknown[]): Promise<T[]>
  /** Igual, pero devuelve cuántas filas afectó (INSERT/UPDATE/DELETE). */
  ejecutar(sql: string, valores?: readonly unknown[]): Promise<number>
  /**
   * Ejecuta `fn` dentro de un punto de guardado: si lanza, se deshace solo lo de `fn` y la
   * transacción sigue viva (útil para reintentar un código duplicado, ADR-15).
   */
  intentar<T>(fn: () => Promise<T>): Promise<T>
}

export interface OpcionesTransaccion {
  /** Plazo total de la transacción; por defecto 60 s, máximo 240 s (ADR-03: tope de 4 minutos). */
  plazoMs?: number
}

const PLAZO_POR_DEFECTO_MS = 60_000
const PLAZO_MAXIMO_MS = 240_000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function aErrorBase(e: unknown): unknown {
  const x = e as { code?: unknown; message?: unknown; constraint?: unknown; table?: unknown; severity?: unknown }
  // Los errores de PostgreSQL traen severity y un código de 5 caracteres.
  if (x && typeof x.code === 'string' && x.code.length === 5 && typeof x.severity === 'string') {
    return new ErrorBaseDatos(
      String(x.message ?? 'Error de base de datos'),
      x.code,
      typeof x.constraint === 'string' ? x.constraint : undefined,
      typeof x.table === 'string' ? x.table : undefined,
    )
  }
  return e
}

class TxImpl implements Tx {
  private puntos = 0
  constructor(
    private readonly cliente: pg.PoolClient,
    readonly empresaId: string | null,
  ) {}

  async consultar<T = Record<string, unknown>>(sql: string, valores: readonly unknown[] = []): Promise<T[]> {
    validarSql(sql)
    try {
      const r = await this.cliente.query(sql, valores as unknown[])
      return r.rows as T[]
    } catch (e) {
      throw aErrorBase(e)
    }
  }

  async ejecutar(sql: string, valores: readonly unknown[] = []): Promise<number> {
    validarSql(sql)
    try {
      const r = await this.cliente.query(sql, valores as unknown[])
      return r.rowCount ?? 0
    } catch (e) {
      throw aErrorBase(e)
    }
  }

  async intentar<T>(fn: () => Promise<T>): Promise<T> {
    const nombre = `sp_${++this.puntos}`
    await this.cliente.query(`SAVEPOINT ${nombre}`)
    try {
      const r = await fn()
      await this.cliente.query(`RELEASE SAVEPOINT ${nombre}`)
      return r
    } catch (e) {
      await this.cliente.query(`ROLLBACK TO SAVEPOINT ${nombre}`)
      throw e
    }
  }
}

const dentro = new AsyncLocalStorage<true>()

async function transaccion<T>(
  pool: NombrePool,
  empresaId: string | null,
  fn: (tx: Tx) => Promise<T>,
  opciones: OpcionesTransaccion | undefined,
): Promise<T> {
  if (dentro.getStore()) {
    throw new ErrorUsoAislamiento('conEmpresa/conGlobal no se anidan: usa el `tx` que ya recibiste.')
  }
  const plazo = Math.min(opciones?.plazoMs ?? PLAZO_POR_DEFECTO_MS, PLAZO_MAXIMO_MS)
  const cliente = await poolDe(pool).connect()
  let destruir = false
  let temporizador: NodeJS.Timeout | undefined
  // Una conexión cortada por el servidor emite 'error' en el cliente prestado; sin escucha tumbaría el proceso.
  const alErrorDeConexion = () => {
    destruir = true
  }
  cliente.on('error', alErrorDeConexion)
  try {
    await cliente.query('BEGIN')
    if (empresaId !== null) {
      // ÚNICO set_config del sistema: local a la transacción (seguro con agrupador en modo transacción).
      await cliente.query({ text: "SELECT set_config('app.empresa_id', $1, true)", values: [empresaId] })
    }
    const tx = new TxImpl(cliente, empresaId)
    const trabajo = dentro.run(true, () => fn(tx))
    const limite = new Promise<never>((_, rechazar) => {
      temporizador = setTimeout(() => {
        destruir = true // se descarta la conexión: la base deshace la transacción al cortarse
        rechazar(new ErrorUsoAislamiento(`La transacción superó el plazo de ${plazo} ms y se canceló.`))
      }, plazo)
    })
    trabajo.catch(() => undefined) // evita aviso si el plazo gana la carrera
    const resultado = await Promise.race([trabajo, limite])
    await cliente.query('COMMIT')
    return resultado
  } catch (e) {
    if (!destruir) {
      try {
        await cliente.query('ROLLBACK')
      } catch {
        destruir = true
      }
    }
    throw aErrorBase(e)
  } finally {
    if (temporizador) clearTimeout(temporizador)
    cliente.removeListener('error', alErrorDeConexion)
    cliente.release(destruir ? true : undefined)
  }
}

/** Única puerta a las tablas de una empresa. `empresaId` sale de la dirección verificada (ADR-05), nunca del cliente. */
export function conEmpresa<T>(empresaId: string, fn: (tx: Tx) => Promise<T>, opciones?: OpcionesTransaccion): Promise<T> {
  if (typeof empresaId !== 'string' || !UUID.test(empresaId)) {
    throw new ErrorUsoAislamiento('conEmpresa recibió un identificador de empresa que no es un UUID.')
  }
  return transaccion('app', empresaId.toLowerCase(), fn, opciones)
}

/** Transacción sin empresa: usuario, sesion, enlace_ingreso, empresa y mis_empresas(usuario_id). Las tablas de empresa dan cero filas. */
export function conGlobal<T>(fn: (tx: Tx) => Promise<T>, opciones?: OpcionesTransaccion): Promise<T> {
  return transaccion('app', null, fn, opciones)
}

/** Solo para la semilla y la creación de empresas: entra como app_plataforma, que no lee tablas de negocio. */
export function conPlataforma<T>(fn: (tx: Tx) => Promise<T>, opciones?: OpcionesTransaccion): Promise<T> {
  return transaccion('plataforma', null, fn, opciones)
}

/**
 * Reserva de contador en una sola sentencia, sin transacción abierta (ADR-15). La usa
 * nucleo/contadores; los servicios llaman a `reservarContador` o `siguienteContador`.
 */
export async function reservarSiguiente(empresaId: string, clave: string, n: number): Promise<number> {
  if (!UUID.test(empresaId)) throw new ErrorUsoAislamiento('reservarSiguiente: la empresa no es un UUID.')
  try {
    const r = await poolDe('app').query<{ ultimo: number | string }>(
      'SELECT public.siguiente($1::uuid, $2::text, $3::integer) AS ultimo',
      [empresaId.toLowerCase(), clave, n],
    )
    return Number(r.rows[0]!.ultimo)
  } catch (e) {
    throw aErrorBase(e)
  }
}
