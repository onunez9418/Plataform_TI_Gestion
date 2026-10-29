// Correlativos atómicos y sin repetir nunca (ADR-15). Envoltorio de la función SQL
// siguiente(empresa_id, clave, n) (SECURITY INVOKER; ver migración 0002).
//
// Claves: 'sku:<PREFIJO>' (p. ej. 'sku:LAP'), 'doc:<PREFIJO>' ('doc:OC', 'doc:RCP', 'doc:ACTV') y 'prs'.
// Forma exacta: la primera reserva de n devuelve n (rango 1..n); las siguientes suman n.
// El valor devuelto es el ÚLTIMO número del rango: rango = (ultimo - n + 1) .. ultimo.
// Pueden quedar saltos (una operación que falla después de reservar); repeticiones, nunca.

import { reservarSiguiente, ErrorUsoAislamiento, type Tx } from '../aislamiento'

const CLAVE = /^(sku:[A-Z0-9]{2,5}|doc:[A-Z]{2,5}(-[A-Z])?|prs)$/

function validar(clave: string, n: number): void {
  if (!CLAVE.test(clave)) {
    throw new ErrorUsoAislamiento(`Clave de contador inválida: "${clave}". Use sku:<PREFIJO>, doc:<PREFIJO> o prs.`)
  }
  if (!Number.isInteger(n) || n < 1 || n > 10_000) {
    throw new ErrorUsoAislamiento('La cantidad a reservar debe ser un entero entre 1 y 10.000.')
  }
}

/**
 * Reserva dentro de la transacción `tx` que ya está abierta con conEmpresa. La fila del contador
 * queda bloqueada hasta el commit: quien crea el mismo prefijo a la vez espera, y nunca hay repetidos.
 * Para importaciones o trabajos largos usa `reservarContador` (antes de abrir la transacción).
 */
export async function siguienteContador(tx: Tx, clave: string, n = 1): Promise<number> {
  validar(clave, n)
  if (tx.empresaId === null) {
    throw new ErrorUsoAislamiento('siguienteContador necesita una transacción de conEmpresa.')
  }
  const filas = await tx.consultar<{ ultimo: number | string }>(
    'SELECT public.siguiente($1::uuid, $2::text, $3::integer) AS ultimo',
    [tx.empresaId, clave, n],
  )
  return Number(filas[0]!.ultimo)
}

/**
 * Reserva en una sola sentencia, sin transacción propia (patrón de ADR-15): llámala ANTES de
 * abrir conEmpresa. Si la operación posterior falla, queda un salto, que está permitido.
 */
export async function reservarContador(empresaId: string, clave: string, n = 1): Promise<number> {
  validar(clave, n)
  return reservarSiguiente(empresaId, clave, n)
}

/** Da formato visible: formatearCorrelativo('LAP', 1) = 'LAP-0001'. El ancho es un mínimo, no un tope (RF-SKU-003). */
export function formatearCorrelativo(prefijo: string, numero: number, ancho = 4): string {
  return `${prefijo}-${String(numero).padStart(ancho, '0')}`
}

/** Clave del contador de SKU para un prefijo de categoría. */
export function claveSku(prefijo: string): string {
  return `sku:${prefijo.toUpperCase()}`
}
