import Link from 'next/link'
import { listarAuditoria } from '@/nucleo/auditoria'
import { cargarContexto, cargarDatos } from '@/app/_lib/sesion'
import { fechaHora } from '@/app/_lib/formato'
import { CabeceraPantalla, ErrorDePantalla, Vacio } from '@/componentes/ui/Piezas'

export const dynamic = 'force-dynamic'
const MAXIMO_FILAS = 200

function valorLegible(v: unknown): string {
  if (v === null || v === undefined) return '-'
  if (typeof v === 'string') return v
  if (typeof v === 'boolean') return v ? 'Sí' : 'No'
  if (typeof v === 'number') return String(v)
  return JSON.stringify(v)
}

export default async function PaginaAuditoria({ params, searchParams }: { params: Promise<{ empresa: string }>; searchParams: Promise<{ entidad?: string; desde?: string; hasta?: string }> }) {
  const { empresa } = await params
  const { entidad, desde, hasta } = await searchParams
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />

  const registros = await cargarDatos(() => listarAuditoria(c.ctx, { entidad: entidad || undefined, desde: desde || undefined, hasta: hasta || undefined }))
  if (!registros.ok) return <ErrorDePantalla mensaje={registros.error.mensaje} codigo={registros.error.codigo} />
  const filtrado = Boolean(entidad || desde || hasta)
  const visibles = registros.datos.slice(0, MAXIMO_FILAS)

  return (
    <>
      <CabeceraPantalla titulo="Auditoría" descripcion="Qué se hizo, quién lo hizo y cuándo. Este registro solo se agrega: nadie puede borrarlo ni cambiarlo." />

      <form method="get" className="barra-herr" role="search" aria-label="Filtrar la auditoría" data-testid="filtro-auditoria">
        <div className="campo">
          <label htmlFor="a-entidad">Tipo de dato</label>
          <input id="a-entidad" type="text" name="entidad" defaultValue={entidad ?? ''} placeholder="sku, rol, usuario..." data-testid="filtro-entidad" />
        </div>
        <div className="campo">
          <label htmlFor="a-desde">Desde</label>
          <input id="a-desde" type="date" name="desde" defaultValue={desde ?? ''} data-testid="filtro-desde" />
        </div>
        <div className="campo">
          <label htmlFor="a-hasta">Hasta</label>
          <input id="a-hasta" type="date" name="hasta" defaultValue={hasta ?? ''} data-testid="filtro-hasta" />
        </div>
        <button type="submit" className="btn" data-testid="filtrar">Filtrar</button>
        {filtrado ? <Link className="btn fantasma" href={`/e/${empresa}/auditoria`} data-testid="limpiar-filtro">Quitar filtros</Link> : null}
      </form>

      {visibles.length === 0 ? (
        <Vacio titulo={filtrado ? 'No hay registros con ese filtro' : 'Todavía no hay registros'} />
      ) : (
        <>
          <div className="envoltura-tabla">
            <table className="tabla adaptable" data-testid="tabla-auditoria">
              <caption className="oculto-visual">Registro de auditoría</caption>
              <thead><tr><th>Cuándo</th><th>Quién</th><th>Qué hizo</th><th>Sobre</th><th>Detalle</th></tr></thead>
              <tbody>
                {visibles.map((r) => {
                  const cambios = Object.entries(r.cambios ?? {})
                  return (
                    <tr key={r.id} data-testid="fila-auditoria">
                      <td data-label="Cuándo">{fechaHora(r.creadoEn)}</td>
                      <td data-label="Quién">{r.autorNombre ?? 'Sistema'}</td>
                      <td data-label="Qué hizo" className="cod">{r.accion}</td>
                      <td data-label="Sobre">{r.entidadTipo}</td>
                      <td data-label="Detalle">
                        {cambios.length === 0 && !r.motivo ? '-' : (
                          <ul style={{ margin: 0, paddingLeft: 'var(--e4)', textAlign: 'left' }}>
                            {cambios.map(([k, v]) => <li key={k}>{k}: {valorLegible(v)}</li>)}
                            {r.motivo ? <li>Motivo: {r.motivo}</li> : null}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {registros.datos.length > MAXIMO_FILAS ? (
            <p className="suave chica" data-testid="auditoria-recortada">Se muestran los primeros {MAXIMO_FILAS} registros. Use los filtros para acotar.</p>
          ) : null}
        </>
      )}
    </>
  )
}
