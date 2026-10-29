import { notFound } from 'next/navigation'
import { listarUbicaciones, listarProveedores, listarPersonas } from '@/modulos/catalogos'
import { cargarContexto, cargarDatos, puedeAlguno } from '@/app/_lib/sesion'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { CabeceraPantalla, Crear, ErrorDePantalla, Etiqueta, Vacio } from '@/componentes/ui/Piezas'
import { CATALOGOS, esTipoCatalogo, type TipoCatalogo } from '../tipos'
import { crearItem, editarItem } from './acciones'
import type { Contexto } from '@/nucleo/tipos-comunes'

export const dynamic = 'force-dynamic'

type Fila = { id: string; activo: boolean; valores: Record<string, string | null> }

async function cargarFilas(tipo: TipoCatalogo, ctx: Contexto): Promise<Fila[]> {
  switch (tipo) {
    case 'ubicaciones':
      return (await listarUbicaciones(ctx)).map((u) => ({ id: u.id, activo: u.activo, valores: { nombre: u.nombre, descripcion: u.descripcion } }))
    case 'proveedores':
      return (await listarProveedores(ctx)).map((p) => ({ id: p.id, activo: p.activo, valores: { nombre: p.nombre, documento: p.documento, contacto: p.contacto } }))
    case 'personas':
      return (await listarPersonas(ctx)).map((p) => ({ id: p.id, activo: p.activo, valores: { nombre: p.nombre, correo: p.correo, area: p.area } }))
  }
}

export default async function PaginaCatalogo({ params }: { params: Promise<{ empresa: string; tipo: string }> }) {
  const { empresa, tipo } = await params
  if (!esTipoCatalogo(tipo)) notFound()
  const config = CATALOGOS[tipo]

  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const filas = await cargarDatos(() => cargarFilas(tipo, ctx))
  if (!filas.ok) return <ErrorDePantalla mensaje={filas.error.mensaje} codigo={filas.error.codigo} />
  const puedeGestionar = puedeAlguno(ctx, config.gestionar)

  return (
    <>
      <CabeceraPantalla titulo={config.titulo} descripcion={config.descripcion} />

      {puedeGestionar ? (
        <Crear titulo={`Agregar ${config.singular}`} testid={`crear-${tipo}`}>
          <Formulario accion={crearItem.bind(null, empresa, tipo)} enviar="Guardar" testid={`form-crear-${tipo}`} exito="Guardado.">
            <div className="fila-form">
              {config.campos.map((cp) => (
                <Campo key={cp.nombre} nombre={cp.nombre} etiqueta={cp.etiqueta} requerido={'requerido' in cp ? cp.requerido : false} tipo={'tipo' in cp ? cp.tipo : 'text'} testid={`campo-${cp.nombre}`} />
              ))}
            </div>
          </Formulario>
        </Crear>
      ) : null}

      {filas.datos.length === 0 ? (
        <Vacio titulo={`Todavía no hay ${config.titulo.toLowerCase()}`} texto={puedeGestionar ? `Agregue ${config.singular === 'persona' ? 'la primera' : 'la primera'} arriba.` : undefined} />
      ) : (
        <div className="envoltura-tabla">
          <table className="tabla adaptable" data-testid={`tabla-${tipo}`}>
            <caption className="oculto-visual">{config.titulo}</caption>
            <thead>
              <tr>
                {config.campos.map((cp) => <th key={cp.nombre}>{cp.etiqueta}</th>)}
                <th>Estado</th>
                {puedeGestionar ? <th><span className="oculto-visual">Acciones</span></th> : null}
              </tr>
            </thead>
            <tbody>
              {filas.datos.map((f) => (
                <tr key={f.id} data-testid={`fila-${tipo}-${f.valores.nombre}`}>
                  {config.campos.map((cp) => (
                    <td key={cp.nombre} data-label={cp.etiqueta}>{f.valores[cp.nombre] ?? '-'}</td>
                  ))}
                  <td data-label="Estado"><Etiqueta texto={f.activo ? 'Activo' : 'Inactivo'} familia={f.activo ? 'exito' : 'final'} /></td>
                  {puedeGestionar ? (
                    <td className="sin-titulo">
                      <Crear titulo="Editar" testid={`editar-${tipo}-${f.valores.nombre}`}>
                        <Formulario accion={editarItem.bind(null, empresa, tipo, f.id)} enviar="Guardar cambios" testid={`form-editar-${tipo}-${f.valores.nombre}`} exito="Guardado." limpiar={false}>
                          <div className="fila-form">
                            {config.campos.map((cp) => (
                              <Campo key={cp.nombre} nombre={cp.nombre} etiqueta={cp.etiqueta} requerido={'requerido' in cp ? cp.requerido : false} tipo={'tipo' in cp ? cp.tipo : 'text'} valorInicial={f.valores[cp.nombre] ?? ''} testid={`campo-${cp.nombre}-${f.id}`} />
                            ))}
                          </div>
                          <Campo nombre="activo" etiqueta="Activo" tipo="checkbox" valorInicial={f.activo} testid={`campo-activo-${f.id}`} />
                        </Formulario>
                      </Crear>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
