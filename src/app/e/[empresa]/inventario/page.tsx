import Link from 'next/link'
import { listarActivos, listarExistencias } from '@/modulos/inventario'
import { listarSkus } from '@/modulos/skus'
import { listarUbicaciones, listarPersonas } from '@/modulos/catalogos'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { numero } from '@/app/_lib/formato'
import { P } from '@/componentes/estructura/permisos'
import { CabeceraPantalla, Crear, ErrorDePantalla, Vacio } from '@/componentes/ui/Piezas'
import { EstadoActivo, OPCIONES_ESTADO } from '@/componentes/ui/EstadoActivo'
import { registrar } from './acciones'
import { FormularioRegistrar } from './FormularioRegistrar'

export const dynamic = 'force-dynamic'

type Filtros = { texto?: string; sku?: string; estado?: string; persona?: string }

export default async function PaginaInventario({ params, searchParams }: { params: Promise<{ empresa: string }>; searchParams: Promise<Filtros> }) {
  const { empresa } = await params
  const f = await searchParams
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const activos = await cargarDatos(() => listarActivos(ctx, { texto: f.texto || undefined, skuId: f.sku || undefined, estado: f.estado || undefined, personaId: f.persona || undefined }))
  if (!activos.ok) return <ErrorDePantalla mensaje={activos.error.mensaje} codigo={activos.error.codigo} />

  // Las existencias (artículos por cantidad) y las listas de apoyo son secundarias: si el servidor no las da, se sigue sin ellas.
  const filtrado = Boolean(f.texto || f.sku || f.estado || f.persona)
  const [existencias, skus, ubicaciones, personas] = await Promise.all([
    filtrado ? Promise.resolve({ ok: true as const, datos: [] }) : cargarDatos(() => listarExistencias(ctx)),
    cargarDatos(() => listarSkus(ctx)),
    cargarDatos(() => listarUbicaciones(ctx)),
    cargarDatos(() => listarPersonas(ctx)),
  ])
  const listaSkus = skus.ok ? skus.datos : []
  const listaUbic = ubicaciones.ok ? ubicaciones.datos.filter((u) => u.activo) : []
  const listaPersonas = personas.ok ? personas.datos : []
  const puedeRegistrar = puede(ctx, P.activosRegistrar)

  return (
    <>
      <CabeceraPantalla titulo="Inventario" descripcion="Los equipos de la empresa: dónde están, en qué estado y quién los tiene." />

      {puedeRegistrar ? (
        listaSkus.length === 0 || listaUbic.length === 0 ? (
          <p className="suave" data-testid="registrar-sin-base">Para registrar equipos hacen falta al menos un SKU y una ubicación.</p>
        ) : (
          <Crear titulo="Registrar equipos" testid="crear-activos">
            <FormularioRegistrar
              skus={listaSkus.filter((s) => s.activo).map((s) => ({ id: s.id, codigo: s.codigo, nombre: s.nombre, control: s.control }))}
              ubicaciones={listaUbic.map((u) => ({ id: u.id, nombre: u.nombre }))}
              accion={registrar.bind(null, empresa)}
            />
          </Crear>
        )
      ) : null}

      <form method="get" className="barra-herr" role="search" aria-label="Filtrar el inventario" data-testid="filtro-inventario">
        <div className="campo buscador">
          <label htmlFor="i-texto">Buscar por serie o nombre</label>
          <input id="i-texto" type="search" name="texto" defaultValue={f.texto ?? ''} data-testid="filtro-texto" />
        </div>
        <div className="campo">
          <label htmlFor="i-sku">Artículo</label>
          <select id="i-sku" name="sku" defaultValue={f.sku ?? ''} data-testid="filtro-sku">
            <option value="">Todos</option>
            {listaSkus.map((s) => <option key={s.id} value={s.id}>{s.codigo} · {s.nombre}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="i-estado">Estado</label>
          <select id="i-estado" name="estado" defaultValue={f.estado ?? ''} data-testid="filtro-estado">
            <option value="">Todos</option>
            {OPCIONES_ESTADO.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="i-persona">Persona</label>
          <select id="i-persona" name="persona" defaultValue={f.persona ?? ''} data-testid="filtro-persona">
            <option value="">Todas</option>
            {listaPersonas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <button type="submit" className="btn" data-testid="filtrar">Filtrar</button>
        {filtrado ? <Link className="btn fantasma" href={`/e/${empresa}/inventario`} data-testid="limpiar-filtro">Quitar filtros</Link> : null}
      </form>

      {activos.datos.length === 0 ? (
        <Vacio titulo={filtrado ? 'Ningún equipo coincide con el filtro' : 'Todavía no hay equipos registrados'} texto={filtrado ? 'Pruebe con otros filtros.' : puedeRegistrar ? 'Registre el primero arriba.' : undefined} />
      ) : (
        <div className="envoltura-tabla">
          <table className="tabla adaptable" data-testid="tabla-activos">
            <caption className="oculto-visual">Equipos con serie</caption>
            <thead><tr><th>Serie</th><th>Artículo</th><th>Estado</th><th>Ubicación</th><th>Persona</th><th><span className="oculto-visual">Abrir</span></th></tr></thead>
            <tbody>
              {activos.datos.map((a) => (
                <tr key={a.id} data-testid={`fila-activo-${a.skuCodigo}-${a.serie}`}>
                  <td data-label="Serie" className="cod">{a.serie}</td>
                  <td data-label="Artículo"><span className="cod">{a.skuCodigo}</span> · {a.skuNombre}</td>
                  <td data-label="Estado"><EstadoActivo estado={a.estado} /></td>
                  <td data-label="Ubicación">{a.ubicacionNombre}</td>
                  <td data-label="Persona">{a.personaNombre ?? '-'}</td>
                  <td className="sin-titulo"><Link className="btn chico" href={`/e/${empresa}/inventario/${a.id}`} data-testid={`abrir-activo-${a.skuCodigo}-${a.serie}`}>Abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {existencias.ok && existencias.datos.length > 0 ? (
        <section style={{ marginTop: 'var(--e6)' }} aria-labelledby="t-existencias">
          <h2 id="t-existencias">Artículos por cantidad</h2>
          <div className="envoltura-tabla">
            <table className="tabla adaptable" data-testid="tabla-existencias">
              <caption className="oculto-visual">Existencias por cantidad</caption>
              <thead><tr><th>Artículo</th><th>Ubicación</th><th className="num">Cantidad</th></tr></thead>
              <tbody>
                {existencias.datos.map((e) => (
                  <tr key={`${e.skuId}-${e.ubicacionId}`} data-testid={`fila-existencia-${e.skuCodigo}`}>
                    <td data-label="Artículo"><span className="cod">{e.skuCodigo}</span> · {e.skuNombre}</td>
                    <td data-label="Ubicación">{e.ubicacionNombre}</td>
                    <td data-label="Cantidad" className="num">{numero(e.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </>
  )
}
