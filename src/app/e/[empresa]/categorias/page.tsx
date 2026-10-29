import { listarCategorias } from '@/modulos/categorias'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { P } from '@/componentes/estructura/permisos'
import { CabeceraPantalla, Crear, ErrorDePantalla, Etiqueta, Vacio } from '@/componentes/ui/Piezas'
import { agregar, crear } from './acciones'
import { FormularioAgregarCampo, FormularioCategoria } from './Formularios'

export const dynamic = 'force-dynamic'

const TIPOS: Record<string, string> = { texto: 'Texto', numero: 'Número', fecha: 'Fecha', lista: 'Lista de opciones', si_no: 'Sí / No' }

export default async function PaginaCategorias({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa } = await params
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const categorias = await cargarDatos(() => listarCategorias(ctx))
  if (!categorias.ok) return <ErrorDePantalla mensaje={categorias.error.mensaje} codigo={categorias.error.codigo} />
  const puedeGestionar = puede(ctx, P.categoriasGestionar)

  return (
    <>
      <CabeceraPantalla titulo="Categorías" descripcion="Cada categoría tiene sus propios campos (por ejemplo, las laptops tienen procesador y memoria). Esos campos aparecen solos al crear un SKU." />

      {puedeGestionar ? (
        <Crear titulo="Crear una categoría" testid="crear-categoria">
          <FormularioCategoria accion={crear.bind(null, empresa)} />
        </Crear>
      ) : null}

      {categorias.datos.length === 0 ? (
        <Vacio titulo="Todavía no hay categorías" texto={puedeGestionar ? 'Cree la primera arriba.' : undefined} />
      ) : (
        <div className="pila" data-testid="lista-categorias">
          {categorias.datos.map((cat) => (
            <section className="tarjeta" key={cat.id} data-testid={`categoria-${cat.nombre}`} aria-label={`Categoría ${cat.nombre}`}>
              <div className="fila entre">
                <h2 className="sin-margen">{cat.nombre}</h2>
                <div className="fila">
                  <Etiqueta texto={`Prefijo ${cat.prefijo}`} familia="neutro" />
                  <Etiqueta texto={`${cat.cantidadSkus} ${cat.cantidadSkus === 1 ? 'SKU' : 'SKU'}`} familia="curso" />
                </div>
              </div>
              {cat.campos.length === 0 ? (
                <p className="suave">Esta categoría no tiene campos propios.</p>
              ) : (
                <div className="envoltura-tabla" style={{ marginTop: 'var(--e3)' }}>
                  <table className="tabla adaptable">
                    <caption className="oculto-visual">Campos de {cat.nombre}</caption>
                    <thead><tr><th>Campo</th><th>Tipo</th><th>Opciones</th><th>Obligatorio</th></tr></thead>
                    <tbody>
                      {cat.campos.map((cp) => (
                        <tr key={cp.id} data-testid={`campo-${cat.nombre}-${cp.clave}`}>
                          <td data-label="Campo">{cp.etiqueta}</td>
                          <td data-label="Tipo">{TIPOS[cp.tipo] ?? cp.tipo}</td>
                          <td data-label="Opciones">{cp.opciones && cp.opciones.length > 0 ? cp.opciones.join(', ') : '-'}</td>
                          <td data-label="Obligatorio">{cp.obligatorio ? 'Sí' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {puedeGestionar ? (
                <div style={{ marginTop: 'var(--e3)' }}>
                  <Crear titulo="Agregar un campo a esta categoría" testid={`agregar-campo-${cat.nombre}`}>
                    <FormularioAgregarCampo categoriaId={cat.id} nombreCategoria={cat.nombre} accion={agregar.bind(null, empresa, cat.id)} />
                  </Crear>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </>
  )
}
