// QA · «Navegadores» de mentira con su propia cookie, para probar el ingreso sin levantar el servidor web.
import { usarAlmacenDeCookies, type AlmacenCookies } from '../../src/nucleo/acceso/cookies'

export class Navegador implements AlmacenCookies {
  readonly galletas = new Map<string, string>()
  leer(nombre: string) {
    return this.galletas.get(nombre)
  }
  escribir(nombre: string, valor: string) {
    this.galletas.set(nombre, valor)
  }
  borrar(nombre: string) {
    this.galletas.delete(nombre)
  }
  /** Todo lo que se haga dentro de `fn` lo ve la aplicación como hecho desde este navegador. */
  async usando<T>(fn: () => Promise<T>): Promise<T> {
    usarAlmacenDeCookies(this)
    try {
      return await fn()
    } finally {
      usarAlmacenDeCookies(null)
    }
  }
  /** Copia exacta de las cookies (otro navegador con la misma sesión robada). */
  clonar(): Navegador {
    const n = new Navegador()
    for (const [k, v] of this.galletas) n.galletas.set(k, v)
    return n
  }
}

/** Saca el token de «/entrar/enlace?t=...». */
export const tokenDeEnlace = (enlace: string): string => new URL(enlace, 'http://localhost').searchParams.get('t') ?? ''
