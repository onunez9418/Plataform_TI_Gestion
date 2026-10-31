import { conEmpresa } from '../../../nucleo/aislamiento'
import { MARCA_CAMPO_PERSONAL, registrarAuditoria } from '../../../nucleo/auditoria'
import { duplicado, esViolacionUnica, noEncontrado } from '../../../nucleo/errores'
import { definirServicio } from '../../../nucleo/permisos'
import { esId, type Contexto } from '../../../nucleo/tipos-comunes'
import * as repo from '../repos/catalogos'
import type {
  EntradaCrearPersona, EntradaCrearProveedor, EntradaCrearUbicacion, EntradaEditarPersona,
  EntradaEditarProveedor, EntradaEditarUbicacion, Persona, Proveedor, Ubicacion,
} from '../tipos'
import { correoOpcional, terminar, textoObligatorio, textoOpcional } from '../validacion'

const ubic = (f: Ubicacion): Ubicacion => ({ id: f.id, nombre: f.nombre, descripcion: f.descripcion ?? null, activo: f.activo })
const prov = (f: Proveedor): Proveedor => ({ id: f.id, nombre: f.nombre, documento: f.documento ?? null, contacto: f.contacto ?? null, activo: f.activo })
const pers = (f: Persona): Persona => ({ id: f.id, nombre: f.nombre, correo: f.correo ?? null, area: f.area ?? null, activo: f.activo })

type Fabrica<T> = {
  tabla: repo.TablaCatalogo
  entidad: string
  articulo: string
  mapear: (f: T) => T
  duplicado: { campo: string; mensaje: string }
  /** Campos de texto libre que pueden traer datos de personas: la auditoría solo dice que «cambió», no el valor (D-030). */
  sensibles?: readonly string[]
}

/** Quita de lo que va a la auditoría el valor de los campos sensibles de la entidad. */
function paraAuditoria(f: { sensibles?: readonly string[] }, cambios: Record<string, unknown>): Record<string, unknown> {
  const sensibles = f.sensibles ?? []
  return Object.fromEntries(Object.entries(cambios).map(([campo, v]) =>
    [campo, sensibles.includes(campo) && v !== null && v !== undefined ? MARCA_CAMPO_PERSONAL : v]))
}

/** Crear: inserta, audita y traduce el índice único a DUPLICADO. */
async function crear<T extends { id: string }>(ctx: Contexto, f: Fabrica<T>, valores: Record<string, unknown>): Promise<T> {
  try {
    return await conEmpresa(ctx.empresaId, async (tx) => {
      const fila = f.mapear(await repo.insertar<T>(tx, f.tabla, ctx.empresaId, valores))
      await registrarAuditoria(tx, ctx, { accion: `${f.entidad}.crear`, entidadTipo: f.entidad, entidadId: fila.id, cambios: paraAuditoria(f, valores) })
      return fila
    })
  } catch (e) {
    if (esViolacionUnica(e)) throw duplicado(f.duplicado.mensaje, { [f.duplicado.campo]: f.duplicado.mensaje })
    throw e
  }
}

async function editar<T extends { id: string }>(ctx: Contexto, f: Fabrica<T>, id: string, parches: Record<string, unknown>): Promise<T> {
  if (!esId(id)) throw noEncontrado(f.articulo)
  const limpios = Object.fromEntries(Object.entries(parches).filter(([, v]) => v !== undefined))
  try {
    return await conEmpresa(ctx.empresaId, async (tx) => {
      const antes = await repo.obtener<T>(tx, f.tabla, ctx.empresaId, id)
      if (!antes) throw noEncontrado(f.articulo)
      const despues = await repo.actualizar<T>(tx, f.tabla, ctx.empresaId, id, limpios)
      if (!despues) throw noEncontrado(f.articulo)
      const cambios: Record<string, unknown> = {}
      for (const campo of Object.keys(limpios)) {
        const a = (antes as Record<string, unknown>)[campo]
        const d = (despues as Record<string, unknown>)[campo]
        if (a !== d) cambios[campo] = f.sensibles?.includes(campo) ? MARCA_CAMPO_PERSONAL : { antes: a, despues: d }
      }
      if (Object.keys(cambios).length > 0) {
        await registrarAuditoria(tx, ctx, { accion: `${f.entidad}.editar`, entidadTipo: f.entidad, entidadId: id, cambios })
      }
      return f.mapear(despues)
    })
  } catch (e) {
    if (esViolacionUnica(e)) throw duplicado(f.duplicado.mensaje, { [f.duplicado.campo]: f.duplicado.mensaje })
    throw e
  }
}

const listarDe = async <T>(ctx: Contexto, tabla: repo.TablaCatalogo, mapear: (f: T) => T): Promise<T[]> =>
  (await conEmpresa(ctx.empresaId, (tx) => repo.listar<T>(tx, tabla, ctx.empresaId))).map(mapear)

// ---------------- Ubicaciones
const fUbic: Fabrica<Ubicacion> = {
  tabla: 'ubicacion', entidad: 'ubicacion', articulo: 'La ubicación', mapear: ubic,
  duplicado: { campo: 'nombre', mensaje: 'Ya existe una ubicación con ese nombre.' },
}

export const listarUbicaciones = definirServicio<void, Ubicacion[]>(
  'catalogos.ubicaciones.listar', { permiso: 'catalogos.ver' }, (ctx) => listarDe(ctx, 'ubicacion', ubic))

