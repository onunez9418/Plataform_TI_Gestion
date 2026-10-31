import Link from 'next/link'
import { listarAuditoria } from '@/nucleo/auditoria'
import { cargarContexto, cargarDatos } from '@/app/_lib/sesion'
import { fechaHora } from '@/app/_lib/formato'
import { ENTIDADES, lineasDeDetalle, textoDeAccion, textoDeEntidad } from '@/app/_lib/auditoria-texto'
import { CabeceraPantalla, ErrorDePantalla, Vacio } from '@/componentes/ui/Piezas'

export const dynamic = 'force-dynamic'
const MAXIMO_FILAS = 200

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
          <select id="a-entidad" name="entidad" defaultValue={entidad ?? ''} data-testid="filtro-entidad">
            <option value="">Todos</option>
            {Object.entries(ENTIDADES).map(([clave, nombre]) => <option key={clave} value={clave}>{nombre}</option>)}
          </select>
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
                  const detalle = lineasDeDetalle(r.cambios)
                  return (
                    <tr key={r.id} data-testid="fila-auditoria" data-accion={r.accion}>
                      <td data-label="Cuándo">{fechaHora(r.creadoEn)}</td>
                      <td data-label="Quién">{r.autorNombre ?? 'Sistema'}</td>
                      <td data-label="Qué hizo">{textoDeAccion(r.accion)}</td>
                      <td data-label="Sobre">{textoDeEntidad(r.entidadTipo)}</td>
                      <td data-label="Detalle">
                        {detalle.length === 0 && !r.motivo ? '-' : (
                          <ul style={{ margin: 0, paddingLeft: 'var(--e4)', textAlign: 'left' }}>
                            {detalle.map((l, i) => <li key={i}>{l}</li>)}
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
