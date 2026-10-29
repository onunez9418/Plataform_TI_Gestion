import { conEmpresa } from '../aislamiento'
import { validacion } from '../errores'
import { definirServicio } from '../permisos'
import type { EntradaListarAuditoria, RegistroAuditoria } from './tipos'

type Fila = {
  id: string; creado_en: Date | string; autor_nombre: string | null; accion: string
  entidad_tipo: string; entidad_id: string | null; cambios: Record<string, unknown>; motivo: string | null
}

const LIMITE = 200

function fechaValida(valor: string | undefined, campo: string): string | null {
  if (!valor) return null
  const t = Date.parse(valor)
  if (Number.isNaN(t)) throw validacion('La fecha no es válida.', { [campo]: 'Use el formato AAAA-MM-DD.' })
  return new Date(t).toISOString()
}

export const listarAuditoria = definirServicio<EntradaListarAuditoria | undefined, RegistroAuditoria[]>(
  'auditoria.listar',
  { permiso: 'auditoria.ver' },
  async (ctx, entrada) => {
    const desde = fechaValida(entrada?.desde, 'desde')
    // «hasta» incluye todo ese día.
    const hastaBruto = fechaValida(entrada?.hasta, 'hasta')
    const hasta = hastaBruto ? new Date(Date.parse(hastaBruto) + 24 * 3600 * 1000).toISOString() : null
    const entidad = entrada?.entidad?.trim() || null

    const filas = await conEmpresa(ctx.empresaId, (tx) =>
      tx.consultar<Fila>(
        `SELECT a.id, a.creado_en, u.nombre AS autor_nombre, a.accion, a.entidad_tipo, a.entidad_id, a.cambios, a.motivo
           FROM auditoria a
           LEFT JOIN membresia m ON m.empresa_id = a.empresa_id AND m.id = a.autor_membresia_id
           LEFT JOIN usuario u ON u.id = m.usuario_id
          WHERE a.empresa_id = $1
            AND ($2::text IS NULL OR a.entidad_tipo = $2)
            AND ($3::timestamptz IS NULL OR a.creado_en >= $3)
            AND ($4::timestamptz IS NULL OR a.creado_en < $4)
          ORDER BY a.creado_en DESC, a.id DESC
          LIMIT ${LIMITE}`,
        [ctx.empresaId, entidad, desde, hasta],
      ),
    )
    return filas.map((f) => ({
      id: f.id,
      creadoEn: new Date(f.creado_en).toISOString(),
      autorNombre: f.autor_nombre,
      accion: f.accion,
      entidadTipo: f.entidad_tipo,
      entidadId: f.entidad_id,
      cambios: f.cambios ?? {},
      motivo: f.motivo,
    }))
  },
)
