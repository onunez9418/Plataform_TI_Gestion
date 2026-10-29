// Tipos que comparten todos los módulos (contrato A.6.2 del plan de la versión local 0.1).

/** Quién está pidiendo la acción, en qué empresa y con qué permisos. Lo construye `obtenerContexto`. */
export type Contexto = {
  usuarioId: string
  empresaId: string
  empresaSlug: string
  rolId: string
  permisos: ReadonlySet<string>
  /** Agregado a lo pactado: la membresía es la "autora" de la auditoría. */
  membresiaId: string
  /** Agregado a lo pactado: para mostrar en pantalla («Hola, ...»). */
  usuarioNombre: string
}

export type CodigoError =
  | 'SIN_ACCESO'
  | 'SIN_PERMISO'
  | 'NO_ENCONTRADO'
  | 'DUPLICADO'
  | 'VALIDACION'
  | 'SEPARACION_FUNCIONES'
  | 'ENLACE_INVALIDO'
  | 'CONFLICTO'
  /** Agregado a lo pactado: fallo inesperado; el mensaje es genérico y no revela detalles internos. */
  | 'ERROR_INTERNO'

export type ErrorNegocio = {
  codigo: CodigoError
  /** Español claro, apto para el usuario final. */
  mensaje: string
  /** Mensajes por campo del formulario (clave = nombre del campo). */
  campos?: Record<string, string>
}

/** Lo que devuelven las acciones del Frontend. */
export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: ErrorNegocio }

/**
 * Puerta mínima a la base dentro de una transacción. La implementa `nucleo/aislamiento`
 * (Ingeniero de Datos). SQL siempre con marcadores $1, $2...; nunca concatenado.
 */
export interface Tx {
  consultar<T = Record<string, unknown>>(sql: string, valores?: readonly unknown[]): Promise<T[]>
}
