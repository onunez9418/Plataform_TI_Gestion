import { claveSku, formatearCorrelativo, reservarContador } from '../../../nucleo/contadores'

/** Reserva el siguiente número del prefijo (fuera de la transacción principal, ADR-15) y devuelve `PREFIJO-0001`. */
export async function siguienteContadorFuera(empresaId: string, prefijo: string): Promise<string> {
  const numero = await reservarContador(empresaId, claveSku(prefijo), 1)
  return formatearCorrelativo(prefijo, numero)
}
