import Link from 'next/link'
import { listarSkus } from '@/modulos/skus'
import { listarCategorias } from '@/modulos/categorias'
import type { Categoria } from '@/modulos/categorias'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { fecha, numero } from '@/app/_lib/formato'
import { P } from '@/componentes/estructura/permisos'
import { CabeceraPantalla, Crear, ErrorDePantalla, Etiqueta, Vacio } from '@/componentes/ui/Piezas'
import { crear } from './acciones'
import { FormularioSku } from './FormularioSku'

export const dynamic = 'force-dynamic'

function mostrar(valor: unknown, tipo: string | undefined): string {
  if (valor === undefined || valor === null || valor === '') return '-'
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  if (typeof valor === 'number') return numero(valor)
  if (tipo === 'fecha' && typeof valor === 'string') return fecha(valor)
  return String(valor)
}

export default async function PaginaSkus({ params, searchParams }: { params: Promise<{ empresa: string }>; searchParams: Promise<{ texto?: string; categoria?: string }> }) {
  const { empresa } = await params
  const { texto, categoria } = await searchParams
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const skus = await cargarDatos(() => listarSkus(ctx, { texto: texto || undefined, categoriaId: categoria || undefined }))
  if (!skus.ok) return <ErrorDePantalla mensaje={skus.error.mensaje} codigo={skus.error.codigo} />
  // Las categorías dan las etiquetas de los campos y llenan el formulario; si el servidor no las da, se sigue sin ellas.
  const cats = await cargarDatos(() => listarCategorias(ctx))
  const categorias: Categoria[] = cats.ok ? cats.datos : []
  const etiquetaCampo = new Map<string, { etiqueta: string; tipo: string }>()
  for (const cat of categorias) for (const cp of cat.campos) etiquetaCampo.set(`${cat.id}:${cp.clave}`, { etiqueta: cp.etiqueta, tipo: cp.tipo })

  const puedeCrear = puede(ctx, P.skusCrearEditar)
  const filtrado = Boolean(texto || categoria)

  return (
    <>
      <CabeceraPantalla titulo="Artículos (SKU)" descripcion="El maestro de artículos. El código sale solo de la categoría (por ejemplo LAP-0001) y se puede escribir uno propio." />

      {puedeCrear ? (
        categorias.length === 0 ? (
          <p className="suave" data-testid="sku-sin-categorias">Para crear un SKU primero hace falta una categoría.</p>
        ) : (
          <Crear titulo="Crear un SKU" testid="crear-sku">
            <FormularioSku
              categorias={categorias.map((cat) => ({ id: cat.id, nombre: cat.nombre, prefijo: cat.prefijo, campos: cat.campos.map(({ clave, etiqueta, tipo, opciones, obligatorio }) => ({ clave, etiqueta, tipo, opciones, obligatorio })) }))}
              puedeCodigoPropio={puede(ctx, P.skusCodigoPropio)}
              accion={crear.bind(null, empresa)}
            />
          </Crear>
        )
      ) : null}

      <form method="get" className="barra-herr" role="search" aria-label="Filtrar SKU" data-testid="filtro-skus">
        <div className="campo buscador">
          <label htmlFor="f-texto">Buscar por código o nombre</label>
          <input id="f-texto" type="search" name="texto" defaultValue={texto ?? ''} data-testid="filtro-texto" />
        </div>
        <div className="campo">
          <label htmlFor="f-cat">Categoría</label>
          <select id="f-cat" name="categoria" defaultValue={categoria ?? ''} data-testid="filtro-categoria">
            <option value="">Todas</option>
            {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
        </div>
        <button type="submit" className="btn" data-testid="filtrar">Filtrar</button>
        {filtrado ? <Link className="btn fantasma" href={`/e/${empresa}/skus`} data-testid="limpiar-filtro">Quitar filtros</Link> : null}
      </form>

      {skus.datos.length === 0 ? (
        <Vacio titulo={filtrado ? 'Ningún SKU coincide con el filtro' : 'Todavía no hay SKU'} texto={filtrado ? 'Pruebe con otra búsqueda.' : undefined} />
      ) : (
        <div className="envoltura-tabla">
          <table className="tabla adaptable" data-testid="tabla-skus">
            <caption className="oculto-visual">Artículos</caption>
            <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Control</th><th>Datos</th></tr></thead>
            <tbody>
              {skus.datos.map((s) => (
                <tr key={s.id} data-testid={`fila-sku-${s.codigo}`}>
                  <td data-label="Código">
                    <span className="cod" data-testid={`codigo-${s.codigo}`}>{s.codigo}</span>{' '}
                    {s.codigoPropio ? <Etiqueta texto="Código propio" familia="sensible" /> : null}
                  </td>
                  <td data-label="Nombre">{s.nombre}</td>
                  <td data-label="Categoría">{s.categoriaNombre}</td>
                  <td data-label="Control"><Etiqueta texto={s.control === 'serie' ? 'Por serie' : 'Por cantidad'} familia={s.control === 'serie' ? 'curso' : 'neutro'} /></td>
                  <td data-label="Datos">
                    {Object.keys(s.valores).length === 0 ? '-' : (
                      <ul style={{ margin: 0, paddingLeft: 'var(--e4)', textAlign: 'left' }}>
                        {Object.entries(s.valores).map(([clave, valor]) => {
                          const def = etiquetaCampo.get(`${s.categoriaId}:${clave}`)
                          return <li key={clave}>{def?.etiqueta ?? clave}: {mostrar(valor, def?.tipo)}</li>
                        })}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
