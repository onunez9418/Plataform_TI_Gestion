// Catálogo de permisos de la versión local 0.1 (ADR-10).
// Los nombres son los de docs/registro-permisos.md (v1.4). Es un subconjunto: solo lo que usa la 0.1.
// Cambiar un permiso exige tocar también el registro, con visto bueno del Gerente de TI.

export type EntradaCatalogo = {
  /** Identificador funcional del registro (PS-nn). */
  ps: string
  nombre: string
  etiqueta: string
  grupo: string
  /** Sensible en el registro (exigiría segunda verificación; la 0.1 no la implementa). */
  sensible: boolean
}

const e = (ps: string, nombre: string, etiqueta: string, grupo: string, sensible = false): EntradaCatalogo => ({
  ps,
  nombre,
  etiqueta,
  grupo,
  sensible,
})

export const CATALOGO = [
  e('PS-11', 'usuarios.ver', 'Ver los usuarios de la empresa', 'Usuarios y roles'),
  e('PS-12', 'usuarios.invitar', 'Invitar usuarios', 'Usuarios y roles', true),
  e('PS-13', 'usuarios.cambiar_rol', 'Cambiar el rol de un usuario', 'Usuarios y roles', true),
  e('PS-14', 'usuarios.suspender', 'Suspender o reactivar usuarios', 'Usuarios y roles', true),
  e('PS-16', 'roles.ver', 'Ver los roles y sus permisos', 'Usuarios y roles'),
  e('PS-17', 'roles.administrar', 'Crear y editar roles', 'Usuarios y roles', true),
  e('PS-18', 'auditoria.ver', 'Ver la auditoría', 'Auditoría', true),
  e('PS-24', 'personas.ver', 'Ver personas', 'Personas y proveedores'),
  e('PS-25', 'personas.crear_editar', 'Crear y editar personas', 'Personas y proveedores'),
  e('PS-30', 'catalogos.ver', 'Ver catálogos, ubicaciones y categorías', 'Catálogos'),
  e('PS-31', 'catalogos.gestionar', 'Crear y editar catálogos', 'Catálogos'),
  e('PS-32', 'ubicaciones.gestionar', 'Crear y editar ubicaciones', 'Catálogos'),
  e('PS-34', 'categorias.gestionar', 'Crear y editar categorías y sus campos', 'Catálogos'),
  e('PS-35', 'proveedores.ver', 'Ver proveedores', 'Personas y proveedores'),
  e('PS-37', 'proveedores.crear_editar', 'Crear y editar proveedores', 'Personas y proveedores'),
  e('PS-39', 'skus.ver', 'Ver SKU', 'Artículos (SKU)'),
  e('PS-40', 'skus.crear_editar', 'Crear y editar SKU', 'Artículos (SKU)'),
  e('PS-41', 'skus.codigo_propio', 'Escribir un código de SKU propio', 'Artículos (SKU)'),
  e('PS-43', 'activos.ver', 'Ver activos y existencias', 'Inventario'),
  e('PS-44', 'activos.ingreso_manual', 'Registrar activos', 'Inventario'),
  e('PS-54', 'entregas.ver', 'Ver entregas y devoluciones', 'Inventario'),
  e('PS-55', 'entregas.crear', 'Asignar un activo a una persona', 'Inventario'),
  e('PS-56', 'entregas.devolver', 'Registrar una devolución', 'Inventario'),
  e('PS-61', 'ordenes_compra.ver', 'Ver órdenes de compra', 'Compras'),
  e('PS-62', 'ordenes_compra.crear_editar', 'Preparar órdenes de compra', 'Compras'),
  e('PS-63', 'ordenes_compra.aprobar', 'Aprobar o rechazar órdenes de compra', 'Compras', true),
  e('PS-64', 'ordenes_compra.emitir', 'Emitir órdenes al proveedor', 'Compras'),
  e('PS-67', 'recepciones.crear_confirmar', 'Recibir mercadería', 'Compras'),
] as const satisfies readonly EntradaCatalogo[]

/** Unión de los nombres: usar un permiso que no está en el catálogo no compila. */
export type Permiso = (typeof CATALOGO)[number]['nombre']

export const TODOS_LOS_PERMISOS: readonly Permiso[] = CATALOGO.map((p) => p.nombre)

const POR_NOMBRE: ReadonlyMap<string, EntradaCatalogo> = new Map(CATALOGO.map((p) => [p.nombre, p]))

export const esPermisoDelCatalogo = (valor: string): valor is Permiso => POR_NOMBRE.has(valor)
export const etiquetaDe = (nombre: string): string => POR_NOMBRE.get(nombre)?.etiqueta ?? nombre

/** Lo que usa la pantalla de roles. */
export function catalogoPermisos(): { clave: string; etiqueta: string; grupo: string }[] {
  return CATALOGO.map((p) => ({ clave: p.nombre, etiqueta: p.etiqueta, grupo: p.grupo }))
}

const VER: readonly Permiso[] = [
  'usuarios.ver', 'roles.ver', 'auditoria.ver', 'personas.ver', 'catalogos.ver', 'proveedores.ver',
  'skus.ver', 'activos.ver', 'entregas.ver', 'ordenes_compra.ver',
]

/**
 * Roles de ejemplo de la 0.1 (plan A.6.2). La semilla (Ingeniero de Datos) los carga desde aquí.
 * Administrador: todos. La separación de funciones de compras es de la regla, no del rol.
 */
export const PLANTILLAS_ROL: Readonly<Record<'Administrador' | 'Jefatura TI' | 'Técnico' | 'Consulta', readonly Permiso[]>> = {
  Administrador: TODOS_LOS_PERMISOS,
  'Jefatura TI': [...VER, 'ordenes_compra.aprobar', 'ordenes_compra.emitir'],
  Técnico: [
    'personas.ver', 'personas.crear_editar', 'catalogos.ver', 'catalogos.gestionar', 'ubicaciones.gestionar',
    'proveedores.ver', 'skus.ver', 'skus.crear_editar', 'activos.ver', 'activos.ingreso_manual',
    'entregas.ver', 'entregas.crear', 'entregas.devolver', 'ordenes_compra.ver',
    'ordenes_compra.crear_editar', 'recepciones.crear_confirmar',
  ],
  Consulta: [
    'personas.ver', 'catalogos.ver', 'proveedores.ver', 'skus.ver', 'activos.ver', 'entregas.ver',
    'ordenes_compra.ver',
  ],
}
