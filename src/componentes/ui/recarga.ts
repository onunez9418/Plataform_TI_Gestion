'use client'
// Después de guardar algo bien, la pantalla se recarga completa (conserva la dirección y los filtros) para que la lista
// siempre muestre lo nuevo (DEF-FRO-01: el refresco "suave" de Next a veces dejaba la lista vieja). El mensaje de éxito
// viaja por sessionStorage y lo muestra el visor de mensajes en la pantalla ya recargada.

export type MensajeGuardado = {
  texto: string
  tipo?: 'exito' | 'atencion'
  testid?: string
  /** Dato que se resalta al final del texto (por ejemplo el código del SKU creado). */
  destacado?: { texto: string; testid: string }
  /** Líneas aparte (por ejemplo, los avisos del servidor). */
  detalles?: string[]
  testidDetalles?: string
  /** Un enlace para seguir (por ejemplo, el enlace de ingreso de una persona invitada). */
  enlace?: { ruta: string; texto: string; testid: string; verRuta?: { texto: string; testid: string } }
}

const CLAVE = 'mensaje-guardado'

/** Puerta al navegador, aparte para poder reemplazarla en las pruebas (jsdom no navega). */
export const navegador = {
  recargar(): void {
    window.location.reload()
  },
}

export function dejarMensaje(m: MensajeGuardado): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(m))
  } catch {
    // Sin almacenamiento del navegador: se recarga igual, sin el mensaje.
  }
}

export function tomarMensaje(): MensajeGuardado | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    if (!crudo) return null
    sessionStorage.removeItem(CLAVE)
    const m: unknown = JSON.parse(crudo)
    return m && typeof m === 'object' && typeof (m as MensajeGuardado).texto === 'string' ? (m as MensajeGuardado) : null
  } catch {
    return null
  }
}

export function recargarConMensaje(m: MensajeGuardado | null): void {
  if (m) dejarMensaje(m)
  navegador.recargar()
}
