import Link from 'next/link'
import { notFound } from 'next/navigation'
import { obtenerOrden } from '@/modulos/compras'
import { listarUbicaciones } from '@/modulos/catalogos'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { dinero, fechaHora, numero } from '@/app/_lib/formato'
import { COMPRAS_ACTIVAS } from '@/componentes/estructura/menu'
import { P } from '@/componentes/estructura/permisos'
import { BotonAccion } from '@/componentes/ui/BotonAccion'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { Aviso, CabeceraPantalla, ErrorDePantalla, Etiqueta } from '@/componentes/ui/Piezas'
import { EstadoOrden } from '@/componentes/ui/EstadoOrden'
import { aprobar, enviar, rechazar, recibir } from './acciones'
import { FormularioRecibir } from './FormularioRecibir'

export const dynamic = 'force-dynamic'

const PASOS = [
  { estado: 'borrador', texto: 'Borrador' },
  { estado: 'por_aprobar', texto: 'Por aprobar' },
  { estado: 'aprobada', texto: 'Aprobada' },
  { estado: 'recibida', texto: 'Recibida' },
] as const

function posicion(estado: string): number {
  if (estado === 'recibida_parcial') return 3
  const i = PASOS.findIndex((p) => p.estado === estado)
  return i < 0 ? 0 : i
}

