// QA · Ayudas para probar los servicios de la aplicación con la base real. Solo datos inventados.
// Se apoyan en las ayudas de Backend A (empresas de prueba con los 4 roles de ejemplo) y construyen el resto
// con los propios servicios, para que la prueba recorra el mismo camino que la aplicación.
import { conEmpresa } from '../../src/nucleo/aislamiento'
import { contextoDe, crearEmpresaDePrueba, type EmpresaPrueba } from '../../src/nucleo/permisos/pruebas/apoyo'
import { PLANTILLAS_ROL, TODOS_LOS_PERMISOS } from '../../src/nucleo/permisos'
import { crearPersona, crearProveedor, crearUbicacion } from '../../src/modulos/catalogos'
import { crearCategoria } from '../../src/modulos/categorias'
import { crearSku } from '../../src/modulos/skus'
import type { Contexto } from '../../src/nucleo/tipos-comunes'

export { contextoDe, crearEmpresaDePrueba, PLANTILLAS_ROL, TODOS_LOS_PERMISOS }
export type { EmpresaPrueba }

export const sufijo = () => Math.random().toString(36).slice(2, 8)

/** Contexto con exactamente estos permisos (el rol real de la persona no importa: así se prueba el permiso solo). */
export function conPermisos(e: EmpresaPrueba, quien: string, permisos: Iterable<string>): Contexto {
  return contextoDe(e, quien, permisos)
}

export type Datos = {
  ubicacionA: string
  ubicacionB: string
  persona: string
  proveedor: string
  categoriaId: string
  skuSerie: { id: string; codigo: string }
  skuCantidad: { id: string; codigo: string }
}

/** Carga lo mínimo de una empresa (con el contexto de administrador de esa empresa) usando los servicios reales. */
export async function cargarDatos(e: EmpresaPrueba, prefijo = 'QA'): Promise<Datos> {
  const admin = contextoDe(e, 'admin')
  const ubicacionA = (await crearUbicacion(admin, { nombre: `Almacén ${sufijo()}` })).id
  const ubicacionB = (await crearUbicacion(admin, { nombre: `Oficina ${sufijo()}` })).id
  const persona = (await crearPersona(admin, { nombre: `Persona Inventada ${sufijo()}` })).id
  const proveedor = (await crearProveedor(admin, { nombre: `Proveedor Inventado ${sufijo()}` })).id
  const cat = await crearCategoria(admin, { nombre: `Cat ${prefijo} ${sufijo()}`, prefijo, campos: [] })
  const s1 = await crearSku(admin, { categoriaId: cat.id, nombre: 'Equipo con serie', control: 'serie', valores: {} })
  const s2 = await crearSku(admin, { categoriaId: cat.id, nombre: 'Insumo por cantidad', control: 'cantidad', valores: {} })
  return { ubicacionA, ubicacionB, persona, proveedor, categoriaId: cat.id, skuSerie: { id: s1.id, codigo: s1.codigo }, skuCantidad: { id: s2.id, codigo: s2.codigo } }
}

/** Cuenta filas de una empresa en tablas clave (para comprobar que un intento ajeno no cambió nada). */
export async function huella(empresaId: string): Promise<Record<string, number>> {
  return conEmpresa(empresaId, async (tx) => {
    const r: Record<string, number> = {}
    for (const t of ['sku', 'activo', 'existencia', 'asignacion', 'rol', 'rol_permiso', 'membresia', 'categoria', 'campo_definicion', 'ubicacion', 'persona', 'proveedor', 'orden_compra', 'orden_linea', 'recepcion', 'auditoria']) {
      r[t] = (await tx.consultar<{ n: number }>(`SELECT count(*)::int AS n FROM ${t}`))[0]!.n
    }
    return r
  })
}
