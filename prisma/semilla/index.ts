// Semilla de la Versión local 0.1: dos empresas (Alfa y Beta) con datos INVENTADOS.
// Uso: `npm run db:semilla` (tsx prisma/semilla/index.ts). Repetible: no duplica nada.
// Entra con DATABASE_URL (app_empresa) y PLATFORM_DATABASE_URL (app_plataforma, solo para crear la fila
// de `empresa`). Nada de contraseñas aquí: las direcciones vienen del entorno.

import { conEmpresa, conGlobal, conPlataforma, cerrarConexiones, type Tx } from '../../src/nucleo/aislamiento'
import { siguienteContador, formatearCorrelativo, claveSku } from '../../src/nucleo/contadores'
import { PLANTILLAS_ROL } from '../../src/nucleo/permisos/catalogo'
import { CAMPOS_LAPTOPS, DATOS, EMPRESAS, USUARIOS, type DatosEmpresa } from './datos'

const registro = (m: string) => console.log(`[semilla] ${m}`)

async function asegurarEmpresas(): Promise<void> {
  for (const e of Object.values(EMPRESAS)) {
    const existe = await conGlobal((tx) => tx.consultar('SELECT 1 FROM empresa WHERE slug = $1', [e.slug]))
    if (existe.length > 0) continue
    await conPlataforma((tx) =>
      tx.ejecutar('INSERT INTO empresa (id, slug, nombre) VALUES ($1, $2, $3)', [e.id, e.slug, e.nombre]),
    )
    registro(`empresa creada: ${e.nombre}`)
  }
}

async function asegurarUsuarios(): Promise<void> {
  await conGlobal(async (tx) => {
    for (const u of Object.values(USUARIOS)) {
      await tx.ejecutar(
        'INSERT INTO usuario (id, correo, nombre) VALUES ($1, $2, $3) ON CONFLICT (correo_norm) DO NOTHING',
        [u.id, u.correo, u.nombre],
      )
    }
  })
}

async function auditar(
  tx: Tx,
  autor: string,
  accion: string,
  entidadTipo: string,
  entidadId: string | null,
  cambios: Record<string, unknown>,
): Promise<void> {
  await tx.ejecutar(
    'INSERT INTO auditoria (empresa_id, autor_membresia_id, accion, entidad_tipo, entidad_id, cambios) VALUES ($1, $2, $3, $4, $5, $6::jsonb)',
    [tx.empresaId, autor, accion, entidadTipo, entidadId, JSON.stringify(cambios)],
  )
}

