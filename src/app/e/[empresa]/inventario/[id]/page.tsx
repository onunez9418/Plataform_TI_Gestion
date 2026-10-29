import Link from 'next/link'
import { obtenerActivo, historialActivo } from '@/modulos/inventario'
import { listarPersonas, listarUbicaciones } from '@/modulos/catalogos'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { fechaHora } from '@/app/_lib/formato'
import { P } from '@/componentes/estructura/permisos'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { CabeceraPantalla, ErrorDePantalla, Vacio } from '@/componentes/ui/Piezas'
import { EstadoActivo } from '@/componentes/ui/EstadoActivo'
import { asignar, devolver } from './acciones'

export const dynamic = 'force-dynamic'

const TIPO_MOVIMIENTO: Record<string, string> = { registro: 'Registro', asignacion: 'Asignación', devolucion: 'Devolución' }

export default async function FichaActivo({ params }: { params: Promise<{ empresa: string; id: string }> }) {
  const { empresa, id } = await params
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const activo = await cargarDatos(() => obtenerActivo(ctx, id))
  if (!activo.ok) return <ErrorDePantalla mensaje={activo.error.mensaje} codigo={activo.error.codigo} />
  const a = activo.datos
  const [historial, personas, ubicaciones] = await Promise.all([
    cargarDatos(() => historialActivo(ctx, id)),
    cargarDatos(() => listarPersonas(ctx)),
    cargarDatos(() => listarUbicaciones(ctx)),
  ])

  const puedeAsignar = puede(ctx, P.entregasCrear) && a.estado === 'en_stock' && personas.ok
  const puedeDevolver = puede(ctx, P.entregasDevolver) && a.estado === 'asignado' && ubicaciones.ok

  return (
    <>
      <p className="migas"><Link href={`/e/${empresa}/inventario`}>Inventario</Link> / {a.serie}</p>
      <CabeceraPantalla titulo={`${a.skuNombre} · ${a.serie}`} />

      <section className="cab-ficha" aria-label="Datos del equipo" data-testid="ficha-activo">
        <dl className="datos">
          <div className="dato"><dt>Código del artículo</dt><dd className="cod">{a.skuCodigo}</dd></div>
          <div className="dato"><dt>Serie</dt><dd className="cod" data-testid="ficha-serie">{a.serie}</dd></div>
          <div className="dato"><dt>Estado</dt><dd><EstadoActivo estado={a.estado} /></dd></div>
          <div className="dato"><dt>Ubicación</dt><dd data-testid="ficha-ubicacion">{a.ubicacionNombre}</dd></div>
          <div className="dato"><dt>Asignado a</dt><dd data-testid="ficha-persona">{a.personaNombre ?? 'Nadie'}</dd></div>
        </dl>
      </section>

      <div className="rejilla dos">
        {puedeAsignar && personas.ok ? (
          <section className="tarjeta" aria-labelledby="t-asignar">
            <h2 id="t-asignar">Asignar a una persona</h2>
            <Formulario accion={asignar.bind(null, empresa, id)} enviar="Asignar" testid="form-asignar" exito="Asignado." limpiar={false}>
              <Campo nombre="personaId" etiqueta="Persona" tipo="select" requerido vacio="Elija una persona" opciones={personas.datos.filter((p) => p.activo).map((p) => ({ valor: p.id, etiqueta: p.nombre }))} testid="campo-persona" />
            </Formulario>
          </section>
        ) : null}
        {puedeDevolver && ubicaciones.ok ? (
          <section className="tarjeta" aria-labelledby="t-devolver">
            <h2 id="t-devolver">Registrar la devolución</h2>
            <Formulario accion={devolver.bind(null, empresa, id)} enviar="Devolver" testid="form-devolver" exito="Devuelto." limpiar={false}>
              <Campo nombre="ubicacionId" etiqueta="Dónde queda guardado" tipo="select" requerido vacio="Elija la ubicación" opciones={ubicaciones.datos.filter((u) => u.activo).map((u) => ({ valor: u.id, etiqueta: u.nombre }))} testid="campo-ubicacion" />
            </Formulario>
          </section>
        ) : null}
      </div>

      <section style={{ marginTop: 'var(--e6)' }} aria-labelledby="t-historial">
        <h2 id="t-historial">Historial</h2>
        {!historial.ok ? (
          <ErrorDePantalla mensaje={historial.error.mensaje} codigo={historial.error.codigo} />
        ) : historial.datos.length === 0 ? (
          <Vacio titulo="Sin movimientos todavía" />
        ) : (
          <ol className="linea" data-testid="historial-activo">
            {historial.datos.map((h) => (
              <li key={h.id} data-testid={`historial-${h.tipo}`}>
                <strong>{TIPO_MOVIMIENTO[h.tipo] ?? h.tipo}</strong>
                {h.personaNombre ? <> · {h.personaNombre}</> : null}
                {h.ubicacionNombre ? <> · {h.ubicacionNombre}</> : null}
                <div className="cuando">{fechaHora(h.creadoEn)}{h.autorNombre ? ` · por ${h.autorNombre}` : ''}{h.motivo ? ` · ${h.motivo}` : ''}</div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}
