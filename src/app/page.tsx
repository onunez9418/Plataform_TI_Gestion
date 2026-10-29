// Inicio local: lista los usuarios de ejemplo (datos inventados de la semilla, A.6.1).
import Link from 'next/link'
import { Aviso } from '@/componentes/ui/Piezas'
import { misEmpresas } from '@/nucleo/acceso'

export const dynamic = 'force-dynamic'

const USUARIOS_EJEMPLO = [
  { correo: 'ceo@demo.local', quien: 'CEO de demostración', rol: 'Administrador', empresas: 'Alfa y Beta' },
  { correo: 'jefa@alfa.local', quien: 'Jefa de TI de Alfa', rol: 'Jefatura TI', empresas: 'Alfa' },
  { correo: 'tecnico@alfa.local', quien: 'Técnico de Alfa', rol: 'Técnico', empresas: 'Alfa' },
  { correo: 'consulta@alfa.local', quien: 'Consulta de Alfa', rol: 'Consulta (solo ver)', empresas: 'Alfa' },
  { correo: 'admin@beta.local', quien: 'Administrador de Beta', rol: 'Administrador', empresas: 'Beta' },
  { correo: 'tecnico@beta.local', quien: 'Técnico de Beta', rol: 'Técnico', empresas: 'Beta' },
] as const

async function empresasConSesion() {
  try {
    return await misEmpresas()
  } catch {
    return []
  }
}

export default async function Inicio() {
  const empresas = await empresasConSesion()
  return (
    <main id="contenido" className="centrado ancho" tabIndex={-1}>
      <h1>Plataforma de Gestión de Áreas de TI</h1>
      <p className="suave">
        Versión local de prueba. Todo lo que ve son <strong>datos inventados</strong> de dos empresas de ejemplo (Alfa y Beta).
        No use datos reales.
      </p>

      {empresas.length > 0 ? (
        <Aviso tipo="exito" titulo="Ya tiene una sesión abierta">
          <p>
            <Link className="btn primario" href="/empresas" data-testid="continuar-sesion">Continuar a mis empresas</Link>
          </p>
        </Aviso>
      ) : null}

      <section className="tarjeta" aria-labelledby="t-ejemplo">
        <h2 id="t-ejemplo">Usuarios de ejemplo</h2>
        <p className="suave">
          No hay contraseña. Elija un usuario, escriba su correo y la pantalla le mostrará un enlace para entrar.
        </p>
        <div className="envoltura-tabla">
          <table className="tabla adaptable">
            <thead>
              <tr><th>Correo</th><th>Quién es</th><th>Rol</th><th>Empresas</th><th><span className="oculto-visual">Acción</span></th></tr>
            </thead>
            <tbody>
              {USUARIOS_EJEMPLO.map((u) => (
                <tr key={u.correo} data-testid={`usuario-ejemplo-${u.correo}`}>
                  <td data-label="Correo" className="cod">{u.correo}</td>
                  <td data-label="Quién es">{u.quien}</td>
                  <td data-label="Rol">{u.rol}</td>
                  <td data-label="Empresas">{u.empresas}</td>
                  <td className="sin-titulo">
                    <Link className="btn chico primario" href={`/entrar?correo=${encodeURIComponent(u.correo)}`} data-testid={`usar-${u.correo}`}>
                      Entrar como este usuario
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="chica suave" style={{ marginTop: 'var(--e3)' }}>
          Mismos códigos en las dos empresas a propósito (por ejemplo LAP-0001): cada empresa ve solo lo suyo.
        </p>
      </section>

      <p style={{ marginTop: 'var(--e4)' }}>
        <Link className="btn" href="/entrar" data-testid="ir-entrar">Escribir otro correo</Link>
      </p>
    </main>
  )
}