async function sembrarEmpresa(d: DatosEmpresa): Promise<void> {
  const empresa = EMPRESAS[d.clave]
  await conEmpresa(empresa.id, async (tx) => {
    const ya = await tx.consultar('SELECT 1 FROM rol LIMIT 1')
    if (ya.length > 0) {
      registro(`${empresa.nombre}: ya tiene datos, se omite.`)
      return
    }

    // Roles base y sus permisos
    const rolIds = new Map<string, string>()
    for (const [nombre, permisos] of Object.entries(PLANTILLAS_ROL)) {
      const [rol] = await tx.consultar<{ id: string }>(
        'INSERT INTO rol (empresa_id, nombre, es_base) VALUES ($1, $2, true) RETURNING id',
        [empresa.id, nombre],
      )
      rolIds.set(nombre, rol!.id)
      for (const p of permisos) {
        await tx.ejecutar('INSERT INTO rol_permiso (empresa_id, rol_id, permiso) VALUES ($1, $2, $3)', [empresa.id, rol!.id, p])
      }
    }

    // Membresías
    const membresia = new Map<string, string>()
    for (const m of d.membresias) {
      const [fila] = await tx.consultar<{ id: string }>(
        'INSERT INTO membresia (empresa_id, usuario_id, rol_id) VALUES ($1, $2, $3) RETURNING id',
        [empresa.id, USUARIOS[m.usuario].id, rolIds.get(m.rol)],
      )
      membresia.set(m.usuario, fila!.id)
    }
    const admin = membresia.get(d.admin)!
    const tecnico = membresia.get(d.tecnico)!

    // Catálogos
    const ubicaciones: string[] = []
    for (const nombre of d.ubicaciones) {
      const [u] = await tx.consultar<{ id: string }>(
        'INSERT INTO ubicacion (empresa_id, nombre) VALUES ($1, $2) RETURNING id',
        [empresa.id, nombre],
      )
      ubicaciones.push(u!.id)
    }
    for (const p of d.proveedores) {
      await tx.ejecutar('INSERT INTO proveedor (empresa_id, nombre, documento, contacto) VALUES ($1, $2, $3, $4)', [
        empresa.id, p.nombre, p.documento, p.contacto,
      ])
    }
    const personas: string[] = []
    for (const p of d.personas) {
      const [fila] = await tx.consultar<{ id: string }>(
        'INSERT INTO persona (empresa_id, nombre, correo, area) VALUES ($1, $2, $3, $4) RETURNING id',
        [empresa.id, p.nombre, p.correo, p.area],
      )
      personas.push(fila!.id)
    }

    // Categorías y campos
    const [laptops] = await tx.consultar<{ id: string }>(
      "INSERT INTO categoria (empresa_id, nombre, prefijo) VALUES ($1, 'Laptops', 'LAP') RETURNING id",
      [empresa.id],
    )
    let orden = 0
    for (const c of CAMPOS_LAPTOPS) {
      await tx.ejecutar(
        'INSERT INTO campo_definicion (empresa_id, categoria_id, clave, etiqueta, tipo, opciones, obligatorio, orden) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)',
        [empresa.id, laptops!.id, c.clave, c.etiqueta, c.tipo, c.opciones ? JSON.stringify(c.opciones) : null, c.obligatorio, ++orden],
      )
    }
    const [monitores] = await tx.consultar<{ id: string }>(
      "INSERT INTO categoria (empresa_id, nombre, prefijo) VALUES ($1, 'Monitores', 'MON') RETURNING id",
      [empresa.id],
    )
    await auditar(tx, admin, 'categoria.crear', 'categoria', laptops!.id, { nombre: 'Laptops', prefijo: 'LAP' })
    await auditar(tx, admin, 'categoria.crear', 'categoria', monitores!.id, { nombre: 'Monitores', prefijo: 'MON' })

    // SKU con código automático (contador atómico): LAP-0001 por serie y MON-0001 por cantidad
    const codigoLap = formatearCorrelativo('LAP', await siguienteContador(tx, claveSku('LAP')))
    const [skuLap] = await tx.consultar<{ id: string }>(
      "INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control, valores) VALUES ($1, $2, $3, $4, 'serie', $5::jsonb) RETURNING id",
      [empresa.id, laptops!.id, codigoLap, d.laptop.nombre, JSON.stringify(d.laptop.valores)],
    )
    const codigoMon = formatearCorrelativo('MON', await siguienteContador(tx, claveSku('MON')))
    const [skuMon] = await tx.consultar<{ id: string }>(
      "INSERT INTO sku (empresa_id, categoria_id, codigo, nombre, control) VALUES ($1, $2, $3, $4, 'cantidad') RETURNING id",
      [empresa.id, monitores!.id, codigoMon, d.monitor.nombre],
    )
    await auditar(tx, tecnico, 'sku.crear', 'sku', skuLap!.id, { codigo: codigoLap, nombre: d.laptop.nombre })
    await auditar(tx, tecnico, 'sku.crear', 'sku', skuMon!.id, { codigo: codigoMon, nombre: d.monitor.nombre })

    // Inventario: 4 laptops con serie (la primera asignada) y monitores por cantidad
    const activos: string[] = []
    for (const serie of d.series) {
      const [a] = await tx.consultar<{ id: string }>(
        'INSERT INTO activo (empresa_id, sku_id, serie, ubicacion_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [empresa.id, skuLap!.id, serie, ubicaciones[0]],
      )
      activos.push(a!.id)
    }
    await auditar(tx, tecnico, 'activo.registrar', 'sku', skuLap!.id, { cantidad: d.series.length, series: d.series })
    await tx.ejecutar('INSERT INTO existencia (empresa_id, sku_id, ubicacion_id, cantidad) VALUES ($1, $2, $3, $4)', [
      empresa.id, skuMon!.id, ubicaciones[0], d.monitor.existencia,
    ])
    await auditar(tx, tecnico, 'activo.registrar', 'sku', skuMon!.id, { cantidad: d.monitor.existencia })

    await tx.ejecutar(
      'INSERT INTO asignacion (empresa_id, activo_id, persona_id, asignada_por_membresia_id, motivo) VALUES ($1, $2, $3, $4, $5)',
      [empresa.id, activos[0], personas[0], tecnico, 'Entrega inicial de ejemplo'],
    )
    await tx.ejecutar("UPDATE activo SET estado = 'asignado' WHERE empresa_id = $1 AND id = $2", [empresa.id, activos[0]])
    await auditar(tx, tecnico, 'activo.asignar', 'activo', activos[0]!, { persona: d.personas[0]!.nombre, serie: d.series[0] })

    registro(`${empresa.nombre}: roles, usuarios, catálogos, categorías, SKU (${codigoLap}, ${codigoMon}), inventario y auditoría cargados.`)
  })
}

async function main(): Promise<void> {
  await asegurarEmpresas()
  await asegurarUsuarios()
  for (const d of DATOS) await sembrarEmpresa(d)
  registro('Listo. Solo datos inventados: no uses esta base con información real.')
}

main()
  .catch((e) => {
    console.error('[semilla] Falló:', e instanceof Error ? e.message : e)
    process.exitCode = 1
  })
  .finally(() => cerrarConexiones())
