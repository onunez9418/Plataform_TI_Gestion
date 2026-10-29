import Link from 'next/link'
import { notFound } from 'next/navigation'
import { listarOrdenes } from '@/modulos/compras'
import { listarProveedores } from '@/modulos/catalogos'
import { listarSkus } from '@/modulos/skus'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { dinero, fecha } from '@/app/_lib/formato'
import { COMPRAS_ACTIVAS } from '@/componentes/estructura/menu'
import { P } from '@/componentes/estructura/permisos'
import { CabeceraPantalla, Crear, ErrorDePantalla, Vacio } from '@/componentes/ui/Piezas'
import { EstadoOrden } from '@/componentes/ui/EstadoOrden'
import { crear } from './acciones'
import { FormularioOrden } from './FormularioOrden'

export const dynamic = 'force-dynamic'

export default async function PaginaCompras({ params }: { params: Promise<{ empresa: string }> }) {
  if (!COMPRAS_ACTIVAS) notFound()
  const { empresa } = await params
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const ordenes = await cargarDatos(() => listarOrdenes(ctx))
  if (!ordenes.ok) return <ErrorDePantalla mensaje={ordenes.error.mensaje} codigo={ordenes.error.codigo} />

  const puedePreparar = puede(ctx, P.comprasPreparar)
  const [proveedores, skus] = puedePreparar
    ? await Promise.all([cargarDatos(() => listarProveedores(ctx)), cargarDatos(() => listarSkus(ctx))])
    : [null, null]
  const listaProv = proveedores && proveedores.ok ? proveedores.datos.filter((p) => p.activo) : []
  const listaSkus = skus && skus.ok ? skus.datos.filter((s) => s.activo) : []

  return (
    <>
      <CabeceraPantalla titulo="Órdenes de compra" descripcion="Se prepara la orden, otra persona la aprueba y al llegar la mercadería se recibe y nacen los equipos." />

      {puedePreparar ? (
        listaProv.length === 0 || listaSkus.length === 0 ? (
          <p className="suave" data-testid="compras-sin-base">Para preparar una orden hacen falta al menos un proveedor y un SKU.</p>
        ) : (
          <Crear titulo="Preparar una orden de compra" testid="crear-orden">
            <FormularioOrden empresa={empresa} proveedores={listaProv.map((p) => ({ id: p.id, nombre: p.nombre }))} skus={listaSkus.map((s) => ({ id: s.id, codigo: s.codigo, nombre: s.nombre }))} accion={crear.bind(null, empresa)} />
          </Crear>
        )
      ) : null}

      {ordenes.datos.length === 0 ? (
        <Vacio titulo="Todavía no hay órdenes de compra" texto={puedePreparar ? 'Prepare la primera arriba.' : undefined} />
      ) : (
        <div className="envoltura-tabla">
          <table className="tabla adaptable" data-testid="tabla-ordenes">
            <caption className="oculto-visual">Órdenes de compra</caption>
            <thead><tr><th>Número</th><th>Proveedor</th><th>Estado</th><th className="num">Total</th><th>Preparada por</th><th>Fecha</th><th><span className="oculto-visual">Abrir</span></th></tr></thead>
            <tbody>
              {ordenes.datos.map((o) => (
                <tr key={o.id} data-testid={`fila-orden-${o.numero}`}>
                  <td data-label="Número" className="cod">{o.numero}</td>
                  <td data-label="Proveedor">{o.proveedorNombre}</td>
                  <td data-label="Estado"><EstadoOrden estado={o.estado} /></td>
                  <td data-label="Total" className="num">{dinero(o.total, o.moneda)}</td>
                  <td data-label="Preparada por">{o.preparadaPorNombre ?? '-'}</td>
                  <td data-label="Fecha">{fecha(o.creadoEn)}</td>
                  <td className="sin-titulo"><Link className="btn chico" href={`/e/${empresa}/compras/${o.id}`} data-testid={`abrir-orden-${o.numero}`}>Abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
