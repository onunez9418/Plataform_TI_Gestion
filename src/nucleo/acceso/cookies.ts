// Cookies de sesión (ADR-08). En local (MODO_LOCAL, http://localhost) se usan nombres sin el prefijo
// `__Host-` y sin `Secure`, como permite el ADR solo fuera de producción; en cualquier otro caso, con ellos.

import { modoLocalSolicitado } from '../configuracion'

export type OpcionesCookie = { maxAgeSegundos: number }

/** Puerta a las cookies. En el servidor real usa `next/headers`; las pruebas ponen una de memoria. */
export interface AlmacenCookies {
  leer(nombre: string): Promise<string | undefined> | string | undefined
  escribir(nombre: string, valor: string, opciones: OpcionesCookie & { secure: boolean }): Promise<void> | void
  borrar(nombre: string): Promise<void> | void
}

let almacen: AlmacenCookies | null = null

/** Solo para pruebas. Pasar `null` vuelve al almacén de Next. */
export function usarAlmacenDeCookies(nuevo: AlmacenCookies | null): void {
  almacen = nuevo
}

async function almacenActual(): Promise<AlmacenCookies> {
  if (almacen) return almacen
  const { cookies } = await import('next/headers')
  return {
    async leer(nombre) {
      return (await cookies()).get(nombre)?.value
    },
    async escribir(nombre, valor, { maxAgeSegundos, secure }) {
      ;(await cookies()).set(nombre, valor, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure,
        maxAge: maxAgeSegundos,
      })
    },
    async borrar(nombre) {
      ;(await cookies()).delete(nombre)
    },
  }
}

const secure = (): boolean => !modoLocalSolicitado()
const nombre = (base: 'sid' | 'nav'): string => (secure() ? `__Host-${base}` : base)

export const COOKIE_SESION = (): string => nombre('sid')
export const COOKIE_NAVEGADOR = (): string => nombre('nav')

export async function leerCookie(n: string): Promise<string | undefined> {
  return (await almacenActual()).leer(n)
}
export async function escribirCookie(n: string, valor: string, maxAgeSegundos: number): Promise<void> {
  await (await almacenActual()).escribir(n, valor, { maxAgeSegundos, secure: secure() })
}
export async function borrarCookie(n: string): Promise<void> {
  await (await almacenActual()).borrar(n)
}
