import { listarUsuarios } from '@/modulos/usuarios'
import { listarRoles } from '@/modulos/roles'
import { cargarContexto, cargarDatos, puede } from '@/app/_lib/sesion'
import { fecha } from '@/app/_lib/formato'
import { P } from '@/componentes/estructura/permisos'
import { BotonAccion } from '@/componentes/ui/BotonAccion'
import { CabeceraPantalla, Crear, ErrorDePantalla, Etiqueta, Vacio } from '@/componentes/ui/Piezas'
import { cambiarRolDe, invitar, suspenderA } from './acciones'
import { CambiarRolFila } from './CambiarRolFila'
import { FormularioInvitar } from './FormularioInvitar'

export const dynamic = 'force-dynamic'

export default async function PaginaUsuarios({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa } = await params
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const { ctx } = c

  const usuarios = await cargarDatos(() => listarUsuarios(ctx))
  if (!usuarios.ok) return <ErrorDePantalla mensaje={usuarios.error.mensaje} codigo={usuarios.error.codigo} />

  const puedeInvitar = puede(ctx, P.usuariosInvitar)
  const puedeCambiarRol = puede(ctx, P.usuariosCambiarRol)
  const puedeSuspender = puede(ctx, P.usuariosSuspender)
  // La lista de roles solo hace falta para invitar o cambiar de rol; si el servidor no la da, esas acciones no se ofrecen.
  const roles = puedeInvitar || puedeCambiarRol ? await cargarDatos(() => listarRoles(ctx)) : null
  const listaRoles = roles && roles.ok ? roles.datos.map((r) => ({ id: r.id, nombre: r.nombre })) : []

  return (
    <>
      <CabeceraPantalla titulo="Usuarios" descripcion="Quién entra a esta empresa y con qué rol. Los accesos se dan con un enlace, sin contraseña." />

      {puedeInvitar && listaRoles.length > 0 ? (
        <Crear titulo="Invitar a un usuario" testid="crear-usuario">
          <FormularioInvitar roles={listaRoles} accion={invitar.bind(null, empresa)} />
        </Crear>
      ) : null}

      {usuarios.datos.length === 0 ? (
        <Vacio titulo="Todavía no hay usuarios" texto="Invite al primero para que pueda entrar." />
      ) : (
        <div className="envoltura-tabla">
          <table className="tabla adaptable" data-testid="tabla-usuarios">
            <caption className="oculto-visual">Usuarios de la empresa</caption>
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Desde</th><th><span className="oculto-visual">Acciones</span></th></tr>
            </thead>
            <tbody>
              {usuarios.datos.map((u) => (
                <tr key={u.usuarioId} data-testid={`fila-usuario-${u.correo}`}>
                  <td data-label="Nombre">{u.nombre}</td>
                  <td data-label="Correo" className="cod">{u.correo}</td>
                  <td data-label="Rol" data-testid={`rol-actual-${u.correo}`}>{u.rolNombre}</td>
                  <td data-label="Estado">
                    <Etiqueta texto={u.estado === 'activo' ? 'Activo' : 'Suspendido'} familia={u.estado === 'activo' ? 'exito' : 'final'} />
                  </td>
                  <td data-label="Desde">{fecha(u.desde)}</td>
                  <td className="sin-titulo">
                    <div className="acciones-fila">
                      {puedeCambiarRol && listaRoles.length > 0 ? (
                        <CambiarRolFila
                          usuarioId={u.usuarioId}
                          clave={u.correo}
                          rolActual={u.rolId}
                          roles={listaRoles}
                          etiqueta={u.nombre}
                          accion={cambiarRolDe.bind(null, empresa)}
                        />
                      ) : null}
                      {puedeSuspender && u.estado === 'activo' ? (
                        <BotonAccion
                          texto="Suspender"
                          clase="btn chico peligro-suave"
                          testid={`suspender-${u.correo}`}
                          confirmar={`¿Suspender a ${u.nombre}? No podrá entrar hasta que se le vuelva a dar acceso.`}
                          accion={suspenderA.bind(null, empresa, u.usuarioId)}
                        />
                      ) : null}
                    </div>
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
