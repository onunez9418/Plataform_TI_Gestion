// Traduce el registro de auditoría a lenguaje de la persona: nada de claves técnicas, identificadores largos
// ni formato de programa. La clave original (por ejemplo «sku.crear») sigue en la fila como `data-accion` para las pruebas.

const ACCIONES: Readonly<Record<string, string>> = {
  'activo.registrar': 'Registró un equipo',
  'activo.asignar': 'Asignó un equipo a una persona',
  'activo.devolver': 'Recibió la devolución de un equipo',
  'existencia.registrar': 'Registró existencias de un artículo',
  'categoria.crear': 'Creó una categoría',
  'categoria.agregar_campo': 'Agregó un campo a una categoría',
  'sku.crear': 'Creó un artículo (SKU)',
  'rol.crear': 'Creó un rol',
  'rol.editar': 'Cambió un rol',
  'usuario.invitar': 'Invitó a un usuario',
  'usuario.cambiar_rol': 'Cambió el rol de un usuario',
  'usuario.suspender': 'Suspendió a un usuario',
  'usuario.reactivar': 'Reactivó a un usuario',
  'orden_compra.crear': 'Preparó una orden de compra',
  'orden_compra.enviar_a_aprobacion': 'Envió una orden de compra a aprobación',
  'orden_compra.aprobar': 'Aprobó una orden de compra',
  'orden_compra.rechazar': 'Rechazó una orden de compra',
  'orden_compra.recibir': 'Recibió mercadería de una orden de compra',
  'ubicacion.crear': 'Creó una ubicación',
  'ubicacion.editar': 'Cambió una ubicación',
  'proveedor.crear': 'Creó un proveedor',
  'proveedor.editar': 'Cambió un proveedor',
  'persona.crear': 'Registró a una persona',
  'persona.editar': 'Cambió los datos de una persona',
}

export const ENTIDADES: Readonly<Record<string, string>> = {
  activo: 'Equipo',
  existencia: 'Existencias',
  categoria: 'Categoría',
  sku: 'Artículo (SKU)',
  rol: 'Rol',
  usuario: 'Usuario',
  orden_compra: 'Orden de compra',
  ubicacion: 'Ubicación',
  proveedor: 'Proveedor',
  persona: 'Persona',
}

const ETIQUETAS: Readonly<Record<string, string>> = {
  codigo: 'Código',
  nombre: 'Nombre',
  prefijo: 'Prefijo',
  categoria: 'Categoría',
  control: 'Control',
  codigoPropio: 'Código propio',
  campos: 'Campos',
  campo: 'Campo',
  tipo: 'Tipo',
  obligatorio: 'Obligatorio',
  correo: 'Correo',
  rol: 'Rol',
  estado: 'Estado',
  numero: 'Número',
  recepcion: 'Recepción',
  lineas: 'Líneas',
  sku: 'Artículo',
  serie: 'Serie',
  series: 'Series',
  cantidadAgregada: 'Cantidad agregada',
  saldo: 'Saldo',
  permisos: 'Permisos',
  direccion: 'Dirección',
  telefono: 'Teléfono',
  activo: 'Activo',
}

function pasarAFrase(clave: string): string {
  const t = clave.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function textoDeAccion(accion: string): string {
  return ACCIONES[accion] ?? pasarAFrase(accion.replace('.', ' '))
}

export function textoDeEntidad(tipo: string): string {
  return ENTIDADES[tipo] ?? pasarAFrase(tipo)
}

/** Las claves que terminan en «Id» guardan identificadores largos que no le dicen nada a la persona. */
function esIdentificador(clave: string): boolean {
  return /(^id$|Id$|_id$)/.test(clave)
}

function esAntesDespues(v: unknown): v is { antes: unknown; despues: unknown } {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && 'antes' in v && 'despues' in v
}

function valor(v: unknown): string {
  if (v === null || v === undefined || v === '') return '-'
  if (typeof v === 'boolean') return v ? 'Sí' : 'No'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'string') return v
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x === 'string' || typeof x === 'number')) return v.join(', ')
    return `${v.length}`
  }
  return '(varios datos)'
}

/** Una línea por dato, con etiqueta en español. Los permisos se cuentan: la lista técnica no se muestra. */
export function lineasDeDetalle(cambios: Record<string, unknown> | null | undefined): string[] {
  const lineas: string[] = []
  for (const [clave, v] of Object.entries(cambios ?? {})) {
    if (esIdentificador(clave)) continue
    const etiqueta = ETIQUETAS[clave] ?? pasarAFrase(clave)
    if (clave === 'permisos' && Array.isArray(v)) lineas.push(`${etiqueta}: ${v.length}`)
    else if (esAntesDespues(v)) lineas.push(`${etiqueta}: ${valor(v.antes)} → ${valor(v.despues)}`)
    else lineas.push(`${etiqueta}: ${valor(v)}`)
  }
  return lineas
}