export const crearUbicacion = definirServicio<EntradaCrearUbicacion, Ubicacion>(
  'catalogos.ubicaciones.crear', { permiso: 'ubicaciones.gestionar' }, async (ctx, e) => {
    const campos: Record<string, string> = {}
    const nombre = textoObligatorio(e?.nombre, 'nombre', { etiqueta: 'El nombre', max: 80 }, campos)
    const descripcion = textoOpcional(e?.descripcion, 'descripcion', { etiqueta: 'La descripción', max: 255 }, campos)
    terminar(campos)
    return crear(ctx, fUbic, { nombre, descripcion })
  })

export const editarUbicacion = definirServicio<EntradaEditarUbicacion, Ubicacion>(
  'catalogos.ubicaciones.editar', { permiso: 'ubicaciones.gestionar' }, async (ctx, e) => {
    const campos: Record<string, string> = {}
    const p: Record<string, unknown> = {}
    if (e?.nombre !== undefined) p.nombre = textoObligatorio(e.nombre, 'nombre', { etiqueta: 'El nombre', max: 80 }, campos)
    if (e?.descripcion !== undefined) p.descripcion = textoOpcional(e.descripcion, 'descripcion', { etiqueta: 'La descripción', max: 255 }, campos)
    if (e?.activo !== undefined) p.activo = Boolean(e.activo)
    terminar(campos)
    return editar(ctx, fUbic, e?.id, p)
  })

// ---------------- Proveedores
const fProv: Fabrica<Proveedor> = {
  tabla: 'proveedor', entidad: 'proveedor', articulo: 'El proveedor', mapear: prov,
  duplicado: { campo: 'documento', mensaje: 'Ya existe un proveedor con ese documento.' },
  sensibles: ['contacto'],
}

export const listarProveedores = definirServicio<void, Proveedor[]>(
  'catalogos.proveedores.listar', { permiso: 'proveedores.ver' }, (ctx) => listarDe(ctx, 'proveedor', prov))

export const crearProveedor = definirServicio<EntradaCrearProveedor, Proveedor>(
  'catalogos.proveedores.crear', { permiso: 'proveedores.crear_editar' }, async (ctx, e) => {
    const campos: Record<string, string> = {}
    const nombre = textoObligatorio(e?.nombre, 'nombre', { etiqueta: 'El nombre', max: 120 }, campos)
    const documento = textoOpcional(e?.documento, 'documento', { etiqueta: 'El documento', max: 30 }, campos)
    const contacto = textoOpcional(e?.contacto, 'contacto', { etiqueta: 'El contacto', max: 120 }, campos)
    terminar(campos)
    return crear(ctx, fProv, { nombre, documento, contacto })
  })

export const editarProveedor = definirServicio<EntradaEditarProveedor, Proveedor>(
  'catalogos.proveedores.editar', { permiso: 'proveedores.crear_editar' }, async (ctx, e) => {
    const campos: Record<string, string> = {}
    const p: Record<string, unknown> = {}
    if (e?.nombre !== undefined) p.nombre = textoObligatorio(e.nombre, 'nombre', { etiqueta: 'El nombre', max: 120 }, campos)
    if (e?.documento !== undefined) p.documento = textoOpcional(e.documento, 'documento', { etiqueta: 'El documento', max: 30 }, campos)
    if (e?.contacto !== undefined) p.contacto = textoOpcional(e.contacto, 'contacto', { etiqueta: 'El contacto', max: 120 }, campos)
    if (e?.activo !== undefined) p.activo = Boolean(e.activo)
    terminar(campos)
    return editar(ctx, fProv, e?.id, p)
  })

// ---------------- Personas
const fPers: Fabrica<Persona> = {
  tabla: 'persona', entidad: 'persona', articulo: 'La persona', mapear: pers,
  duplicado: { campo: 'correo', mensaje: 'Ya existe una persona con ese correo.' },
}

export const listarPersonas = definirServicio<void, Persona[]>(
  'catalogos.personas.listar', { permiso: 'personas.ver' }, (ctx) => listarDe(ctx, 'persona', pers))

export const crearPersona = definirServicio<EntradaCrearPersona, Persona>(
  'catalogos.personas.crear', { permiso: 'personas.crear_editar' }, async (ctx, e) => {
    const campos: Record<string, string> = {}
    const nombre = textoObligatorio(e?.nombre, 'nombre', { etiqueta: 'El nombre', max: 120 }, campos)
    const correo = correoOpcional(e?.correo, 'correo', campos)
    const area = textoOpcional(e?.area, 'area', { etiqueta: 'El área', max: 80 }, campos)
    terminar(campos)
    return crear(ctx, fPers, { nombre, correo, area })
  })

export const editarPersona = definirServicio<EntradaEditarPersona, Persona>(
  'catalogos.personas.editar', { permiso: 'personas.crear_editar' }, async (ctx, e) => {
    const campos: Record<string, string> = {}
    const p: Record<string, unknown> = {}
    if (e?.nombre !== undefined) p.nombre = textoObligatorio(e.nombre, 'nombre', { etiqueta: 'El nombre', max: 120 }, campos)
    if (e?.correo !== undefined) p.correo = correoOpcional(e.correo, 'correo', campos)
    if (e?.area !== undefined) p.area = textoOpcional(e.area, 'area', { etiqueta: 'El área', max: 80 }, campos)
    if (e?.activo !== undefined) p.activo = Boolean(e.activo)
    terminar(campos)
    return editar(ctx, fPers, e?.id, p)
  })

