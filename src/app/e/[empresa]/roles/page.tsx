import { listarRoles, catalogoPermisos } from '@/modulos/roles'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { P } from '@/componentes/estructura/permisos'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { CabeceraPantalla, Crear, ErrorDePantalla, Etiqueta, Vacio } from '@/componentes/ui/Piezas'
import { SelectorPermisos } from '@/componentes/ui/SelectorPermisos'
import { crear, editar } from './acciones'

export const dynamic = 'force-dynamic'

export default async function PaginaRoles({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa } = await params
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const roles = await cargarDatos(() => listarRoles(ctx))
  if (!roles.ok) return <ErrorDePantalla mensaje={roles.error.mensaje} codigo={roles.error.codigo} />

  const puedeAdministrar = puede(ctx, P.rolesAdministrar)
  const catalogo = catalogoPermisos()
  const etiquetaDe = new Map(catalogo.map((p) => [p.clave, p.etiqueta]))

  return (
    <>
      <CabeceraPantalla titulo="Roles y permisos" descripcion="Un rol es un conjunto de permisos. Cada empresa define los suyos." />

      {puedeAdministrar ? (
        <Crear titulo="Crear un rol" testid="crear-rol">
          <Formulario accion={crear.bind(null, empresa)} enviar="Crear rol" testid="form-crear-rol" exito="Rol creado.">
            <Campo nombre="nombre" etiqueta="Nombre del rol" requerido testid="campo-nombre-rol" placeholder="Solo lectura" />
            <p className="suave chica">Marque lo que este rol podrá hacer. Para «Solo lectura», marque únicamente los permisos de ver.</p>
            <SelectorPermisos catalogo={catalogo} prefijoId="nuevo" />
          </Formulario>
        </Crear>
      ) : null}

      {roles.datos.length === 0 ? (
        <Vacio titulo="No hay roles" />
      ) : (
        <div className="pila" data-testid="lista-roles">
          {roles.datos.map((r) => (
            <section className="tarjeta" key={r.id} data-testid={`rol-${r.nombre}`} aria-label={`Rol ${r.nombre}`}>
              <div className="fila entre">
                <h2 className="sin-margen">{r.nombre}</h2>
                <div className="fila">
                  {r.esBase ? <Etiqueta texto="Rol de ejemplo" familia="neutro" /> : null}
                  <Etiqueta texto={`${r.usuarios} ${r.usuarios === 1 ? 'usuario' : 'usuarios'}`} familia="curso" />
                  <Etiqueta texto={`${r.permisos.length} permisos`} familia="neutro" />
                </div>
              </div>
              <details style={{ marginTop: 'var(--e3)' }}>
                <summary>Ver permisos</summary>
                {r.permisos.length === 0 ? (
                  <p className="suave">Este rol no tiene permisos.</p>
                ) : (
                  <ul>
                    {r.permisos.map((p) => (
                      <li key={p}>{etiquetaDe.get(p) ?? p} <span className="suave cod">({p})</span></li>
                    ))}
                  </ul>
                )}
              </details>
              {puedeAdministrar ? (
                <Crear titulo="Editar este rol" testid={`editar-rol-${r.nombre}`}>
                  <Formulario accion={editar.bind(null, empresa, r.id)} enviar="Guardar cambios" testid={`form-editar-rol-${r.nombre}`} exito="Rol actualizado." limpiar={false}>
                    <Campo nombre="nombre" etiqueta="Nombre del rol" requerido valorInicial={r.nombre} testid={`campo-nombre-${r.nombre}`} />
                    <SelectorPermisos catalogo={catalogo} marcados={r.permisos} prefijoId={`r-${r.id}`} />
                  </Formulario>
                </Crear>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </>
  )
}
