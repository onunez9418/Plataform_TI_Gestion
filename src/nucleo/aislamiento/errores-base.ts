// Error de la base de datos, ya limpio para que el Backend lo traduzca a un ErrorNegocio.
// No lleva datos de filas: solo el código de PostgreSQL y el nombre de la regla violada.

export class ErrorBaseDatos extends Error {
  /** Código SQLSTATE de PostgreSQL (23505 duplicado, 23503 llave foránea, 23514 regla CHECK, 42501 sin permiso). */
  readonly codigo: string
  /** Nombre del índice o de la regla violada (ej. `uq_sku__codigo`); sirve para elegir el mensaje. */
  readonly restriccion?: string
  readonly tabla?: string

  constructor(mensaje: string, codigo: string, restriccion?: string, tabla?: string) {
    super(mensaje)
    this.name = 'ErrorBaseDatos'
    this.codigo = codigo
    this.restriccion = restriccion
    this.tabla = tabla
  }

  get esDuplicado(): boolean {
    return this.codigo === '23505'
  }
  get esLlaveForanea(): boolean {
    return this.codigo === '23503'
  }
  /** Regla CHECK, columna obligatoria vacía o disparador de la base que rechazó la operación. */
  get esRegla(): boolean {
    return this.codigo === '23514' || this.codigo === '23502' || this.codigo === '23000' || this.codigo === 'P0001'
  }
  /** Sin permiso de base o fila de otra empresa (seguridad por fila). */
  get esSinPermiso(): boolean {
    return this.codigo === '42501'
  }
  /** Interbloqueo o fallo de serialización: el servicio puede reintentar una vez (ADR-15). */
  get esReintentable(): boolean {
    return this.codigo === '40P01' || this.codigo === '40001'
  }
}

/** Error de uso incorrecto de la puerta (SQL no permitido, uso anidado, empresa mal formada). Es un defecto de código, no del usuario. */
export class ErrorUsoAislamiento extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ErrorUsoAislamiento'
  }
}
