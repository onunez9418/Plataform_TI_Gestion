import type { Tx } from '../../../nucleo/tipos-comunes'
import type { CampoDef, CampoDefinicion, Categoria } from '../tipos'

type FilaCategoria = { id: string; nombre: string; prefijo: string; cantidad_skus: number | string }
type FilaCampo = { id: string; categoria_id: string; clave: string; etiqueta: string; tipo: CampoDef['tipo']; opciones: string[] | null; obligatorio: boolean; orden: number }

const aCampo = (f: FilaCampo): CampoDefinicion => ({
  id: f.id, clave: f.clave, etiqueta: f.etiqueta, tipo: f.tipo, obligatorio: f.obligatorio, orden: f.orden,
  ...(f.opciones ? { opciones: f.opciones } : {}),
})

export async function listar(tx: Tx, empresaId: string, categoriaId?: string): Promise<Categoria[]> {
  const cats = await tx.consultar<FilaCategoria>(
    `SELECT c.id, c.nombre, c.prefijo,
            (SELECT count(*) FROM sku s WHERE s.empresa_id = c.empresa_id AND s.categoria_id = c.id) AS cantidad_skus
       FROM categoria c WHERE c.empresa_id = $1 AND ($2::uuid IS NULL OR c.id = $2) ORDER BY c.nombre`,
    [empresaId, categoriaId ?? null],
  )
  const campos = await tx.consultar<FilaCampo>(
    `SELECT id, categoria_id, clave, etiqueta, tipo, opciones, obligatorio, orden
       FROM campo_definicion WHERE empresa_id = $1 AND ($2::uuid IS NULL OR categoria_id = $2) ORDER BY orden, creado_en`,
    [empresaId, categoriaId ?? null],
  )
  return cats.map((c) => ({
    id: c.id, nombre: c.nombre, prefijo: c.prefijo, cantidadSkus: Number(c.cantidad_skus),
    campos: campos.filter((f) => f.categoria_id === c.id).map(aCampo),
  }))
}

export async function crear(tx: Tx, empresaId: string, nombre: string, prefijo: string): Promise<string> {
  const f = await tx.consultar<{ id: string }>(
    `INSERT INTO categoria (empresa_id, nombre, prefijo) VALUES ($1, $2, $3) RETURNING id`, [empresaId, nombre, prefijo])
  return (f[0] as { id: string }).id
}

export async function contarCampos(tx: Tx, empresaId: string, categoriaId: string): Promise<number> {
  const f = await tx.consultar<{ n: number }>(
    `SELECT count(*)::int AS n FROM campo_definicion WHERE empresa_id = $1 AND categoria_id = $2`, [empresaId, categoriaId])
  return (f[0] as { n: number }).n
}

export async function insertarCampo(tx: Tx, empresaId: string, categoriaId: string, c: CampoDef, orden: number): Promise<void> {
  await tx.consultar(
    `INSERT INTO campo_definicion (empresa_id, categoria_id, clave, etiqueta, tipo, opciones, obligatorio, orden)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
    [empresaId, categoriaId, c.clave, c.etiqueta, c.tipo, c.opciones ? JSON.stringify(c.opciones) : null, c.obligatorio, orden],
  )
}
