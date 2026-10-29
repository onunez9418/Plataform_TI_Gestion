import type { CodigoError, ErrorNegocio, Resultado } from './tipos-comunes'

/** Error de negocio lanzable. Los servicios lanzan esto; las acciones lo convierten en `Resultado`. */
export class ErrorDeNegocio extends Error implements ErrorNegocio {
  readonly codigo: CodigoError
  readonly mensaje: string
  readonly campos?: Record<string, string>

  constructor(codigo: CodigoError, mensaje: string, campos?: Record<string, string>) {
    super(mensaje)
    this.name = 'ErrorDeNegocio'
    this.codigo = codigo
    this.mensaje = mensaje
    if (campos) this.campos = campos
  }

  aDatos(): ErrorNegocio {
    return this.campos
      ? { codigo: this.codigo, mensaje: this.mensaje, campos: this.campos }
      : { codigo: this.codigo, mensaje: this.mensaje }
  }
}

export const sinAcceso = (mensaje = 'No tiene acceso a esta empresa. Vuelva a ingresar o elija otra.') =>
  new ErrorDeNegocio('SIN_ACCESO', mensaje)
export const sinPermiso = (mensaje = 'No tiene permiso para realizar esta acción.') =>
  new ErrorDeNegocio('SIN_PERMISO', mensaje)
export const noEncontrado = (que = 'El registro') =>
  new ErrorDeNegocio('NO_ENCONTRADO', `${que} no existe o ya no está disponible.`)
export const duplicado = (mensaje: string, campos?: Record<string, string>) =>
  new ErrorDeNegocio('DUPLICADO', mensaje, campos)
export const validacion = (mensaje: string, campos?: Record<string, string>) =>
  new ErrorDeNegocio('VALIDACION', mensaje, campos)
export const separacionFunciones = (mensaje: string) => new ErrorDeNegocio('SEPARACION_FUNCIONES', mensaje)
export const enlaceInvalido = (
  mensaje = 'El enlace no es válido o ya venció. Pida uno nuevo.',
) => new ErrorDeNegocio('ENLACE_INVALIDO', mensaje)
export const conflicto = (mensaje: string) => new ErrorDeNegocio('CONFLICTO', mensaje)

export const noImplementado = (nombre: string) =>
  new ErrorDeNegocio('ERROR_INTERNO', `La función «${nombre}» todavía no está disponible.`)

export const esErrorDeNegocio = (e: unknown): e is ErrorDeNegocio => e instanceof ErrorDeNegocio

/**
 * Para las acciones del Frontend: ejecuta un servicio y lo vuelve `Resultado`.
 * Lo inesperado se registra en el servidor y al usuario solo le llega un mensaje genérico.
 */
export async function comoResultado<T>(fn: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { ok: true, datos: await fn() }
  } catch (e) {
    if (esErrorDeNegocio(e)) return { ok: false, error: e.aDatos() }
    console.error('Error inesperado en un servicio:', e)
    return {
      ok: false,
      error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un problema inesperado. Intente de nuevo.' },
    }
  }
}