export default async function FichaOrden({ params }: { params: Promise<{ empresa: string; id: string }> }) {
  if (!COMPRAS_ACTIVAS) notFound()
  const { empresa, id } = await params
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const r = await cargarDatos(() => obtenerOrden(ctx, id))
  if (!r.ok) return <ErrorDePantalla mensaje={r.error.mensaje} codigo={r.error.codigo} />
  const o = r.datos

  const puedeEnviar = puede(ctx, P.comprasPreparar) && o.estado === 'borrador'
  const puedeDecidir = puede(ctx, P.comprasAprobar) && o.estado === 'por_aprobar'
  const puedeRecibir = puede(ctx, P.comprasRecibir) && (o.estado === 'aprobada' || o.estado === 'recibida_parcial')
  const ubicaciones = puedeRecibir ? await cargarDatos(() => listarUbicaciones(ctx)) : null
  const pendientes = o.lineas.filter((l) => l.pendiente > 0)
  const actual = posicion(o.estado)

  return (
    <>
      <p className="migas"><Link href={`/e/${empresa}/compras`}>Órdenes de compra</Link> / {o.numero}</p>
      <CabeceraPantalla titulo={`Orden ${o.numero}`} acciones={<EstadoOrden estado={o.estado} />} />

      {o.estado === 'rechazada' ? (
        <Aviso tipo="alerta" titulo="Esta orden fue rechazada" testid="orden-rechazada">
          <p className="sin-margen">{o.aprobaciones.find((a) => a.decision === 'rechazada')?.motivo ?? 'Sin motivo indicado.'}</p>
        </Aviso>
      ) : (
        <ol className="flujo" aria-label="Avance de la orden" data-testid="flujo-orden" style={{ padding: 0 }}>
          {PASOS.map((p, i) => (
            <li key={p.estado} className={`paso${i < actual ? ' hecho' : i === actual ? ' actual' : ''}`} aria-current={i === actual ? 'step' : undefined} style={{ listStyle: 'none' }}>
              {p.estado === 'recibida' && o.estado === 'recibida_parcial' ? 'Recibida en parte' : p.texto}
            </li>
          ))}
        </ol>
      )}

      <section className="cab-ficha" aria-label="Datos de la orden" data-testid="ficha-orden">
        <dl className="datos">
          <div className="dato"><dt>Proveedor</dt><dd data-testid="orden-proveedor">{o.proveedorNombre}</dd></div>
          <div className="dato"><dt>Total</dt><dd data-testid="orden-total">{dinero(o.total, o.moneda)}</dd></div>
          <div className="dato"><dt>Preparada por</dt><dd data-testid="orden-preparada-por">{o.preparadaPorNombre ?? '-'}</dd></div>
          <div className="dato"><dt>Creada</dt><dd>{fechaHora(o.creadoEn)}</dd></div>
          <div className="dato"><dt>Enviada a aprobación</dt><dd>{fechaHora(o.enviadaEn)}</dd></div>
        </dl>
      </section>

      <h2>Qué se compra</h2>
      <div className="envoltura-tabla">
        <table className="tabla adaptable" data-testid="tabla-lineas">
          <caption className="oculto-visual">Líneas de la orden</caption>
          <thead><tr><th>Artículo</th><th>Control</th><th className="num">Pedido</th><th className="num">Recibido</th><th className="num">Falta</th><th className="num">Precio</th></tr></thead>
          <tbody>
            {o.lineas.map((l) => (
              <tr key={l.id} data-testid={`linea-${l.skuCodigo}`}>
                <td data-label="Artículo"><span className="cod">{l.skuCodigo}</span> · {l.skuNombre}</td>
                <td data-label="Control"><Etiqueta texto={l.control === 'serie' ? 'Por serie' : 'Por cantidad'} familia={l.control === 'serie' ? 'curso' : 'neutro'} /></td>
                <td data-label="Pedido" className="num">{numero(l.cantidad)}</td>
                <td data-label="Recibido" className="num">{numero(l.cantidadRecibida)}</td>
                <td data-label="Falta" className="num">{numero(l.pendiente)}</td>
                <td data-label="Precio" className="num">{dinero(l.precioUnitario, o.moneda)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {puedeEnviar ? (
        <section className="tarjeta" style={{ marginTop: 'var(--e4)' }} aria-labelledby="t-enviar">
          <h2 id="t-enviar">Enviar a aprobación</h2>
          <p className="suave">Cuando la envíe, otra persona con permiso de aprobar deberá revisarla.</p>
          <BotonAccion texto="Enviar a aprobación" clase="btn primario" testid="enviar-aprobacion" accion={enviar.bind(null, empresa, id)} />
        </section>
      ) : null}

      {puedeDecidir ? (
        <section className="tarjeta" style={{ marginTop: 'var(--e4)' }} aria-labelledby="t-decidir">
          <h2 id="t-decidir">Aprobar o rechazar</h2>
          <Aviso tipo="info">
            <p className="sin-margen">Regla de la plataforma: nadie aprueba una orden que preparó. Si usted la preparó, otra persona debe aprobarla.</p>
          </Aviso>
          <div className="rejilla dos">
            <div>
              <BotonAccion texto="Aprobar la orden" clase="btn primario" testid="aprobar-orden" accion={aprobar.bind(null, empresa, id)} />
            </div>
            <Formulario accion={rechazar.bind(null, empresa, id)} enviar="Rechazar la orden" testid="form-rechazar" limpiar={false}>
              <Campo nombre="motivo" etiqueta="Motivo del rechazo" tipo="textarea" filas={3} requerido testid="campo-motivo" />
            </Formulario>
          </div>
        </section>
      ) : null}

      {puedeRecibir ? (
        <section className="tarjeta" style={{ marginTop: 'var(--e4)' }} aria-labelledby="t-recibir">
          <h2 id="t-recibir">Recibir mercadería</h2>
          {pendientes.length === 0 ? (
            <p className="suave">No queda nada pendiente de recibir.</p>
          ) : ubicaciones && !ubicaciones.ok ? (
            <ErrorDePantalla mensaje={ubicaciones.error.mensaje} codigo={ubicaciones.error.codigo} />
          ) : (
            <FormularioRecibir
              lineas={pendientes.map((l) => ({ id: l.id, skuCodigo: l.skuCodigo, skuNombre: l.skuNombre, control: l.control, pendiente: l.pendiente }))}
              ubicaciones={(ubicaciones && ubicaciones.ok ? ubicaciones.datos : []).filter((u) => u.activo).map((u) => ({ id: u.id, nombre: u.nombre }))}
              accion={recibir.bind(null, empresa, id)}
            />
          )}
        </section>
      ) : null}

      {o.aprobaciones.length > 0 ? (
        <section style={{ marginTop: 'var(--e6)' }} aria-labelledby="t-decisiones">
          <h2 id="t-decisiones">Decisiones</h2>
          <ol className="linea" data-testid="decisiones-orden">
            {o.aprobaciones.map((a, i) => (
              <li key={i}>
                <strong>{a.decision === 'aprobada' ? 'Aprobada' : 'Rechazada'}</strong> por {a.aprobadorNombre ?? 'alguien'}
                {a.motivo ? ` · ${a.motivo}` : ''}
                <div className="cuando">{fechaHora(a.creadoEn)}</div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {o.recepciones.length > 0 ? (
        <section style={{ marginTop: 'var(--e6)' }} aria-labelledby="t-recepciones">
          <h2 id="t-recepciones">Recepciones</h2>
          <ol className="linea" data-testid="recepciones-orden">
            {o.recepciones.map((rp) => (
              <li key={rp.id} data-testid={`recepcion-${rp.numero}`}>
                <strong className="cod">{rp.numero}</strong> · quedó en {rp.ubicacionNombre}
                <ul>
                  {rp.lineas.map((l, i) => (
                    <li key={i}>{l.skuCodigo} · {l.cantidad}{l.series.length > 0 ? ` (series: ${l.series.join(', ')})` : ''}</li>
                  ))}
                </ul>
                <div className="cuando">{fechaHora(rp.creadoEn)}{rp.recibidaPorNombre ? ` · por ${rp.recibidaPorNombre}` : ''}</div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  )
}
