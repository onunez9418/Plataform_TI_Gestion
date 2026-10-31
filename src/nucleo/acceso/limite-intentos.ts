// Límite de intentos al pedir enlaces de ingreso (H-SEG-L09, D-054): por correo y por origen.
// En memoria del proceso: basta para la versión local (un solo proceso). Con varias copias de la aplicación
// habría que moverlo a la base; queda anotado para la Etapa 1. Se cuenta TODO pedido con un correo de forma
// válida, exista o no la cuenta, para que el límite tampoco delate qué correos existen.

import { ErrorDeNegocio } from '../errores'
import { huellaDe } from './tokens'

export type ConfigLimite = { ventanaMs: number; maxPorCorreo: number; maxPorOrigen: number }

const entero = (valor: string | undefined, porOmision: number): number => {
  const n = Number(valor)
  return Number.isInteger(n) && n > 0 ? n : porOmision
}

/** 5 pedidos por correo y 20 por origen cada 10 minutos. Ajustables con variables de entorno (p. ej. pruebas de recorrido). */
export function configPorOmision(env: Readonly<Record<string, string | undefined>> = process.env): ConfigLimite {
  return {
    ventanaMs: entero(env.LIMITE_ENLACES_MINUTOS, 10) * 60_000,
    maxPorCorreo: entero(env.LIMITE_ENLACES_POR_CORREO, 5),
    maxPorOrigen: entero(env.LIMITE_ENLACES_POR_ORIGEN, 20),
  }
}

const MAX_CLAVES = 5_000

const porCorreo = new Map<string, number[]>()
const porOrigen = new Map<string, number[]>()

/** Solo para pruebas: vacía los contadores. */
export function reiniciarLimitesDeEnlaces(): void {
  porCorreo.clear()
  porOrigen.clear()
}

function vigentes(mapa: Map<string, number[]>, clave: string, desde: number): number[] {
  const marcas = (mapa.get(clave) ?? []).filter((t) => t > desde)
  if (marcas.length === 0) mapa.delete(clave)
  else mapa.set(clave, marcas)
  return marcas
}

function acotar(mapa: Map<string, number[]>, desde: number): void {
  if (mapa.size <= MAX_CLAVES) return
  for (const clave of [...mapa.keys()]) vigentes(mapa, clave, desde)
  // Si aun así hay demasiadas claves distintas (ataque con muchos correos), se olvidan las más antiguas.
  for (const clave of mapa.keys()) {
    if (mapa.size <= MAX_CLAVES) break
    mapa.delete(clave)
  }
}

const esperaEnMinutos = (ms: number): number => Math.max(1, Math.ceil(ms / 60_000))

/**
 * Registra un pedido de enlace y LANZA si el correo o el origen ya pidieron demasiados en la ventana.
 * Un pedido rechazado no suma. `correoNormalizado` ya viene en minúsculas y sin espacios.
 */
export function registrarPedidoDeEnlace(
  correoNormalizado: string,
  origen: string,
  ahora: number = Date.now(),
  config: ConfigLimite = configPorOmision(),
): void {
  const desde = ahora - config.ventanaMs
  const claveCorreo = huellaDe(correoNormalizado)
  const claveOrigen = huellaDe(origen)
  const delCorreo = vigentes(porCorreo, claveCorreo, desde)
  const delOrigen = vigentes(porOrigen, claveOrigen, desde)

  const excedido = delCorreo.length >= config.maxPorCorreo ? delCorreo : delOrigen.length >= config.maxPorOrigen ? delOrigen : null
  if (excedido) {
    const minutos = esperaEnMinutos((excedido[0] as number) + config.ventanaMs - ahora)
    const mensaje =
      `Se pidieron demasiados enlaces en pocos minutos. Espere ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} ` +
      'e inténtelo de nuevo; mientras tanto puede usar el último enlace que recibió.'
    throw new ErrorDeNegocio('VALIDACION', mensaje, { correo: mensaje })
  }

  porCorreo.set(claveCorreo, [...delCorreo, ahora])
  porOrigen.set(claveOrigen, [...delOrigen, ahora])
  acotar(porCorreo, desde)
  acotar(porOrigen, desde)
}
